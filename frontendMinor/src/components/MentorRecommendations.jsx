import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';

const MentorRecommendations = () => {
  const token = localStorage.getItem('token');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  // Ensure recommendations is always an array
  const [recommendations, setRecommendations] = useState([]);
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [requestSent, setRequestSent] = useState({});
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
    try {
      const response = await axios.get('http://localhost:5000/api/matching/recommendations', {
        headers: { Authorization: token }
      });
      
      // Ensure we're setting an array, even if the API returns something else
      const data = response.data;
      
      // Log the raw data to see what's actually coming from the API
      console.log('Raw API response:', data);
      
      if (Array.isArray(data)) {
        // Map the data to ensure all required fields are present
        const processedData = data.map(mentor => ({
          _id: mentor._id || mentor._id?.$oid,
          name: mentor.name || 'Unknown Mentor',
          // Map fields from your Alumni schema to the display fields
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
          matchScore: mentor.matchScore || 75
        }));
        setRecommendations(processedData);
      } else if (data && typeof data === 'object') {
        // If it's an object with recommendations property that's an array
        if (Array.isArray(data.recommendations)) {
          const processedData = data.recommendations.map(mentor => ({
            _id: mentor._id,
            name: mentor.name || 'Unknown Mentor',
            industry: mentor.industry || mentor.industryExperience?.[0] || 'Industry not specified',
            yearsOfExperience: mentor.yearsOfExperience || 'Not specified',
            availabilityPerWeek: mentor.availabilityPerWeek || 
              (mentor.availability?.length > 0 ? `${mentor.availability.length} days per week` : 'Not specified'),
            mentorshipStyle: mentor.mentorshipStyle || mentor.mentorStyle || 'Not specified',
            expertise: Array.isArray(mentor.expertise) ? mentor.expertise : 
              (mentor.expertiseAreas ? Object.keys(mentor.expertiseAreas) : []),
            matchScore: mentor.matchScore || 75
          }));
          setRecommendations(processedData);
        } else {
          // If it's just an object, convert to array if possible
          const recommendationsArray = Object.values(data).filter(item => 
            item && typeof item === 'object'
          ).map(mentor => ({
            _id: mentor._id,
            name: mentor.name || 'Unknown Mentor',
            industry: mentor.industry || mentor.industryExperience?.[0] || 'Industry not specified',
            yearsOfExperience: mentor.yearsOfExperience || 'Not specified',
            availabilityPerWeek: mentor.availabilityPerWeek || 
              (mentor.availability?.length > 0 ? `${mentor.availability.length} days per week` : 'Not specified'),
            mentorshipStyle: mentor.mentorshipStyle || mentor.mentorStyle || 'Not specified',
            expertise: Array.isArray(mentor.expertise) ? mentor.expertise : 
              (mentor.expertiseAreas ? Object.keys(mentor.expertiseAreas) : []),
            matchScore: mentor.matchScore || 75
          }));
          setRecommendations(recommendationsArray);
        }
      } else {
        // Fallback to empty array if we can't extract recommendations
        setRecommendations([]);
        setError('Invalid data format received from server');
      }
    } catch (err) {
      setError('Failed to load recommendations. Please try again later.');
      console.error(err);
      // Ensure we have an empty array on error
      setRecommendations([]);
    } finally {
      setIsLoading(false);
    }
  };
//    'http://localhost:5000/api/student/request-mentor',
// { alumniId },
  const handleSendRequest = async (alumniId) => {
    try {
      await axios.post('http://localhost:5000/api/student/request-mentor', 
        { alumniId }, 
        { headers: { Authorization: token } }
      );
      setRequestSent(prev => ({ ...prev, [alumniId]: true }));
    } catch (err) {
      console.error('Error sending request:', err);
      alert('Failed to send request. Please try again.');
    }
  };

  const handleFeedback = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/matching/feedback', 
        feedback, 
        { headers: { Authorization: token } }
      );
      alert('Thank you for your feedback!');
      setFeedback({
        alumniId: '',
        rating: 0,
        relevance: '',
        comments: ''
      });
    } catch (err) {
      console.error('Error sending feedback:', err);
      alert('Failed to send feedback. Please try again.');
    }
  };

  const handleRatingChange = (rating) => {
    setFeedback({ ...feedback, rating });
  };

  // For debugging
  useEffect(() => {
    console.log('Recommendations state:', recommendations);
  }, [recommendations]);

  return (
    <div className="bg-gray-900 min-h-screen py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold text-blue-400 mb-8">Recommended Mentors</h1>
          
          {error && (
            <div className="bg-red-900/30 border-l-4 border-red-500 p-4 mb-6">
              <p className="text-red-400">{error}</p>
            </div>
          )}

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : !Array.isArray(recommendations) || recommendations.length === 0 ? (
            <div className="bg-gray-800 rounded-xl p-8 text-center">
              <p className="text-gray-400 text-lg">No mentor recommendations available yet.</p>
              <p className="text-gray-500 mt-2">Complete your profile and preferences to get personalized recommendations.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Add extra check to ensure recommendations is an array before mapping */}
              {Array.isArray(recommendations) && recommendations.map((mentor, index) => (
                <motion.div
                  key={mentor._id || index}
                  className="bg-gray-800 rounded-xl overflow-hidden shadow-lg"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                >
                  {/* Rest of the mentor card remains the same */}
                  <div className="h-2 bg-gradient-to-r from-blue-600 to-indigo-700"></div>
                  <div className="p-6">
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-600 to-indigo-700 flex items-center justify-center text-white text-xl font-bold">
                        {mentor.name ? mentor.name.charAt(0) : '?'}
                      </div>
                      <div className="ml-4">
                        <h3 className="text-xl font-bold text-white">{mentor.name || 'Unknown Mentor'}</h3>
                        <p className="text-blue-400">{mentor.industry || 'Industry not specified'}</p>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <div className="flex items-center mb-2">
                        <span className="text-gray-400 w-32">Experience:</span>
                        <span className="text-white">{mentor.yearsOfExperience || 'Not specified'}</span>
                      </div>
                      <div className="flex items-center mb-2">
                        <span className="text-gray-400 w-32">Availability:</span>
                        <span className="text-white">{mentor.availabilityPerWeek || 'Not specified'}</span>
                      </div>
                      <div className="flex items-center mb-2">
                        <span className="text-gray-400 w-32">Mentorship Style:</span>
                        <span className="text-white">{mentor.mentorshipStyle || 'Not specified'}</span>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <p className="text-gray-400 mb-2">Expertise:</p>
                      <div className="flex flex-wrap gap-2">
                        {Array.isArray(mentor.expertise) && mentor.expertise.length > 0 ? mentor.expertise.map((skill) => (
                          <span key={skill} className="bg-gray-700 text-blue-300 px-2 py-1 rounded-full text-xs">
                            {skill}
                          </span>
                        )) : (
                          <span className="bg-gray-700 text-blue-300 px-2 py-1 rounded-full text-xs">
                            No expertise listed
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <p className="text-gray-400 mb-2">Match Score:</p>
                      <div className="w-full bg-gray-700 rounded-full h-2.5">
                        <div 
                          className="bg-gradient-to-r from-blue-600 to-indigo-700 h-2.5 rounded-full" 
                          style={{ width: `${mentor.matchScore || 75}%` }}
                        ></div>
                      </div>
                      <p className="text-right text-sm text-gray-400 mt-1">{mentor.matchScore || 75}% match</p>
                    </div>
                    
                    <div className="flex space-x-2 mt-6">
                      <button
                        onClick={() => setSelectedMentor(mentor)}
                        className="flex-1 bg-gray-700 text-white py-2 rounded-lg hover:bg-gray-600 transition-colors"
                      >
                        View Details
                      </button>
                      <button
                        onClick={() => handleSendRequest(mentor._id)}
                        disabled={requestSent[mentor._id]}
                        className={`flex-1 py-2 rounded-lg transition-colors ${
                          requestSent[mentor._id]
                            ? 'bg-green-900/50 text-green-400 cursor-not-allowed'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                      >
                        {requestSent[mentor._id] ? 'Request Sent' : 'Request Mentor'}
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Mentor Details Modal - Only show if selectedMentor exists */}
      {selectedMentor && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            {/* Modal content remains the same */}
            {/* ... */}
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default MentorRecommendations;