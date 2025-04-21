import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';

const LandingPage = ({ role }) => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    pendingRequests: 0,
    activeConnections: 0,
    upcomingWebinars: 0,
    unreadMessages: 0
  });

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchUserData = async () => {
      setIsLoading(true);
      try {
        // Use the existing dashboard endpoints
        const url = role === 'student'
          ? 'http://localhost:5000/api/student/dashboard'
          : 'http://localhost:5000/api/alumni/dashboard';
        
        const response = await axios.get(url, {
          headers: { 'Authorization': token }
        });
        
        setUserData(response.data);
        
        // Also fetch stats if needed
        const statsUrl = role === 'student'
          ? 'http://localhost:5000/api/student/dashboard-stats'
          : 'http://localhost:5000/api/alumni/dashboard-stats';
          
        const statsResponse = await axios.get(statsUrl, {
          headers: { 'Authorization': token }
        });
        
        setStats(statsResponse.data);
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError('Failed to load your profile data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [role, navigate]);

  // Extract user data based on role
  const user = role === 'student' ? userData?.student : userData?.alumni;

  // Student landing page
  const StudentLanding = () => (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 to-indigo-900 pt-20 pb-10 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Welcome Banner */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-2xl p-8 mb-10 text-white"
        >
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">Welcome back, {user?.name || 'Student'}!</h1>
              <p className="text-xl text-blue-200">Your journey to career success continues here</p>
            </div>
            <div className="mt-6 md:mt-0">
              <div className="bg-white/10 p-4 rounded-lg backdrop-blur-sm">
                <p className="text-blue-100">Last login: {new Date().toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="bg-white/10 backdrop-blur-sm rounded-lg p-5 text-white"
          >
            <p className="text-blue-200 text-sm">Mentor Connections</p>
            <p className="text-3xl font-bold">{stats.activeConnections || 0}</p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="bg-white/10 backdrop-blur-sm rounded-lg p-5 text-white"
          >
            <p className="text-blue-200 text-sm">Pending Requests</p>
            <p className="text-3xl font-bold">{stats.pendingRequests || 0}</p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            className="bg-white/10 backdrop-blur-sm rounded-lg p-5 text-white"
          >
            <p className="text-blue-200 text-sm">Upcoming Webinars</p>
            <p className="text-3xl font-bold">{stats.upcomingWebinars || 0}</p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.4 }}
            className="bg-white/10 backdrop-blur-sm rounded-lg p-5 text-white"
          >
            <p className="text-blue-200 text-sm">Unread Messages</p>
            <p className="text-3xl font-bold">{stats.unreadMessages || 0}</p>
          </motion.div>
        </div>

        {/* Main Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-gradient-to-br from-blue-700 to-blue-900 rounded-xl overflow-hidden shadow-lg"
          >
            <div className="h-2 bg-blue-500"></div>
            <div className="p-6">
              <h3 className="text-xl font-bold text-white mb-4">Find Your Mentor</h3>
              <p className="text-blue-200 mb-6">Discover mentors matched to your interests and career goals</p>
              <Link 
                to="/mentor-recommendations" 
                className="block w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg text-center font-medium transition-colors"
              >
                View Recommendations
              </Link>
            </div>
          </motion.div>
          
          {/* Add My Mentors card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="bg-gradient-to-br from-green-700 to-green-900 rounded-xl overflow-hidden shadow-lg"
          >
            <div className="h-2 bg-green-500"></div>
            <div className="p-6">
              <h3 className="text-xl font-bold text-white mb-4">My Mentors</h3>
              <p className="text-green-200 mb-6">Connect with your mentors and view their profiles</p>
              <Link 
                to="/my-mentors" 
                className="block w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg text-center font-medium transition-colors"
              >
                View My Mentors
              </Link>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-gradient-to-br from-purple-700 to-purple-900 rounded-xl overflow-hidden shadow-lg"
          >
            <div className="h-2 bg-purple-500"></div>
            <div className="p-6">
              <h3 className="text-xl font-bold text-white mb-4">AI Career Assistant</h3>
              <p className="text-purple-200 mb-6">Get instant career guidance and answers to your questions</p>
              <Link 
                to="/chatbot" 
                className="block w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg text-center font-medium transition-colors"
              >
                Chat Now
              </Link>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-gradient-to-br from-indigo-700 to-indigo-900 rounded-xl overflow-hidden shadow-lg"
          >
            <div className="h-2 bg-indigo-500"></div>
            <div className="p-6">
              <h3 className="text-xl font-bold text-white mb-4">Upcoming Webinars</h3>
              <p className="text-indigo-200 mb-6">Join live sessions and watch recorded webinars from alumni</p>
              <Link 
                to="/webinars" 
                className="block w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg text-center font-medium transition-colors"
              >
                Browse Webinars
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Profile & Preferences */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl overflow-hidden shadow-lg mb-10"
        >
          <div className="p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-white mb-2">Your Matching Preferences</h3>
                <p className="text-gray-400">Update your interests and career goals to get better mentor matches</p>
              </div>
              <Link 
                to="/matching-preferences" 
                className="mt-4 md:mt-0 bg-gray-700 hover:bg-gray-600 text-white py-2 px-6 rounded-lg text-center font-medium transition-colors inline-block"
              >
                Update Preferences
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Quick Links */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <h3 className="text-xl font-bold text-white mb-4">Quick Links</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link to="/dashboard" className="bg-white/10 hover:bg-white/20 backdrop-blur-sm p-4 rounded-lg text-white transition-colors">
              <p className="font-medium">Dashboard</p>
            </Link>
            <Link to="/chatroom" className="bg-white/10 hover:bg-white/20 backdrop-blur-sm p-4 rounded-lg text-white transition-colors">
              <p className="font-medium">Common Room</p>
            </Link>
            <Link to="/find-mentor" className="bg-white/10 hover:bg-white/20 backdrop-blur-sm p-4 rounded-lg text-white transition-colors">
              <p className="font-medium">Find Mentors</p>
            </Link>
            <Link to="/profile" className="bg-white/10 hover:bg-white/20 backdrop-blur-sm p-4 rounded-lg text-white transition-colors">
              <p className="font-medium">My Profile</p>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );

  // Alumni landing page
  const AlumniLanding = () => (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-indigo-900 pt-20 pb-10 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Welcome Banner */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-gradient-to-r from-indigo-700 to-purple-700 rounded-xl shadow-2xl p-8 mb-10 text-white"
        >
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">Welcome back, {user?.name || 'Alumni'}!</h1>
              <p className="text-xl text-indigo-200">Your mentorship makes a difference</p>
            </div>
            <div className="mt-6 md:mt-0">
              <div className="bg-white/10 p-4 rounded-lg backdrop-blur-sm">
                <p className="text-indigo-100">Last login: {new Date().toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="bg-white/10 backdrop-blur-sm rounded-lg p-5 text-white"
          >
            <p className="text-indigo-200 text-sm">Active Mentees</p>
            <p className="text-3xl font-bold">{stats.activeConnections || 0}</p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="bg-white/10 backdrop-blur-sm rounded-lg p-5 text-white"
          >
            <p className="text-indigo-200 text-sm">Pending Requests</p>
            <p className="text-3xl font-bold">{stats.pendingRequests || 0}</p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            className="bg-white/10 backdrop-blur-sm rounded-lg p-5 text-white"
          >
            <p className="text-indigo-200 text-sm">Hosted Webinars</p>
            <p className="text-3xl font-bold">{stats.upcomingWebinars || 0}</p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.4 }}
            className="bg-white/10 backdrop-blur-sm rounded-lg p-5 text-white"
          >
            <p className="text-indigo-200 text-sm">Unread Messages</p>
            <p className="text-3xl font-bold">{stats.unreadMessages || 0}</p>
          </motion.div>
        </div>

        {/* Main Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-gradient-to-br from-indigo-700 to-indigo-900 rounded-xl overflow-hidden shadow-lg"
          >
            <div className="h-2 bg-indigo-500"></div>
            <div className="p-6">
              <h3 className="text-xl font-bold text-white mb-4">Mentorship Requests</h3>
              <p className="text-indigo-200 mb-6">Review and respond to students seeking your guidance</p>
              <Link 
                to="/requests" 
                className="block w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg text-center font-medium transition-colors"
              >
                View Requests
              </Link>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-gradient-to-br from-purple-700 to-purple-900 rounded-xl overflow-hidden shadow-lg"
          >
            <div className="h-2 bg-purple-500"></div>
            <div className="p-6">
              <h3 className="text-xl font-bold text-white mb-4">Host a Webinar</h3>
              <p className="text-purple-200 mb-6">Share your knowledge and experience with students</p>
              <Link 
                to="/webinars" 
                className="block w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg text-center font-medium transition-colors"
              >
                Schedule Webinar
              </Link>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-gradient-to-br from-blue-700 to-blue-900 rounded-xl overflow-hidden shadow-lg"
          >
            <div className="h-2 bg-blue-500"></div>
            <div className="p-6">
              <h3 className="text-xl font-bold text-white mb-4">My Mentees</h3>
              <p className="text-blue-200 mb-6">Manage your current mentorship connections</p>
              <Link 
                to="/my-mentees" 
                className="block w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg text-center font-medium transition-colors"
              >
                View Mentees
              </Link>
            </div>
          </motion.div>
        </div>

        

        {/* Mentor Profile */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl overflow-hidden shadow-lg mb-10"
        >
          <div className="p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-white mb-2">Your Mentor Profile</h3>
                <p className="text-gray-400">Update your expertise and availability to attract the right mentees</p>
              </div>
              <Link 
                to="/alumni-matching-profile" 
                className="mt-4 md:mt-0 bg-gray-700 hover:bg-gray-600 text-white py-2 px-6 rounded-lg text-center font-medium transition-colors inline-block"
              >
                Update Profile
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Quick Links */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <h3 className="text-xl font-bold text-white mb-4">Quick Links</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link to="/dashboard" className="bg-white/10 hover:bg-white/20 backdrop-blur-sm p-4 rounded-lg text-white transition-colors">
              <p className="font-medium">Dashboard</p>
            </Link>
            <Link to="/chatroom" className="bg-white/10 hover:bg-white/20 backdrop-blur-sm p-4 rounded-lg text-white transition-colors">
              <p className="font-medium">Messages</p>
            </Link>
            <Link to="/webinars" className="bg-white/10 hover:bg-white/20 backdrop-blur-sm p-4 rounded-lg text-white transition-colors">
              <p className="font-medium">My Webinars</p>
            </Link>
            <Link to="/profile" className="bg-white/10 hover:bg-white/20 backdrop-blur-sm p-4 rounded-lg text-white transition-colors">
              <p className="font-medium">My Profile</p>
            </Link>
          </div>
        </motion.div>

        
      </div>
    </div>
  );

  return (
    <>
      {isLoading ? (
        <div className="min-h-screen flex justify-center items-center bg-gradient-to-b from-blue-900 to-indigo-900">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-white"></div>
        </div>
      ) : error ? (
        <div className="min-h-screen flex justify-center items-center bg-gradient-to-b from-blue-900 to-indigo-900 p-6">
          <div className="bg-red-900/30 border-l-4 border-red-500 p-6 rounded-lg max-w-lg">
            <h3 className="text-xl font-bold text-white mb-2">Error Loading Dashboard</h3>
            <p className="text-red-200">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-4 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded"
            >
              Try Again
            </button>
          </div>
        </div>
      ) : (
        role === 'student' ? <StudentLanding /> : <AlumniLanding />
      )}
    </>
  );
};

export default LandingPage;
