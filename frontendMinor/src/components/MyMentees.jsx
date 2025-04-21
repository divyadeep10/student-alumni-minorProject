import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';

const MyMentees = () => {
  const navigate = useNavigate();
  const [mentees, setMentees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedMentee, setSelectedMentee] = useState(null);
  const [menteeDetails, setMenteeDetails] = useState(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchMentees = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get('http://localhost:5000/api/alumni/my-mentees', {
          headers: { 'Authorization': token }
        });
        setMentees(response.data.mentees);
      } catch (err) {
        console.error('Error fetching mentees:', err);
        setError('Failed to load your mentees. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMentees();
  }, [navigate]);

  const viewMenteeProfile = async (menteeId) => {
    setIsLoadingDetails(true);
    setSelectedMentee(menteeId);
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:5000/api/alumni/view-mentee/${menteeId}`, {
        headers: { 'Authorization': token }
      });
      setMenteeDetails(response.data);
    } catch (err) {
      console.error('Error fetching mentee details:', err);
      setError('Failed to load mentee details. Please try again.');
    } finally {
      setIsLoadingDetails(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-900 to-blue-900 pt-20 pb-10 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-gradient-to-r from-indigo-600 to-blue-600 rounded-xl shadow-2xl p-8 mb-10 text-white"
        >
          <h1 className="text-3xl font-bold mb-2">My Mentees</h1>
          <p className="text-xl text-indigo-200">Manage your mentorship connections and support your mentees</p>
        </motion.div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded mb-6">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-6">
          {/* Mentees List */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full md:w-1/3 bg-white/10 backdrop-blur-sm rounded-xl p-6"
          >
            <h2 className="text-xl font-bold text-white mb-4">Your Connected Mentees</h2>
            
            {isLoading ? (
              <div className="flex justify-center items-center h-40">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500"></div>
              </div>
            ) : mentees.length === 0 ? (
              <div className="bg-white/5 rounded-lg p-6 text-center">
                <p className="text-indigo-200">You don't have any connected mentees yet.</p>
                <Link 
                  to="/requests" 
                  className="mt-4 inline-block bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-lg text-center font-medium transition-colors"
                >
                  View Requests
                </Link>
              </div>
            ) : (
              <ul className="space-y-3">
                {mentees.map((mentee) => (
                  <li key={mentee._id}>
                    <button
                      onClick={() => viewMenteeProfile(mentee._id)}
                      className={`w-full text-left p-4 rounded-lg transition-colors ${
                        selectedMentee === mentee._id 
                          ? 'bg-indigo-700 text-white' 
                          : 'bg-white/5 text-indigo-100 hover:bg-white/10'
                      }`}
                    >
                      <p className="font-medium">{mentee.name}</p>
                      <p className="text-sm opacity-80">{mentee.collegeId}</p>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </motion.div>

          {/* Mentee Details */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full md:w-2/3 bg-white/10 backdrop-blur-sm rounded-xl p-6"
          >
            {isLoadingDetails ? (
              <div className="flex justify-center items-center h-80">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
              </div>
            ) : !selectedMentee ? (
              <div className="flex flex-col items-center justify-center h-80 text-center">
                <svg className="w-16 h-16 text-indigo-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                </svg>
                <h3 className="text-xl font-medium text-white mb-2">Select a Mentee</h3>
                <p className="text-indigo-200">Click on a mentee to view their detailed profile</p>
              </div>
            ) : menteeDetails ? (
              <div className="text-white">
                <div className="flex items-center mb-6">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-r from-indigo-500 to-blue-600 flex items-center justify-center text-2xl font-bold">
                    {menteeDetails.mentee.name.charAt(0)}
                  </div>
                  <div className="ml-4">
                    <h2 className="text-2xl font-bold">{menteeDetails.mentee.name}</h2>
                    <p className="text-indigo-200">{menteeDetails.mentee.email}</p>
                    <p className="text-indigo-200 text-sm">College ID: {menteeDetails.mentee.collegeId}</p>
                    {menteeDetails.mentorshipDetails && (
                      <p className="text-green-300 text-sm mt-1">
                        Connected for {menteeDetails.mentorshipDetails.duration}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="bg-white/5 p-4 rounded-lg">
                    <h3 className="font-medium text-indigo-300 mb-2">Learning Style</h3>
                    <p>{menteeDetails.mentee.learningStyle || "Not specified"}</p>
                  </div>
                  
                  <div className="bg-white/5 p-4 rounded-lg">
                    <h3 className="font-medium text-indigo-300 mb-2">Career Goals</h3>
                    <p>{menteeDetails.mentee.careerGoals || "Not specified"}</p>
                  </div>
                </div>

                <div className="bg-white/5 p-4 rounded-lg mb-6">
                  <h3 className="font-medium text-indigo-300 mb-2">Interests</h3>
                  <div className="flex flex-wrap gap-2">
                    {menteeDetails.mentee.interests?.map((interest, index) => (
                      <span key={index} className="bg-indigo-900/50 px-3 py-1 rounded-full text-sm">
                        {interest}
                      </span>
                    )) || <p>No interests specified</p>}
                  </div>
                </div>

                <div className="bg-white/5 p-4 rounded-lg mb-6">
                  <h3 className="font-medium text-indigo-300 mb-2">Bio</h3>
                  <p>{menteeDetails.mentee.bio || "No bio available"}</p>
                </div>

                <div className="mt-6 flex space-x-4">
                  <Link 
                    to={`/chat/${menteeDetails.mentee._id}`}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-6 rounded-lg text-center font-medium transition-colors"
                  >
                    Message
                  </Link>
                  <Link 
                    to={`/schedule-meeting/${menteeDetails.mentee._id}`}
                    className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-lg text-center font-medium transition-colors"
                  >
                    Schedule Meeting
                  </Link>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-80 text-center">
                <p className="text-red-300">Failed to load mentee details. Please try again.</p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default MyMentees;