import React, { useState, useEffect } from 'react';
import axios from 'axios';

const WebinarSchedulerFeed = () => {
  const token = localStorage.getItem('token');
  const [webinars, setWebinars] = useState([]);
  const [liveWebinars, setLiveWebinars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'upcoming', 'past', 'live'

  useEffect(() => {
    const fetchWebinars = async () => {
      try {
        setLoading(true);
        // Fetch regular webinars
        const webinarResponse = await axios.get('http://localhost:5000/api/videos/student/webinars', {
          headers: { Authorization: token },
        });
        
        // Fetch live webinars
        const liveResponse = await axios.get('http://localhost:5000/api/videos/student/live-webinars', {
          headers: { Authorization: token },
        });
        
        setWebinars(webinarResponse.data);
        setLiveWebinars(liveResponse.data);
      } catch (error) {
        console.error("Error fetching webinars:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchWebinars();
    
    // Set up polling for live webinars every 30 seconds
    const intervalId = setInterval(() => {
      fetchLiveWebinars();
    }, 30000);
    
    return () => clearInterval(intervalId);
  }, [token]);
  
  // Separate function to fetch only live webinars for polling
  const fetchLiveWebinars = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/videos/student/live-webinars', {
        headers: { Authorization: token },
      });
      setLiveWebinars(response.data);
    } catch (error) {
      console.error("Error fetching live webinars:", error);
    }
  };

  // Combine and filter webinars
  const filteredWebinars = [...webinars, ...liveWebinars.filter(live => 
    !webinars.some(w => w._id === live._id)
  )].filter(webinar => {
    const webinarDate = new Date(webinar.scheduledAt);
    const now = new Date();
    
    if (filter === 'live') return webinar.isLive;
    if (filter === 'upcoming') return webinarDate > now && !webinar.isLive;
    if (filter === 'past') return webinarDate <= now && !webinar.isLive;
    return true; // 'all'
  });

  // Get webinar status
  const getWebinarStatus = (webinar) => {
    if (webinar.isLive) {
      return { status: 'Live Now', color: 'bg-red-500 text-white' };
    }
    
    const now = new Date();
    const webinarTime = new Date(webinar.scheduledAt);
    const timeDiff = webinarTime - now;
    
    if (timeDiff > 0) return { status: 'Upcoming', color: 'bg-blue-100 text-blue-800' };
    if (timeDiff > -3600000) return { status: 'Recent', color: 'bg-yellow-100 text-yellow-800' };
    return { status: 'Past', color: 'bg-gray-100 text-gray-800' };
  };
  
  // Join live webinar
  const joinLiveWebinar = async (webinarId) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/videos/can-join/${webinarId}`, {
        headers: { Authorization: token },
      });
      
      if (response.data.canJoin) {
        // Redirect to live room or open in new tab
        window.open(`/live-webinar/${webinarId}?roomId=${response.data.webinar.liveRoomId}`, '_blank');
      }
    } catch (error) {
      console.error("Error joining live webinar:", error);
      alert(error.response?.data?.message || "Unable to join the live webinar");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-blue-50 pt-20 pb-10 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Webinar Feed</h2>
          <p className="text-gray-600 mb-6">Watch recorded webinars or join upcoming live sessions from your mentors</p>
          
          {/* Filter controls */}
          <div className="flex flex-wrap gap-2 mb-6">
            <button 
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-md transition-colors ${
                filter === 'all' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              All Webinars
            </button>
            <button 
              onClick={() => setFilter('live')}
              className={`px-4 py-2 rounded-md transition-colors ${
                filter === 'live' 
                  ? 'bg-red-600 text-white' 
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              Live Now {liveWebinars.length > 0 && `(${liveWebinars.length})`}
            </button>
            <button 
              onClick={() => setFilter('upcoming')}
              className={`px-4 py-2 rounded-md transition-colors ${
                filter === 'upcoming' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              Upcoming
            </button>
            <button 
              onClick={() => setFilter('past')}
              className={`px-4 py-2 rounded-md transition-colors ${
                filter === 'past' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              Past Webinars
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : filteredWebinars.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
            </svg>
            <p className="text-xl text-gray-600">No webinars available from your mentors.</p>
            <p className="text-gray-500 mt-2">Check back later for new content.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredWebinars.map((webinar) => {
              const { status, color } = getWebinarStatus(webinar);
              return (
                <div key={webinar._id} className={`bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:scale-[1.02] hover:shadow-lg ${webinar.isLive ? 'ring-2 ring-red-500' : ''}`}>
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-xl font-semibold text-gray-800">{webinar.title}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${color}`}>
                        {status}
                      </span>
                    </div>
                    
                    <p className="text-gray-600 mb-4 line-clamp-2">{webinar.description}</p>
                    
                    <div className="flex items-center text-sm text-gray-500 mb-2">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                      </svg>
                      {new Date(webinar.scheduledAt).toLocaleString()}
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-500 mb-2">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                      </svg>
                      {webinar.host?.name || 'Unknown'}
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-500 mb-4">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                      </svg>
                      {webinar.videoType === 'live' ? 'Live Session' : 'Recorded Video'}
                    </div>
                    
                    {webinar.isLive && (
                      <button 
                        onClick={() => joinLiveWebinar(webinar._id)}
                        className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-md mb-4 flex items-center justify-center"
                      >
                        <svg className="w-5 h-5 mr-2 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                        </svg>
                        Join Live Session
                      </button>
                    )}
                    
                    {webinar.videoLink && !webinar.isLive && (
                      <a 
                        href={webinar.videoLink} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4 transition-colors"
                      >
                        <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                        </svg>
                        {webinar.videoType === 'live' ? "Join Live Session" : "Watch External Video"}
                      </a>
                    )}
                  </div>
                  
                  {webinar.isUploaded && !webinar.isLive && (
                    <div className="border-t border-gray-100">
                      <div className="aspect-w-16 aspect-h-9">
                        <video 
                          controls 
                          className="w-full h-full object-cover"
                          src={`http://localhost:5000/api/videos/stream/${webinar._id}`}
                          poster="/video-thumbnail.png"
                        >
                          Your browser does not support the video tag.
                        </video>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default WebinarSchedulerFeed;