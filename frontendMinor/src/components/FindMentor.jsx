// src/components/FindMentor.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const FindMentor = () => {
  const [mentors, setMentors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [requestStatus, setRequestStatus] = useState({}); // Store status for each mentor
  const [requestInProgress, setRequestInProgress] = useState(null);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchMentors = async () => {
      setIsLoading(true);
      try {
        const res = await axios.get('http://localhost:5000/api/alumni/top-alumni', {
          headers: { Authorization: token },
        });
        setMentors(res.data.topAlumni);
        
        // Fetch status for each mentor
        const statusPromises = res.data.topAlumni.map(mentor => 
          axios.get(`http://localhost:5000/api/student/request-status/${mentor._id}`, {
            headers: { Authorization: token },
          })
        );
        
        const statusResults = await Promise.all(statusPromises);
        
        // Create a map of mentor ID to request status
        const statusMap = {};
        res.data.topAlumni.forEach((mentor, index) => {
          statusMap[mentor._id] = statusResults[index].data.status;
        });
        
        setRequestStatus(statusMap);
        setError('');
      } catch (err) {
        console.error(err);
        setError('Unable to load mentors. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchMentors();
  }, [token]);

  const handleRequestMentor = async (mentorId) => {
    setRequestInProgress(mentorId);
    try {
      const res = await axios.post(
        'http://localhost:5000/api/student/request-mentor',
        { alumniId: mentorId },
        { headers: { Authorization: token } }
      );
      
      // Update the request status for this mentor
      setRequestStatus(prev => ({
        ...prev,
        [mentorId]: res.data.status
      }));
      
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to send request');
    } finally {
      setRequestInProgress(null);
    }
  };

  const getButtonText = (mentorId) => {
    const status = requestStatus[mentorId];
    
    if (requestInProgress === mentorId) {
      return 'Sending...';
    }
    
    switch(status) {
      case 'pending':
        return 'Request Pending';
      case 'accepted':
        return 'Connected';
      case 'rejected':
        return 'Request Again';
      default:
        return 'Request Mentorship';
    }
  };

  const getButtonClass = (mentorId) => {
    const status = requestStatus[mentorId];
    
    if (requestInProgress === mentorId) {
      return 'bg-gray-500 cursor-wait';
    }
    
    switch(status) {
      case 'pending':
        return 'bg-yellow-500 hover:bg-yellow-600 cursor-not-allowed';
      case 'accepted':
        return 'bg-green-500 hover:bg-green-600 cursor-not-allowed';
      case 'rejected':
        return 'bg-red-500 hover:bg-red-600';
      default:
        return 'bg-blue-600 hover:bg-blue-700';
    }
  };

  const getStatusBadge = (mentorId) => {
    const status = requestStatus[mentorId];
    
    if (!status || status === 'none') return null;
    
    const badgeClasses = {
      pending: "bg-yellow-100 text-yellow-800 border border-yellow-300",
      accepted: "bg-green-100 text-green-800 border border-green-300",
      rejected: "bg-red-100 text-red-800 border border-red-300"
    };
    
    const statusText = {
      pending: "Request Pending",
      accepted: "Connected",
      rejected: "Request Declined"
    };
    
    return (
      <span className={`text-xs px-2 py-1 rounded-full ${badgeClasses[status]}`}>
        {statusText[status]}
      </span>
    );
  };

  const isButtonDisabled = (mentorId) => {
    const status = requestStatus[mentorId];
    return requestInProgress === mentorId || 
           status === 'pending' || 
           status === 'accepted';
  };

  const filteredMentors = mentors.filter((mentor) =>
    mentor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (Array.isArray(mentor.expertiseAreas) && mentor.expertiseAreas.some(area => 
      area.toLowerCase().includes(searchTerm.toLowerCase())
    ))
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 to-indigo-900 pt-20 pb-10 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header Banner */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-2xl p-8 mb-10 text-white"
        >
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Find Your Mentor</h1>
              <p className="text-xl text-blue-200">Connect with experienced alumni who can guide your career journey</p>
            </div>
            <Link 
              to="/dashboard" 
              className="mt-4 md:mt-0 bg-white/20 hover:bg-white/30 text-white py-2 px-6 rounded-lg text-center font-medium transition-colors"
            >
              Back to Dashboard
            </Link>
          </div>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white/10 backdrop-blur-sm rounded-xl p-6 mb-8"
        >
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search by name or expertise..."
                className="w-full p-3 bg-white/5 border border-indigo-300/30 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-indigo-200"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <button className="bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-6 rounded-lg font-medium transition-colors">
                Filter
              </button>
              <button 
                className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-medium transition-colors"
                onClick={() => setSearchTerm('')}
              >
                Reset
              </button>
            </div>
          </div>
        </motion.div>

        {error && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-red-900/30 border-l-4 border-red-500 text-white p-4 rounded-lg mb-6"
          >
            <p>{error}</p>
          </motion.div>
        )}

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : filteredMentors.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16 bg-white/5 backdrop-blur-sm rounded-xl"
          >
            <svg className="w-16 h-16 text-indigo-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <p className="text-indigo-100 text-xl">No mentors found matching your search criteria.</p>
            <button 
              onClick={() => setSearchTerm('')} 
              className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-6 rounded-lg"
            >
              Clear Search
            </button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMentors.map((mentor, index) => (
              <motion.div
                key={mentor._id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="bg-white/10 backdrop-blur-sm rounded-xl overflow-hidden border border-indigo-300/20 hover:shadow-lg hover:shadow-indigo-500/10 transition-all"
              >
                <div className="h-2 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h2 className="text-xl font-semibold text-white mb-1">{mentor.name}</h2>
                      <p className="text-indigo-200 text-sm">{mentor.email}</p>
                    </div>
                    {getStatusBadge(mentor._id)}
                  </div>
                  
                  <div className="space-y-4 mb-6">
                    <div>
                      <h3 className="text-xs font-medium text-indigo-300 uppercase tracking-wider mb-2">Expertise</h3>
                      <div className="flex flex-wrap gap-1">
                        {Array.isArray(mentor.expertiseAreas) ? 
                          mentor.expertiseAreas.map((area, index) => (
                            <span key={index} className="bg-blue-900/50 text-blue-100 text-xs px-2 py-1 rounded-full">
                              {area}
                            </span>
                          )) : 
                          <span className="text-indigo-300 text-sm">No expertise areas specified</span>
                        }
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h3 className="text-xs font-medium text-indigo-300 uppercase tracking-wider mb-1">Industry Experience</h3>
                        <p className="text-white">{mentor.industryExperience} years</p>
                      </div>
                      
                      <div>
                        <h3 className="text-xs font-medium text-indigo-300 uppercase tracking-wider mb-1">Mentoring Style</h3>
                        <p className="text-white">{mentor.mentorStyle || "Not specified"}</p>
                      </div>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleRequestMentor(mentor._id)}
                    disabled={isButtonDisabled(mentor._id)}
                    className={`w-full py-2 px-4 rounded-lg text-white font-medium transition-all ${getButtonClass(mentor._id)}`}
                  >
                    {getButtonText(mentor._id)}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
        
        {/* Quick Navigation */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-10"
        >
          <h3 className="text-xl font-bold text-white mb-4">Quick Links</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link to="/dashboard" className="bg-white/10 hover:bg-white/20 backdrop-blur-sm p-4 rounded-lg text-white transition-colors">
              <p className="font-medium">Dashboard</p>
            </Link>
            <Link to="/my-mentors" className="bg-white/10 hover:bg-white/20 backdrop-blur-sm p-4 rounded-lg text-white transition-colors">
              <p className="font-medium">My Mentors</p>
            </Link>
            <Link to="/requests" className="bg-white/10 hover:bg-white/20 backdrop-blur-sm p-4 rounded-lg text-white transition-colors">
              <p className="font-medium">Pending Requests</p>
            </Link>
            <Link to="/profile" className="bg-white/10 hover:bg-white/20 backdrop-blur-sm p-4 rounded-lg text-white transition-colors">
              <p className="font-medium">My Profile</p>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default FindMentor;
