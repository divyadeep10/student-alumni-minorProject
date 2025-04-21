import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';

const MyMentors = () => {
  const navigate = useNavigate();
  const [mentors, setMentors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [mentorDetails, setMentorDetails] = useState(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchMentors = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get('http://localhost:5000/api/student/my-mentors', {
          headers: { 'Authorization': token }
        });
        
        // Add null check for response.data
        if (response.data && Array.isArray(response.data.mentors)) {
          setMentors(response.data.mentors);
        } else {
          // Handle case where mentors is not an array
          console.warn("Received invalid mentors data:", response.data);
          setMentors([]);
          setError('Received invalid data format from server');
        }
      } catch (err) {
        console.error('Error fetching mentors:', err);
        setError('Failed to load your mentors. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMentors();
  }, [navigate]);

  const viewMentorProfile = async (mentorId) => {
    setIsLoadingDetails(true);
    setSelectedMentor(mentorId);
    
    try {
      const token = localStorage.getItem('token');
      // Check if mentorId is valid
      if (!mentorId) {
        throw new Error('Invalid mentor ID');
      }
      
      // Log the request for debugging
      console.log(`Fetching profile for mentor ID: ${mentorId}`);
      
      const response = await axios.get(`http://localhost:5000/api/alumni/${mentorId}`, {
        headers: { 'Authorization': token }
      });
      
      // Add null check for response.data
      if (response.data) {
        console.log('Mentor details received:', response.data);
        
        // Format the data to match the component's expected structure
        const formattedData = {
          mentor: {
            _id: response.data.id,
            name: response.data.name,
            email: response.data.email,
            collegeId: response.data.collegeId,
            expertiseAreas: response.data.expertiseAreas ? 
              // Convert object to array if needed
              (typeof response.data.expertiseAreas === 'object' ? 
                Object.values(response.data.expertiseAreas) : 
                response.data.expertiseAreas) : 
              [],
            industryExperience: Array.isArray(response.data.industryExperience) ? 
              response.data.industryExperience.length : 
              response.data.industryExperience,
            mentorStyle: response.data.mentorStyle,
            bio: response.data.careerInsights
          }
        };
        
        setMentorDetails(formattedData);
      } else {
        setError('Could not load mentor details');
      }
    } catch (err) {
      console.error('Error fetching mentor details:', err);
      setError(`Failed to load mentor details: ${err.response?.status === 404 ? 'Mentor profile not found' : 'Please try again later.'}`);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 to-indigo-900 pt-20 pb-10 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-2xl p-8 mb-10 text-white"
        >
          <h1 className="text-3xl font-bold mb-2">My Mentors</h1>
          <p className="text-xl text-blue-200">Connect with your mentors and view their profiles</p>
        </motion.div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded mb-6">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-6">
          {/* Mentors List */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full md:w-1/3 bg-white/10 backdrop-blur-sm rounded-xl p-6"
          >
            <h2 className="text-xl font-bold text-white mb-4">Your Connected Mentors</h2>
            
            {isLoading ? (
              <div className="flex justify-center items-center h-40">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : mentors.length === 0 ? (
              <div className="bg-white/5 rounded-lg p-6 text-center">
                <p className="text-blue-200">You don't have any connected mentors yet.</p>
                <Link 
                  to="/mentor-recommendations" 
                  className="mt-4 inline-block bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-center font-medium transition-colors"
                >
                  Find Mentors
                </Link>
              </div>
            ) : (
              <ul className="space-y-3">
                {mentors.map((mentor) => (
                  <li key={mentor._id}>
                    <button
                      onClick={() => viewMentorProfile(mentor._id)}
                      className={`w-full text-left p-4 rounded-lg transition-colors ${
                        selectedMentor === mentor._id 
                          ? 'bg-blue-700 text-white' 
                          : 'bg-white/5 text-blue-100 hover:bg-white/10'
                      }`}
                    >
                      <p className="font-medium">{mentor.name}</p>
                      <p className="text-sm opacity-80">
                        {Array.isArray(mentor.expertiseAreas) 
                          ? mentor.expertiseAreas.join(', ') 
                          : (typeof mentor.expertiseAreas === 'string' 
                              ? mentor.expertiseAreas 
                              : 'No expertise specified')}
                      </p>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </motion.div>

          {/* Mentor Details */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full md:w-2/3 bg-white/10 backdrop-blur-sm rounded-xl p-6"
          >
            {isLoadingDetails ? (
              <div className="flex justify-center items-center h-80">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : !selectedMentor ? (
              <div className="flex flex-col items-center justify-center h-80 text-center">
                <svg className="w-16 h-16 text-blue-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
                </svg>
                <h3 className="text-xl font-medium text-white mb-2">Select a Mentor</h3>
                <p className="text-blue-200">Click on a mentor to view their detailed profile</p>
              </div>
            ) : mentorDetails ? (
              <div className="text-white">
                <div className="flex items-center mb-6">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-2xl font-bold">
                    {mentorDetails.mentor.name.charAt(0)}
                  </div>
                  <div className="ml-4">
                    <h2 className="text-2xl font-bold">{mentorDetails.mentor.name}</h2>
                    <p className="text-blue-200">{mentorDetails.mentor.email}</p>
                    {mentorDetails.mentorshipDetails && (
                      <p className="text-green-300 text-sm mt-1">
                        Connected for {mentorDetails.mentorshipDetails.duration}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="bg-white/5 p-4 rounded-lg">
                    <h3 className="font-medium text-blue-300 mb-2">Industry Experience</h3>
                    <p>{mentorDetails.mentor.industryExperience} years</p>
                  </div>
                  
                  <div className="bg-white/5 p-4 rounded-lg">
                    <h3 className="font-medium text-blue-300 mb-2">Mentoring Style</h3>
                    <p>{mentorDetails.mentor.mentorStyle}</p>
                  </div>
                </div>

                <div className="bg-white/5 p-4 rounded-lg mb-6">
                  <h3 className="font-medium text-blue-300 mb-2">Areas of Expertise</h3>
                  <div className="flex flex-wrap gap-2">
                    {Array.isArray(mentorDetails.mentor.expertiseAreas) && mentorDetails.mentor.expertiseAreas.length > 0 ? (
                      mentorDetails.mentor.expertiseAreas.map((area, index) => (
                        <span key={index} className="bg-blue-900/50 px-3 py-1 rounded-full text-sm">
                          {area}
                        </span>
                      ))
                    ) : typeof mentorDetails.mentor.expertiseAreas === 'object' && Object.keys(mentorDetails.mentor.expertiseAreas).length > 0 ? (
                      Object.values(mentorDetails.mentor.expertiseAreas).map((area, index) => (
                        <span key={index} className="bg-blue-900/50 px-3 py-1 rounded-full text-sm">
                          {area}
                        </span>
                      ))
                    ) : (
                      <span className="bg-blue-900/50 px-3 py-1 rounded-full text-sm">
                        No expertise specified
                      </span>
                    )}
                  </div>
                </div>

                <div className="bg-white/5 p-4 rounded-lg">
                  <h3 className="font-medium text-blue-300 mb-2">Bio</h3>
                  <p>{mentorDetails.mentor.bio || "No bio available"}</p>
                </div>

                <div className="mt-6 flex space-x-4">
                  <Link 
                    to={`/chat/${mentorDetails.mentor._id}`}
                    className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-lg text-center font-medium transition-colors"
                  >
                    Message
                  </Link>
                  <Link 
                    to={`/schedule-meeting/${mentorDetails.mentor._id}`}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-6 rounded-lg text-center font-medium transition-colors"
                  >
                    Schedule Meeting
                  </Link>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-80 text-center">
                <p className="text-red-300">Failed to load mentor details. Please try again.</p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default MyMentors;