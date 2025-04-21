import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const MentorRecommendations = () => {
  const token = localStorage.getItem('token');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [recommendations, setRecommendations] = useState([]);
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [requestStatus, setRequestStatus] = useState({});
  const [requestInProgress, setRequestInProgress] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [feedback, setFeedback] = useState({
    alumniId: '',
    rating: 0,
    relevance: '',
    comments: ''
  });

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await axios.get('http://localhost:5000/api/matching/recommendations', {
        headers: { Authorization: token }
      });
      
      console.log('Raw API response:', response.data);
      
      let processedMentors = [];
      const data = response.data;
      
      if (Array.isArray(data)) {
        processedMentors = data.map(mentor => formatMentorData(mentor));
      } else if (data && typeof data === 'object') {
        if (Array.isArray(data.recommendations)) {
          processedMentors = data.recommendations.map(mentor => formatMentorData(mentor));
        } else {
          processedMentors = Object.values(data)
            .filter(item => item && typeof item === 'object')
            .map(mentor => formatMentorData(mentor));
        }
      }
      
      setRecommendations(processedMentors);
      
      // Fetch status for each mentor
      if (processedMentors.length > 0) {
        const statusPromises = processedMentors.map(mentor => 
          axios.get(`http://localhost:5000/api/student/request-status/${mentor._id}`, {
            headers: { Authorization: token },
          }).catch(err => {
            console.error(`Error fetching status for mentor ${mentor._id}:`, err);
            return { data: { status: 'none' } };
          })
        );
        
        const statusResults = await Promise.all(statusPromises);
        
        const statusMap = {};
        processedMentors.forEach((mentor, index) => {
          statusMap[mentor._id] = statusResults[index].data.status;
        });
        
        setRequestStatus(statusMap);
      }
    } catch (err) {
      setError('Failed to load recommendations. Please try again later.');
      console.error('Error fetching recommendations:', err);
      setRecommendations([]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatMentorData = (mentor) => {
    return {
      _id: mentor._id || mentor.alumniId,
      name: mentor.name || 'Unknown Mentor',
      industry: mentor.industry || 
               (Array.isArray(mentor.industryExperience) && mentor.industryExperience.length > 0 
                ? mentor.industryExperience[0] 
                : 'Industry not specified'),
      yearsOfExperience: mentor.yearsOfExperience || 
                        (mentor.careerInsights ? "Experienced" : 'Not specified'),
      availabilityPerWeek: mentor.availabilityPerWeek || 
                          (Array.isArray(mentor.availability) && mentor.availability.length > 0 
                           ? `${mentor.availability.length} days per week` 
                           : 'Not specified'),
      mentorshipStyle: mentor.mentorshipStyle || mentor.mentorStyle || 'Not specified',
      expertise: Array.isArray(mentor.expertise) 
                ? mentor.expertise 
                : (mentor.expertiseAreas 
                   ? Object.keys(mentor.expertiseAreas) 
                   : []),
      matchScore: mentor.matchScore || 
                 (mentor.compatibilityDetails ? 
                  Math.round((mentor.compatibilityDetails.expertise + 
                             mentor.compatibilityDetails.availability + 
                             mentor.compatibilityDetails.communication) / 3) : 75)
    };
  };

  const handleRequestMentor = async (mentorId) => {
    setRequestInProgress(mentorId);
    try {
      const res = await axios.post(
        'http://localhost:5000/api/student/request-mentor',
        { alumniId: mentorId },
        {
          headers: { 
            Authorization: token,
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('Request response:', res.data);
      
      setRequestStatus(prev => ({
        ...prev,
        [mentorId]: res.data.status || 'pending'
      }));
      
      alert('Mentor request sent successfully!');
      
    } catch (err) {
      console.error('Error sending request:', err);
      console.error('Error response:', err.response?.data);
      
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error || 
                          'Failed to send request';
      alert(errorMessage);
      
      setRequestStatus(prev => ({
        ...prev,
        [mentorId]: 'none'
      }));
    } finally {
      setRequestInProgress(null);
    }
  };

  const handleFeedback = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        'http://localhost:5000/api/matching/feedback', 
        {
          alumniId: feedback.alumniId,
          rating: feedback.rating,
          feedback: feedback.comments
        }, 
        { headers: { Authorization: token } }
      );
      
      alert('Thank you for your feedback!');
      setFeedback({
        alumniId: '',
        rating: 0,
        relevance: '',
        comments: ''
      });
      setSelectedMentor(null);
    } catch (err) {
      console.error('Error sending feedback:', err);
      alert('Failed to send feedback. Please try again.');
    }
  };

  const handleRatingChange = (rating) => {
    setFeedback({ ...feedback, rating });
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
        return 'Request Mentor';
    }
  };

  const getButtonClass = (mentorId) => {
    const status = requestStatus[mentorId];
    
    if (requestInProgress === mentorId) {
      return 'bg-gray-500 cursor-wait text-white';
    }
    
    switch(status) {
      case 'pending':
        return 'bg-yellow-500 hover:bg-yellow-600 cursor-not-allowed text-white';
      case 'accepted':
        return 'bg-green-500 hover:bg-green-600 cursor-not-allowed text-white';
      case 'rejected':
        return 'bg-red-500 hover:bg-red-600 text-white';
      default:
        return 'bg-blue-600 hover:bg-blue-700 text-white';
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

  const filteredRecommendations = recommendations.filter((mentor) =>
    mentor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (Array.isArray(mentor.expertise) && mentor.expertise.some(skill => 
      skill.toLowerCase().includes(searchTerm.toLowerCase())
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
              <h1 className="text-3xl font-bold mb-2">Recommended Mentors</h1>
              <p className="text-xl text-blue-200">Personalized mentor matches based on your profile and preferences</p>
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
              <button 
                className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-medium transition-colors"
                onClick={() => setSearchTerm('')}
              >
                Reset
              </button>
              <button 
                className="bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-6 rounded-lg font-medium transition-colors"
                onClick={fetchRecommendations}
              >
                Refresh
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
        ) : !Array.isArray(filteredRecommendations) || filteredRecommendations.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16 bg-white/5 backdrop-blur-sm rounded-xl"
          >
            <svg className="w-16 h-16 text-indigo-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <p className="text-indigo-100 text-xl">No mentor recommendations found.</p>
            <p className="text-indigo-200 mt-2">Complete your profile to get personalized recommendations.</p>
            <div className="mt-6 flex justify-center gap-4">
              <Link 
                to="/profile" 
                className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-6 rounded-lg transition-colors"
              >
                Update Profile
              </Link>
              <button 
                onClick={fetchRecommendations}
                className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-lg transition-colors"
              >
                Refresh Recommendations
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredRecommendations.map((mentor, index) => (
              <motion.div
                key={mentor._id || index}
                className="bg-white/10 backdrop-blur-sm rounded-xl overflow-hidden shadow-lg"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
              >
                <div className="h-2 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xl font-bold shadow-lg">
                      {mentor.name ? mentor.name.charAt(0).toUpperCase() : '?'}
                    </div>
                    <div className="ml-4">
                      <div className="flex items-center gap-2">
                        <h3 className="text-xl font-bold text-white">{mentor.name || 'Unknown Mentor'}</h3>
                        {getStatusBadge(mentor._id)}
                      </div>
                      <p className="text-blue-300">{mentor.industry || 'Industry not specified'}</p>
                    </div>
                  </div>
                  
                  <div className="mb-4 bg-white/5 rounded-lg p-3">
                    <div className="flex items-center mb-2">
                      <span className="text-indigo-200 w-32">Experience:</span>
                      <span className="text-white">{mentor.yearsOfExperience || 'Not specified'}</span>
                    </div>
                    <div className="flex items-center mb-2">
                      <span className="text-indigo-200 w-32">Availability:</span>
                      <span className="text-white">{mentor.availabilityPerWeek || 'Not specified'}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-indigo-200 w-32">Style:</span>
                      <span className="text-white">{mentor.mentorshipStyle || 'Not specified'}</span>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <p className="text-indigo-200 mb-2">Expertise:</p>
                    <div className="flex flex-wrap gap-2">
                      {Array.isArray(mentor.expertise) && mentor.expertise.length > 0 ? mentor.expertise.map((skill) => (
                        <span key={skill} className="bg-indigo-900/50 text-indigo-200 px-3 py-1 rounded-full text-xs">
                          {skill}
                        </span>
                      )) : (
                        <span className="bg-indigo-900/50 text-indigo-200 px-3 py-1 rounded-full text-xs">
                          No expertise listed
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-1">
                      <p className="text-indigo-200">Match Score:</p>
                      <p className="text-white font-medium">{mentor.matchScore || 75}%</p>
                    </div>
                    <div className="w-full bg-gray-700/50 rounded-full h-2.5">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2.5 rounded-full" 
                        style={{ width: `${mentor.matchScore || 75}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-3 mt-6">
                    <button
                      onClick={() => {
                        setSelectedMentor(mentor);
                        setFeedback(prev => ({ ...prev, alumniId: mentor._id }));
                      }}
                      className="flex-1 bg-white/10 text-white py-2 px-4 rounded-lg hover:bg-white/20 transition-colors"
                    >
                      View Details
                    </button>
                    <button
                      onClick={() => handleRequestMentor(mentor._id)}
                      disabled={isButtonDisabled(mentor._id)}
                      className={`flex-1 py-2 px-4 rounded-lg transition-colors ${getButtonClass(mentor._id)}`}
                    >
                      {getButtonText(mentor._id)}
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {/* Mentor Details Modal */}
      {selectedMentor && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold">
                    {selectedMentor.name ? selectedMentor.name.charAt(0).toUpperCase() : '?'}
                  </div>
                  <div className="ml-4">
                    <h2 className="text-2xl font-bold text-white">{selectedMentor.name}</h2>
                    <p className="text-blue-300">{selectedMentor.industry}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedMentor(null)}
                  className="text-gray-400 hover:text-white"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-white/5 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-blue-300 mb-3">Mentor Details</h3>
                  <div className="space-y-2">
                    <div>
                      <span className="text-gray-400">Industry: </span>
                      <span className="text-white">{selectedMentor.industry}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Experience: </span>
                      <span className="text-white">{selectedMentor.yearsOfExperience}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Availability: </span>
                      <span className="text-white">{selectedMentor.availabilityPerWeek}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Mentorship Style: </span>
                      <span className="text-white">{selectedMentor.mentorshipStyle}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white/5 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-blue-300 mb-3">Expertise</h3>
                  <div className="flex flex-wrap gap-2">
                    {Array.isArray(selectedMentor.expertise) && selectedMentor.expertise.length > 0 ? 
                      selectedMentor.expertise.map((skill) => (
                        <span key={skill} className="bg-indigo-900/50 text-indigo-200 px-3 py-1 rounded-full text-sm">
                          {skill}
                        </span>
                      )) : (
                        <span className="text-gray-400">No expertise listed</span>
                      )
                    }
                  </div>
                </div>
              </div>

              <div className="bg-white/5 p-4 rounded-lg mb-6">
                <h3 className="text-lg font-medium text-blue-300 mb-3">Provide Feedback</h3>
                <form onSubmit={handleFeedback} className="space-y-4">
                  <div>
                    <label className="block text-gray-400 mb-1">Rating</label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => handleRatingChange(star)}
                          className={`text-2xl ${
                            feedback.rating >= star ? 'text-yellow-400' : 'text-gray-600'
                          }`}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-gray-400 mb-1">Relevance</label>
                    <select
                      value={feedback.relevance}
                      onChange={(e) => setFeedback({ ...feedback, relevance: e.target.value })}
                      className="w-full bg-gray-700 text-white rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select relevance</option>
                      <option value="very-relevant">Very Relevant</option>
                      <option value="somewhat-relevant">Somewhat Relevant</option>
                      <option value="not-relevant">Not Relevant</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-400 mb-1">Comments</label>
                    <textarea
                      value={feedback.comments}
                      onChange={(e) => setFeedback({ ...feedback, comments: e.target.value })}
                      className="w-full bg-gray-700 text-white rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows="3"
                    ></textarea>
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-lg transition-colors"
                    >
                      Submit Feedback
                    </button>
                  </div>
                </form>
              </div>

              <div className="flex justify-between">
                <button
                  onClick={() => setSelectedMentor(null)}
                  className="bg-gray-700 hover:bg-gray-600 text-white py-2 px-6 rounded-lg transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => handleRequestMentor(selectedMentor._id)}
                  disabled={isButtonDisabled(selectedMentor._id)}
                  className={`py-2 px-6 rounded-lg transition-colors ${getButtonClass(selectedMentor._id)}`}
                >
                  {getButtonText(selectedMentor._id)}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default MentorRecommendations;
