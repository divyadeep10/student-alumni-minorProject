import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const MyWebinars = () => {
  const navigate = useNavigate();
  const [webinars, setWebinars] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedWebinarId, setSelectedWebinarId] = useState(null);
  const fileInputRefs = useRef({});
  
  // Define API URL constant
  const API_URL = 'http://localhost:5000';
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchWebinars = async () => {
      try {
        if (!token) {
          navigate('/login');
          return;
        }
        
        const response = await axios.get(`${API_URL}/api/alumni/my-webinars`, {
          headers: { Authorization: token }
        });
        setWebinars(response.data);
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching webinars:', err);
        setError('Failed to load webinars');
        setIsLoading(false);
      }
    };

    fetchWebinars();
  }, [navigate, token]);

  // Navigate to dedicated upload page
  const handleUploadClick = (webinarId) => {
    navigate(`/webinar-upload/${webinarId}`);
  };

  const handleDeleteVideo = async (webinarId) => {
    if (!window.confirm("Are you sure you want to delete this video?")) return;
    
    try {
      await axios.delete(`${API_URL}/api/videos/delete/${webinarId}`, {
        headers: { Authorization: token }
      });
      
      setSuccess('Video deleted successfully');
      
      // Refresh the webinars list
      const updatedWebinars = await axios.get(`${API_URL}/api/alumni/my-webinars`, {
        headers: { Authorization: token }
      });
      setWebinars(updatedWebinars.data);
    } catch (error) {
      console.error("Error deleting video:", error);
      setError(error.response?.data?.message || "Error deleting video");
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Add state for stream URL
  const [streamUrl, setStreamUrl] = useState('');
  
  // Function to start a live stream
  const handleGoLive = async (webinarId) => {
    try {
      setIsLoading(true);
      const response = await axios.put(`${API_URL}/api/videos/webinar/${webinarId}/go-live`, {}, {
        headers: { Authorization: token }
      });
      
      // Direct to the streaming platform
      window.location.href = `http://localhost:3000/alumni/host?room=${webinarId}`;
    } catch (error) {
      console.error("Error starting live stream:", error);
      setError(error.response?.data?.message || "Error starting live stream");
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-900 to-indigo-900 pt-20 pb-10 px-4 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 to-indigo-900 pt-20 pb-10 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Dashboard Link */}
        <div className="mb-6">
          <Link to="/dashboard" className="inline-flex items-center text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to Dashboard
          </Link>
        </div>

        {/* Error and Success Messages */}
        {error && (
          <div className="bg-red-500 text-white p-4 rounded-lg mb-6">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-500 text-white p-4 rounded-lg mb-6">
            {success}
          </div>
        )}

        <h1 className="text-3xl font-bold text-white mb-6">My Webinars</h1>
        
        {/* Create New Webinar Button */}
        <div className="mb-8">
          <Link to="/webinars" className="inline-flex items-center text-white bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Schedule a New Webinar
          </Link>
        </div>

        {webinars.length === 0 ? (
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 text-center text-white">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-blue-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <p className="text-xl mb-4">You haven't created any webinars yet.</p>
            <Link to="/webinars" className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-lg transition-colors">
              Schedule Your First Webinar
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {webinars.map(webinar => (
              <div key={webinar._id} className="bg-white/10 backdrop-blur-sm rounded-xl overflow-hidden shadow-lg">
                <div className="p-6">
                  <h3 className="text-xl font-bold text-white mb-2">{webinar.title}</h3>
                  <p className="text-blue-200 mb-2">
                    <span className="font-semibold">Scheduled for:</span> {formatDate(webinar.scheduledAt)}
                  </p>
                  <p className="text-white mb-4 line-clamp-3">{webinar.description}</p>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {webinar.isUploaded ? (
                      <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">Video Available</span>
                    ) : (
                      <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded-full">No Video</span>
                    )}
                    
                    {webinar.isLive && (
                      <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">Live Now</span>
                    )}
                    
                    <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                      {webinar.videoType.charAt(0).toUpperCase() + webinar.videoType.slice(1)}
                    </span>
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    {new Date(webinar.scheduledAt) <= new Date() && !webinar.isLive && webinar.videoType === "live" && (
                      <button 
                        className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg transition-colors"
                        onClick={() => handleGoLive(webinar._id)}
                      >
                        Start Live Stream
                      </button>
                    )}
                    
                    {webinar.isLive && (
                      <button 
                        className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg transition-colors"
                        onClick={() => window.location.href = `http://localhost:3000/alumni/host?room=${webinar._id}`}
                      >
                        Continue Live Stream
                      </button>
                    )}
                    
                    {!webinar.isUploaded ? (
                      <button 
                        className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition-colors"
                        onClick={() => handleUploadClick(webinar._id)}
                      >
                        Upload Video
                      </button>
                    ) : (
                      <>
                        <a 
                          href={webinar.videoFile?.url} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors text-center"
                        >
                          Watch Video
                        </a>
                        <button 
                          className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg transition-colors"
                          onClick={() => handleDeleteVideo(webinar._id)}
                        >
                          Delete Video
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyWebinars;