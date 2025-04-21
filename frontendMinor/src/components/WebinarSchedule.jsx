import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
// Fix the import to use the named export
import { EmbeddedVideoPlayer } from './WebinarVideoPlayer';
import { Link, useNavigate } from 'react-router-dom';

const WebinarSchedule = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  const fileInputRef = useRef(null);

  const [webinars, setWebinars] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newWebinar, setNewWebinar] = useState({
    title: '',
    description: '',
    scheduledAt: '',
    videoType: 'recorded',
    videoLink: ''
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [youtubeConnected, setYoutubeConnected] = useState(false);
  const [uploadToYoutube, setUploadToYoutube] = useState(true);
  
  // Check YouTube connection status on mount
  useEffect(() => {
    const checkYoutubeConnection = async () => {
      try {
        const { data } = await axios.get('http://localhost:5000/api/videos/youtube-status', {
          headers: { Authorization: token }
        });
        setYoutubeConnected(data.connected);
      } catch (error) {
        console.error("Error checking YouTube connection:", error);
        setYoutubeConnected(false);
      }
    };
    
    if (role === 'alumni') {
      checkYoutubeConnection();
    }
  }, [role, token]);
  
  // Fetch webinars on component mount
  useEffect(() => {
    fetchWebinars();
  }, [role]);
  // API calls
  const fetchWebinars = async () => {
    try {
      setIsLoading(true);
      const endpoint = role === 'alumni' ? 'http://localhost:5000/api/alumni/my-webinars' : 'http://localhost:5000/api/student/getter/webinars';
      const { data } = await axios.get(endpoint, { headers: { Authorization: token } });
      setWebinars(data);
    } catch (error) {
      console.error("Error fetching webinars:", error);
    } finally {
      setIsLoading(false);
    }
  };
  // Form handling
  const handleInputChange = e => setNewWebinar(prev => ({ ...prev, [e.target.name]: e.target.value }));
  const scheduleWebinar = async e => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/alumni/webinar', newWebinar, { headers: { Authorization: token } });
      setNewWebinar({ title: '', description: '', scheduledAt: '', videoType: 'recorded', videoLink: '' });
      fetchWebinars();
    } catch (err) {
      console.error(err);
    }
  };
  // Connect to YouTube
  const connectToYoutube = async () => {
    try {
      const { data } = await axios.get('http://localhost:5000/api/videos/youtube-auth-url', {
        headers: { Authorization: token }
      });
      window.open(data.authUrl, '_blank');
    } catch (error) {
      console.error("Error getting YouTube auth URL:", error);
      alert("Could not connect to YouTube. Please try again later.");
    }
  };
  
  // Add reconnect YouTube function
  const reconnectYoutube = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/videos/youtube-auth-url', {
        headers: { Authorization: token }
      });
      
      // Open the authorization URL in a new window
      window.open(response.data.authUrl, '_blank');
      
      // Show a message to the user
      alert('Please complete the YouTube authorization in the new window. After authorizing, you can upload videos to YouTube.');
    } catch (error) {
      console.error('Error getting YouTube auth URL:', error);
      alert('Failed to connect to YouTube. Please try again later.');
    }
  };
  
  // Video handling
  const uploadVideo = async webinarId => {
    if (!selectedFile) return;
    
    const formData = new FormData();
    formData.append('video', selectedFile);
    formData.append('uploadToYoutube', uploadToYoutube.toString());
    
    setUploading(true);
    try {
      await axios.post(`http://localhost:5000/api/videos/upload/${webinarId}`, formData, {
        headers: { Authorization: token, 'Content-Type': 'multipart/form-data' },
        onUploadProgress: e => setUploadProgress(Math.round((e.loaded * 100) / e.total))
      });
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      fetchWebinars();
    } catch (error) {
      console.error("Error uploading video:", error);
      alert(error.response?.data?.message || "Error uploading video. Please try again.");
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };
  const deleteVideo = async webinarId => {
    if (!window.confirm("Are you sure you want to delete this video?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/videos/delete/${webinarId}`, { headers: { Authorization: token } });
      fetchWebinars();
    } catch (error) {
      console.error("Error deleting video:", error);
    }
  };
  // Helper functions
  const getWebinarStatus = scheduledAt => {
    const now = new Date();
    const webinarTime = new Date(scheduledAt);
    const timeDiff = webinarTime - now;
    
    if (timeDiff > 0) return { status: 'Upcoming', color: 'bg-blue-100 text-blue-800' };
    if (timeDiff > -3600000) return { status: 'Live', color: 'bg-red-100 text-red-800' };
    return { status: 'Past', color: 'bg-gray-100 text-gray-800' };
  };
  // Function to join a live stream
  const joinLiveStream = async (webinarId) => {
    try {
      const response = await axios.get(`${API_URL}/api/videos/webinar/${webinarId}/stream-info`);
      
      // Get the stream URL from the response
      const { streamUrl } = response.data;
      
      // Redirect to the streaming platform
      window.location.href = streamUrl;
    } catch (error) {
      console.error("Error joining live stream:", error);
      // Show error message to user
      alert(error.response?.data?.message || "Error joining live stream");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold text-gray-800">
          {role === 'alumni' ? "Manage Your Webinars" : "Available Webinars"}
        </h2>
        <p className="mt-2 text-gray-600">
          {role === 'alumni' ? "Schedule and manage your webinars for students" : "Watch recorded webinars or join live sessions"}
        </p>
      </div>
      
      {/* Add YouTube connection section for alumni */}
      {role === 'alumni' && (
        <div className="bg-white rounded-lg shadow p-6 mb-8 max-w-xl mx-auto">
          <h3 className="text-xl font-semibold mb-4 text-gray-700">YouTube Integration</h3>
          <p className="mb-4 text-gray-600">
            Connect your YouTube account to upload webinar videos directly to your channel.
          </p>
          <div className="flex flex-wrap gap-2">
            <button 
              onClick={connectToYoutube}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition-colors"
            >
              Connect YouTube Account
            </button>
            {youtubeConnected ? (
              <>
                <p className="mt-2 text-green-600 w-full">✓ YouTube account connected</p>
                <button 
                  onClick={reconnectYoutube}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md transition-colors text-sm"
                >
                  Reconnect Account
                </button>
              </>
            ) : (
              <p className="mt-2 text-yellow-600 w-full">YouTube account not connected</p>
            )}
          </div>
        </div>
      )}
      {role === 'alumni' && (
        <div className="bg-white rounded-lg shadow p-6 mb-8 max-w-xl mx-auto">
          <h3 className="text-xl font-semibold mb-4 text-gray-700">Schedule a New Webinar</h3>
          <form onSubmit={scheduleWebinar}>
            <input name="title" type="text" placeholder="Title" value={newWebinar.title} 
              onChange={handleInputChange} required className="w-full border border-gray-300 rounded-md px-3 py-2 mb-4" />
            <textarea name="description" placeholder="Description" value={newWebinar.description} 
              onChange={handleInputChange} required className="w-full border border-gray-300 rounded-md px-3 py-2 mb-4" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <input name="scheduledAt" type="datetime-local" value={newWebinar.scheduledAt} 
                onChange={handleInputChange} required className="border border-gray-300 rounded-md px-3 py-2" />
              <select name="videoType" value={newWebinar.videoType} onChange={handleInputChange} 
                required className="border border-gray-300 rounded-md px-3 py-2">
                <option value="live">Live Session</option>
                <option value="recorded">Recorded Video</option>
              </select>
            </div>
            <input name="videoLink" type="text" placeholder="External Link (optional)" value={newWebinar.videoLink} 
              onChange={handleInputChange} className="w-full border border-gray-300 rounded-md px-3 py-2 mb-4" />
            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded">
              Schedule Webinar
            </button>
          </form>
        </div>
      )}
      <h3 className="text-2xl font-semibold mb-6 text-gray-800 text-center">
        {role === 'alumni' ? 'Your Webinars' : 'Available Webinars'}
      </h3>
      
      {isLoading ? (
        <div className="flex justify-center items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : webinars.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600">
            {role === 'alumni' ? 'You have not scheduled any webinars yet.' : 'No webinars are available at this time.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {webinars.map(webinar => {
            const { status, color } = getWebinarStatus(webinar.scheduledAt);
            return (
              <div key={webinar._id} className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold text-gray-800">{webinar.title}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${color}`}>{status}</span>
                </div>
                <p className="text-gray-700 mb-4">{webinar.description}</p>
                <div className="text-sm text-gray-500 mb-4">
                  <p><span className="font-medium">Scheduled:</span> {new Date(webinar.scheduledAt).toLocaleString()}</p>
                  <p><span className="font-medium">Type:</span> {webinar.videoType === 'live' ? 'Live Session' : 'Recorded Video'}</p>
                </div>
                
                {webinar.videoLink && (
                  <div className="mb-4">
                    {webinar.videoType === 'live' ? (
                      <Link 
                        to={`http://localhost:3000//student/view?room=${webinar._id}`}
                        className="text-blue-600 hover:text-blue-800 inline-block"
                      >
                        Join Live Stream
                      </Link>
                    ) : (
                      <a href={webinar.videoLink} target="_blank" rel="noopener noreferrer" 
                        className="text-blue-600 hover:text-blue-800 inline-block">
                        Watch External Video
                      </a>
                    )}
                  </div>
                )}
                
                {role === 'alumni' && (
                  <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded">
                    {webinar.isUploaded ? (
                      <div className="flex items-center justify-between">
                        <p className="text-green-600">Video uploaded successfully</p>
                        <button onClick={() => deleteVideo(webinar._id)}
                          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded">Delete Video</button>
                      </div>
                    ) : (
                      <>
                        <input type="file" accept="video/*" onChange={e => setSelectedFile(e.target.files[0])} ref={fileInputRef}
                          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 
                          file:text-sm file:bg-blue-500 file:text-blue-700 mb-3" />
                        
                        {youtubeConnected && (
                          <div className="flex items-center mb-3">
                            <input
                              type="checkbox"
                              id={`youtube-upload-${webinar._id}`}
                              checked={uploadToYoutube}
                              onChange={() => setUploadToYoutube(!uploadToYoutube)}
                              className="mr-2"
                            />
                            <label htmlFor={`youtube-upload-${webinar._id}`} className="text-sm text-gray-700">
                              Also upload to my YouTube channel
                            </label>
                          </div>
                        )}
                        
                        <button onClick={() => uploadVideo(webinar._id)} disabled={uploading || !selectedFile}
                          className={`w-full bg-blue-600 text-white py-2 px-4 rounded ${uploading || !selectedFile ? 'opacity-50' : 'hover:bg-blue-700'}`}>
                          {uploading ? `Uploading (${uploadProgress}%)` : 'Upload Video'}
                        </button>
                        {uploading && (
                          <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                            <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${uploadProgress}%` }}></div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
                {/* http://localhost:5173/view-stream/680607a3f0bf5038050b5d92 */}
                {/* Add this section to always show Start Live Stream for alumni with live webinars */}
                {webinar.videoType === 'live' && role === 'alumni' && (
                  <div className="mt-4">
                    {webinar.isLive ? (
                      <>
                        <a 
                          href={`http://localhost:3000/alumni/host?room=${webinar._id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg transition-colors text-center block mb-2"
                        >
                          Continue Live Stream
                        </a>
                        <div className="mt-2 p-3 bg-gray-100 rounded-lg">
                          <p className="text-sm font-medium text-gray-700 mb-1">Student Join Link:</p>
                          <div className="flex items-center">
                            <input 
                              type="text" 
                              value={`http://localhost:3000/student/view?room=${webinar._id}`}
                              readOnly
                              className="flex-1 border border-gray-300 rounded-l-md px-3 py-2 text-sm bg-white"
                            />
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(`http://localhost:3000/student/view?room=${webinar._id}`);
                                alert('Link copied to clipboard!');
                              }}
                              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-r-md text-sm"
                            >
                              Copy
                            </button>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">Share this link with students to join your stream</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <a 
                          href={`http://localhost:3000/alumni/host?room=${webinar._id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg transition-colors text-center block"
                        >
                          Start Live Stream
                        </a>
                        <div className="mt-2 p-3 bg-gray-100 rounded-lg">
                          <p className="text-sm font-medium text-gray-700 mb-1">Student Join Link (available after starting):</p>
                          <div className="flex items-center">
                            <input 
                              type="text" 
                              value={`http://localhost:3000/student/view?room=${webinar._id}`}
                              readOnly
                              className="flex-1 border border-gray-300 rounded-l-md px-3 py-2 text-sm bg-white"
                            />
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(`http://localhost:3000/student/view?room=${webinar._id}`);
                                alert('Link copied to clipboard!');
                              }}
                              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-r-md text-sm"
                            >
                              Copy
                            </button>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">Share this link with students to join your stream</p>
                        </div>
                      </>
                    )}
                  </div>
                )}
                
                {/* Add a dedicated video player section for students */}
                {role === 'student' && webinar.videoType === 'recorded' && (
                  <div className="mt-4">
                    <Link 
                      to={`/webinar-video/${webinar._id}`}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md flex items-center justify-center mb-4"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Watch Full Video
                    </Link>
                    
                    {/* Preview thumbnail that's also clickable */}
                    {(webinar.videoDetails || webinar.videoFile) && (
                      <div 
                        className="relative rounded-lg overflow-hidden bg-gray-100 h-48 cursor-pointer" 
                        onClick={() => navigate(`/webinar-video/${webinar._id}`)}
                      >
                        <div className="absolute inset-0 flex items-center justify-center">
                          <svg className="w-16 h-16 text-blue-500 opacity-80" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                          <p className="text-white text-sm font-medium truncate">{webinar.title}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Modified section for student view - keep this as a preview if needed */}
                {role === 'student' && webinar.videoType === 'recorded' && webinar.videoDetails?.embedUrl && (
                  <div className="mt-4">
                    <div className="aspect-w-16 aspect-h-9">
                      <iframe
                        src={webinar.videoDetails.embedUrl}
                        title={webinar.title}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="w-full h-full rounded-lg"
                      ></iframe>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                      Watch the recorded session on YouTube.
                    </p>
                  </div>
                )}
                {!webinar.isLive && webinar.videoUrl && (
                  <Link 
                    to={`/webinar-video/${webinar._id}`}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded inline-block ml-2"
                  >
                    Watch Recording
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );};

export default WebinarSchedule;
