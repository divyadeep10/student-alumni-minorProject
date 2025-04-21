import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

// Create a reusable embedded video player component that can be exported
export const EmbeddedVideoPlayer = ({ videoSource, title, thumbnailUrl, className = "" }) => {
  if (!videoSource) return null;
  
  return (
    <div className={`aspect-w-16 aspect-h-9 ${className}`}>
      {videoSource.type === 'youtube' ? (
        <iframe
          src={videoSource.url}
          title={title}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full rounded-lg"
        ></iframe>
      ) : (
        <video
          controls
          className="w-full h-full object-contain rounded-lg"
          src={videoSource.url}
          poster={thumbnailUrl}
        >
          Your browser does not support the video tag.
        </video>
      )}
    </div>
  );
};

// This component is for the standalone video player page
const WebinarVideoPlayer = () => {
  const { webinarId } = useParams();
  const [webinar, setWebinar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchWebinar = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:5000/api/videos/${webinarId}`, {
          headers: { Authorization: token }
        });
        console.log("Fetched webinar data:", response.data);
        setWebinar(response.data);
        setError('');
      } catch (err) {
        console.error('Error fetching webinar:', err);
        setError('Failed to load webinar video. ' + (err.response?.data?.message || ''));
      } finally {
        setLoading(false);
      }
    };

    if (webinarId) {
      fetchWebinar();
    }
  }, [webinarId, token]);

  // Keep your existing code here, just add the getVideoSource function if it doesn't exist
  const getVideoSource = () => {
    if (!webinar) return null;

    // Check for YouTube embed URL
    if (webinar.videoDetails?.embedUrl || webinar.videoFile?.embedUrl) {
      return {
        type: 'youtube',
        url: webinar.videoDetails?.embedUrl || webinar.videoFile?.embedUrl
      };
    }

    // Check for YouTube video link
    if (webinar.videoLink && webinar.videoLink.includes('youtube.com')) {
      // Convert standard YouTube URL to embed URL
      let videoId = '';
      if (webinar.videoLink.includes('watch?v=')) {
        videoId = webinar.videoLink.split('watch?v=')[1].split('&')[0];
      } else if (webinar.videoLink.includes('youtu.be/')) {
        videoId = webinar.videoLink.split('youtu.be/')[1];
      }
      
      if (videoId) {
        return {
          type: 'youtube',
          url: `https://www.youtube.com/embed/${videoId}`
        };
      }
    }

    // Check for local video file
    if (webinar.videoDetails?.localUrl || webinar.videoFile?.url) {
      return {
        type: 'local',
        url: webinar.videoDetails?.localUrl || webinar.videoFile?.url
      };
    }

    // Check for filename
    if (webinar.videoDetails?.filename || webinar.videoFile?.filename) {
      return {
        type: 'local',
        url: `http://localhost:5000/uploads/videos/${webinar.videoDetails?.filename || webinar.videoFile?.filename}`
      };
    }

    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-blue-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-3 text-gray-700">Loading video...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-blue-50 p-6">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded mb-4">
            <p className="font-medium">Error</p>
            <p>{error}</p>
          </div>
          <button 
            onClick={() => navigate(-1)} 
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!webinar) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-blue-50 p-6">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
          <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded mb-4">
            <p>Webinar not found.</p>
          </div>
          <button 
            onClick={() => navigate(-1)} 
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const videoSource = getVideoSource();

  return (
    // Your existing return statement, but use the EmbeddedVideoPlayer component
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-blue-50 pt-20 pb-10 px-4">
      {/* Rest of your UI code */}
      
      {/* Replace your video player code with the EmbeddedVideoPlayer component */}
      {!loading && !error && webinar && (
        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
          <div className="p-6">
            <div className="flex justify-between items-start mb-4">
              <h1 className="text-2xl font-bold text-gray-800">{webinar.title}</h1>
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {new Date(webinar.scheduledAt).toLocaleString()}
              </span>
            </div>
            
            {/* Video Player - LARGER SIZE */}
            <div className="mb-6">
              <EmbeddedVideoPlayer 
                videoSource={getVideoSource()} 
                title={webinar.title}
                thumbnailUrl={webinar.videoDetails?.thumbnailUrl || webinar.videoFile?.thumbnailUrl}
                className="w-full h-[70vh]" 
              />
            </div>
            
            <p className="text-gray-600 mb-6">{webinar.description}</p>
            
            {/* Rest of your UI code */}
            
            <button 
              onClick={() => navigate(-1)} 
              className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md"
            >
              Back to Webinars
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WebinarVideoPlayer;