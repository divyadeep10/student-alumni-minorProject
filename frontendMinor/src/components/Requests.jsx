// src/components/Requests.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Requests = () => {
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionInProgress, setActionInProgress] = useState(null);
  const token = localStorage.getItem('token');

  const fetchRequests = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get('http://localhost:5000/api/alumni/requests', {
        headers: { 'Authorization': token }
      });
      setRequests(res.data.requests);
      setError('');
    } catch (err) {
      console.error(err);
      setError('Failed to load mentorship requests');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [token]);

  const handleRequest = async (requestId, action) => {
    setActionInProgress(requestId);
    try {
      const endpoint = action === 'accept' 
        ? 'http://localhost:5000/api/alumni/accept-request'
        : 'http://localhost:5000/api/alumni/reject-request';
      
      await axios.post(endpoint, { requestId }, {
        headers: { 'Authorization': token }
      });
      
      // Update the local state to reflect the change
      if (action === 'accept') {
        setRequests(prev => prev.map(req => 
          req._id === requestId ? { ...req, status: 'accepted' } : req
        ));
      } else {
        setRequests(prev => prev.filter(req => req._id !== requestId));
      }
    } catch (err) {
      console.error(err);
      setError(`Failed to ${action} request`);
    } finally {
      setActionInProgress(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-5 pt-24">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6 rounded-lg shadow-lg mb-8">
        <h2 className="text-3xl font-bold">Mentorship Requests</h2>
        <p className="mt-2 text-blue-100">Review and manage incoming mentorship requests from students</p>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded mb-6">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : requests.length === 0 ? (
        <div className="bg-gray-50 p-8 text-center rounded-lg border border-gray-200">
          <p className="text-gray-600">No pending mentorship requests at this time.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {requests.map((req) => (
            <div 
              key={req._id} 
              className="bg-white p-5 rounded-lg shadow-md border border-gray-200 transition-all duration-200 hover:shadow-lg"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">{req.student.name}</h3>
                  <p className="text-gray-600">{req.student.email}</p>
                  
                  {req.message && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-md border-l-4 border-blue-400">
                      <p className="text-gray-700 text-sm italic">{req.message}</p>
                    </div>
                  )}
                  
                  {req.student.interests && req.student.interests.length > 0 && (
                    <div className="mt-3">
                      <p className="text-sm text-gray-500 mb-1">Interests:</p>
                      <div className="flex flex-wrap gap-1">
                        {req.student.interests.map((interest, idx) => (
                          <span key={idx} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                            {interest}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium">
                  {req.status || 'Pending'}
                </div>
              </div>
              
              <div className="mt-4 flex space-x-2">
                <button 
                  onClick={() => handleRequest(req._id, 'accept')}
                  disabled={actionInProgress === req._id || req.status === 'accepted'}
                  className={`flex-1 py-2 rounded-md transition-colors duration-200 ${
                    actionInProgress === req._id 
                      ? 'bg-gray-300 cursor-wait' 
                      : req.status === 'accepted'
                        ? 'bg-green-100 text-green-800 cursor-default'
                        : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  {actionInProgress === req._id ? 'Processing...' : 
                   req.status === 'accepted' ? 'Accepted' : 'Accept'}
                </button>
                
                {req.status !== 'accepted' && (
                  <button 
                    onClick={() => handleRequest(req._id, 'reject')}
                    disabled={actionInProgress === req._id}
                    className={`flex-1 py-2 rounded-md transition-colors duration-200 ${
                      actionInProgress === req._id 
                        ? 'bg-gray-300 cursor-wait' 
                        : 'bg-red-600 text-white hover:bg-red-700'
                    }`}
                  >
                    Decline
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Requests;
