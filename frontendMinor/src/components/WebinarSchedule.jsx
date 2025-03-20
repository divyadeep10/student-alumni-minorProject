import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const WebinarSchedule = () => {
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
  // Video handling
  const uploadVideo = async webinarId => {
    if (!selectedFile) return;
    
    const formData = new FormData();
    formData.append('video', selectedFile);
    
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
                  <a href={webinar.videoLink} target="_blank" rel="noopener noreferrer" 
                    className="text-blue-600 hover:text-blue-800 inline-block mb-4">
                    {webinar.videoType === 'live' ? "Join Live Session" : "Watch External Video"}
                  </a>
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
                          file:text-sm file:bg-blue-50 file:text-blue-700 mb-3" />
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
                
                {webinar.isUploaded && (
                  <div className="mt-4">
                    <video controls className="w-full rounded" src={`http://localhost:5000/api/videos/stream/${webinar._id}`}>
                      Your browser does not support the video tag.
                    </video>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default WebinarSchedule;
