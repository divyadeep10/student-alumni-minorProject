import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate, Link } from 'react-router-dom';

const WebinarVideoUpload = () => {
  const { webinarId } = useParams();
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [webinar, setWebinar] = useState(null);
  const [uploadMethod, setUploadMethod] = useState('server'); // 'server' or 'youtube'
  const [privacyStatus, setPrivacyStatus] = useState('private');

  useEffect(() => {
    const fetchWebinar = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }
        
        const response = await axios.get(`http://localhost:5000/api/alumni/webinar/${webinarId}`, {
          headers: { Authorization: token }
        });
        setWebinar(response.data);
      } catch (err) {
        console.error('Error fetching webinar details:', err);
        if (err.response && err.response.status === 404) {
          setError('Webinar not found. It may have been deleted or you do not have access to it.');
        } else if (err.response && err.response.status === 403) {
          setError('You are not authorized to access this webinar.');
        } else {
          setError('Could not load webinar details. Please try again later.');
        }
      }
    };

    if (webinarId) {
      fetchWebinar();
    }
  }, [webinarId, navigate]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    
    // Validate file type
    if (selectedFile && !selectedFile.type.startsWith('video/')) {
      setError('Please select a valid video file');
      return;
    }
    
    // Validate file size (100MB max)
    if (selectedFile && selectedFile.size > 100 * 1024 * 1024) {
      setError('File size exceeds 100MB limit');
      return;
    }
    
    setFile(selectedFile);
    setError('');
  };

  // Add this to your state variables
  const [youtubeConnected, setYoutubeConnected] = useState(false);
  const [uploadToYoutube, setUploadToYoutube] = useState(true);
  
  // Add this to your useEffect
  useEffect(() => {
    const checkYoutubeConnection = async () => {
      try {
        const token = localStorage.getItem('token');
        const { data } = await axios.get('http://localhost:5000/api/videos/youtube-status', {
          headers: { Authorization: token }
        });
        setYoutubeConnected(data.connected);
      } catch (error) {
        console.error("Error checking YouTube connection:", error);
        setYoutubeConnected(false);
      }
    };
    
    checkYoutubeConnection();
  }, []);

  // Update your handleUpload function
  // In your handleUpload function, update the formData creation:
  
  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file to upload');
      return;
    }
    
    setIsUploading(true);
    setProgress(0);
    setError('');
    
    const formData = new FormData();
    formData.append('video', file);
    
    // Add YouTube upload preference if checked
    if (uploadToYoutube) {
      formData.append('uploadToYoutube', 'true');
      // Default to private videos on YouTube
      formData.append('privacyStatus', 'private');
    }
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`http://localhost:5000/api/videos/upload/${webinarId}`, formData, {
        headers: {
          Authorization: token,
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setProgress(percentCompleted);
        }
      });
      
      setSuccess('Video uploaded successfully!');
      setFile(null);
      
      // Refresh the page after successful upload
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (err) {
      console.error('Error uploading video:', err);
      setError(err.response?.data?.message || 'Failed to upload video. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  // Add this to your form, after the YouTube checkbox
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {youtubeConnected && (
        <div className="mb-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={uploadToYoutube}
              onChange={() => setUploadToYoutube(!uploadToYoutube)}
              className="form-checkbox h-5 w-5 text-blue-600"
            />
            <span className="text-gray-700">Also upload to my YouTube channel</span>
          </label>
          
          {uploadToYoutube && (
            <div className="ml-7 mt-2">
              <label className="block text-gray-700 mb-1">Privacy Setting:</label>
              <select
                value={privacyStatus}
                onChange={(e) => setPrivacyStatus(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
              >
                <option value="private">Private (only you can view)</option>
                <option value="unlisted">Unlisted (anyone with link can view)</option>
                <option value="public">Public (anyone can find and view)</option>
              </select>
            </div>
          )}
        </div>
      )}
      
      <form onSubmit={handleUpload} className="bg-white rounded-lg shadow p-6">
        <div className="mb-6">
          <label className="block text-blue-200 mb-2">Upload Method</label>
          <div className="flex space-x-4">
            <button
              type="button"
              className={`px-4 py-2 rounded-lg ${uploadMethod === 'server' ? 'bg-indigo-600 text-white' : 'bg-white/10 text-blue-200'}`}
              onClick={() => setUploadMethod('server')}
            >
              Upload to YouTube
            </button>
            <button
              type="button"
              className={`px-4 py-2 rounded-lg ${uploadMethod === 'youtube' ? 'bg-indigo-600 text-white' : 'bg-white/10 text-blue-200'}`}
              onClick={() => setUploadMethod('youtube')}
              disabled
            >
              Direct YouTube Link (Coming Soon)
            </button>
          </div>
        </div>
        
        <div className="mb-6">
          <label className="block text-blue-200 mb-2">Select Video File</label>
          <input
            type="file"
            accept="video/*"
            onChange={handleFileChange}
            className="w-full bg-white/10 text-white rounded-lg p-2 border border-blue-400/30 focus:outline-none focus:border-blue-400"
          />
          <p className="text-xs text-blue-300 mt-1">Maximum file size: 100MB. Supported formats: MP4, MOV, AVI</p>
        </div>
        
        {isUploading ? (
          <div className="mb-6">
            <label className="block text-blue-200 mb-2">Upload Progress</label>
            <div className="w-full bg-white/10 rounded-full h-4 mb-2">
              <div 
                className="bg-green-500 h-4 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p className="text-center text-blue-200">{progress}% Complete</p>
          </div>
        ) : (
          <button
            type="submit"
            disabled={!file}
            className={`w-full py-3 rounded-lg font-semibold ${!file ? 'bg-indigo-600/50 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'} transition-colors`}
          >
            Upload Video
          </button>
        )}
      </form>
    </div>
  );
};

export default WebinarVideoUpload;