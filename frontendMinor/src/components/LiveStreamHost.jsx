import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import Peer from 'simple-peer';

const LiveStreamHost = () => {
  const { webinarId } = useParams();
  const navigate = useNavigate();
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState('');
  const [viewers, setViewers] = useState([]);
  const [streamLink, setStreamLink] = useState('');
  const [linkCopied, setLinkCopied] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const socketRef = useRef(null);
  const peersRef = useRef({});

  const token = localStorage.getItem('token');

  useEffect(() => {
    return () => {
      stopStream();
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, []);

  useEffect(() => {
    // Generate stream link when webinarId is available
    if (webinarId) {
      const viewerLink = `${window.location.origin}/stream/view/${webinarId}`;
      setStreamLink(viewerLink);
    }
  }, [webinarId]);

  const copyLinkToClipboard = () => {
    navigator.clipboard.writeText(streamLink)
      .then(() => {
        setLinkCopied(true);
        setTimeout(() => setLinkCopied(false), 3000);
      })
      .catch(err => {
        console.error('Failed to copy link: ', err);
      });
  };

  const startStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;

      socketRef.current = io('http://localhost:5000');
      socketRef.current.on('connect', () => {
        socketRef.current.emit('start-stream', { webinarId, token });
        setIsStreaming(true);
      });

      socketRef.current.on('new-viewer', ({ socketId }) => {
        console.log('Host received new-viewer event for:', socketId);
        // Add the viewer to the state
        setViewers(prev => [...prev, socketId]);
        
        // Make sure streamRef.current is set!
        if (!streamRef.current) {
          console.error('Stream reference is not set when new viewer joined');
          return;
        }
        
        console.log('Creating peer for viewer:', socketId);
        try {
          // Create peer with wrtc option to avoid Node.js stream dependency issues
          const peer = new Peer({
            initiator: true,
            trickle: false,
            stream: streamRef.current,
            config: { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] },
            objectMode: true // Add this to avoid stream issues
          });
          
          peersRef.current[socketId] = peer;
          
          peer.on('signal', signal => {
            console.log('Host generated signal for viewer:', socketId);
            socketRef.current.emit('signal', { to: socketId, signal });
          });
          
        peer.on('connect', () => {
          console.log('Peer connection established with viewer:', socketId);
        });
        
        peer.on('error', err => {
          console.error('Peer error with viewer', socketId, ':', err.message);
          setError('Peer error: ' + err.message);
        });
        } catch (err) {
          console.error('Error creating peer for viewer:', err);
          setError('Failed to connect with viewer: ' + err.message);
        }
      });

      socketRef.current.on('signal', ({ from, signal }) => {
        console.log('Host received signal from viewer:', from);
        if (peersRef.current[from]) {
          peersRef.current[from].signal(signal);
        } else {
          console.error('No peer found for viewer:', from);
        }
      });

      socketRef.current.on('viewer-left', ({ socketId }) => {
        if (peersRef.current[socketId]) {
          peersRef.current[socketId].destroy();
          delete peersRef.current[socketId];
        }
        setViewers(vs => vs.filter(id => id !== socketId));
      });

      socketRef.current.on('error', err => setError(err.message));
    } catch (err) {
      setError('Could not access camera/mic: ' + err.message);
    }
  };

  const stopStream = () => {
    if (socketRef.current) socketRef.current.emit('end-stream', { webinarId, token });
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    Object.values(peersRef.current).forEach(peer => peer.destroy());
    peersRef.current = {};
    setIsStreaming(false);
    setViewers([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 to-indigo-900 pt-20 pb-10 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 mb-6">
          <h1 className="text-2xl font-bold text-white mb-4">Live Stream Host</h1>
          
          {error && (
            <div className="bg-red-500 text-white p-4 rounded-lg mb-4">
              {error}
            </div>
          )}
          
          <div className="aspect-video bg-black rounded-lg overflow-hidden mb-4">
            <video 
              ref={videoRef} 
              autoPlay 
              muted 
              playsInline 
              className="w-full h-full object-cover"
            />
          </div>
          
          {!isStreaming ? (
            <button 
              onClick={startStream}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition-colors mb-4"
            >
              Start Streaming
            </button>
          ) : (
            <button 
              onClick={stopStream}
              className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg transition-colors mb-4"
            >
              Stop Streaming
            </button>
          )}
          
          {isStreaming && streamLink && (
            <div className="mt-4 p-4 bg-indigo-800/50 rounded-lg">
              <p className="text-white mb-2">Share this link with students:</p>
              <div className="flex">
                <input 
                  type="text" 
                  value={streamLink} 
                  readOnly 
                  className="flex-grow p-2 rounded-l-lg text-sm bg-white/20 text-white"
                />
                <button 
                  onClick={copyLinkToClipboard}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-r-lg transition-colors"
                >
                  {linkCopied ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <p className="text-blue-200 text-sm mt-2">
                Viewers: {viewers.length}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LiveStreamHost;