// src/components/FindMentor.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const FindMentor = () => {
  const [mentors, setMentors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sentRequests, setSentRequests] = useState([]);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchMentors = async () => {
      setIsLoading(true);
      try {
        const res = await axios.get('https://alumni-student-minor-project-backend.vercel.app/api/alumni/top-alumni', {
          headers: { Authorization: token },
        });
        setMentors(res.data.topAlumni);
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

  const sendRequest = async (alumniId) => {
    try {
      await axios.post(
        'https://alumni-student-minor-project-backend.vercel.app/api/student/request-mentor',
        { alumniId },
        { headers: { Authorization: token } }
      );
      // Add to sent requests to update UI
      setSentRequests([...sentRequests, alumniId]);
      // Show success message
      setError('');
    } catch (err) {
      console.error(err);
      setError('Failed to send request. Please try again.');
    }
  };

  // Filter mentors based on search term
  const filteredMentors = mentors.filter(mentor => 
    mentor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (mentor.careerInsights && mentor.careerInsights.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-50 pt-24 pb-10 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6 rounded-xl shadow-lg mb-8">
          <h2 className="text-3xl font-bold">Find Your Mentor</h2>
          <p className="mt-2 text-blue-100">Connect with experienced professionals who can guide your career journey</p>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded mb-6">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md p-4 mb-8">
          <div className="relative">
            <input
              type="text"
              placeholder="Search mentors by name or expertise..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <svg className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : filteredMentors.length === 0 ? (
          <div className="bg-white p-8 text-center rounded-lg shadow-md">
            <p className="text-gray-600">
              {searchTerm ? 'No mentors match your search criteria.' : 'No mentors available at this time.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMentors.map((mentor) => (
              <div 
                key={mentor._id} 
                className="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1"
              >
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-500 mr-3">
                      <span className="text-xl font-bold">{mentor.name.charAt(0)}</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-800">{mentor.name}</h3>
                      <p className="text-gray-500 text-sm">{mentor.email}</p>
                    </div>
                  </div>
                  
                  {mentor.careerInsights && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-1">Career Insights:</h4>
                      <p className="text-gray-600 text-sm">{mentor.careerInsights}</p>
                    </div>
                  )}
                  
                  {mentor.interests && mentor.interests.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-1">Expertise:</h4>
                      <div className="flex flex-wrap gap-1">
                        {mentor.interests.map((interest, idx) => (
                          <span key={idx} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                            {interest}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <button
                    onClick={() => sendRequest(mentor._id)}
                    disabled={sentRequests.includes(mentor._id)}
                    className={`w-full py-2 rounded-md transition-all duration-200 ${
                      sentRequests.includes(mentor._id)
                        ? 'bg-green-100 text-green-800 cursor-default'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {sentRequests.includes(mentor._id) ? 'Request Sent' : 'Send Request'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FindMentor;
