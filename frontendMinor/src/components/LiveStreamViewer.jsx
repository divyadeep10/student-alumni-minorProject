import React, { useState, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import io from 'socket.io-client';
import Peer from 'simple-peer';

const LiveStreamViewer = () => {
  const { roomId } = useParams();
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState('');
  const videoRef = useRef(null);
  const socketRef = useRef(null);
  const peerRef = useRef(null);

  useEffect(() => {
    if (!roomId) {
      setError('No room ID provided');
      return;
    }

    socketRef.current = io('http://localhost:5000');
    
    socketRef.current.on('connect', () => {
      console.log('Connected to server');
      socketRef.current.emit('join-stream', { roomId });
    });

    socketRef.current.on('stream-signal', async ({ signal }) => {
      try {
        if (!peerRef.current) {
          peerRef.current = new Peer({
            initiator: false,
            trickle: false,
            config: { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] }
          });

          peerRef.current.on('signal', signal => {
            socketRef.current.emit('return-signal', { signal, roomId });
          });

          peerRef.current.on('stream', stream => {
            if (videoRef.current) {
              videoRef.current.srcObject = stream;
              setIsConnected(true);
            }
          });
        }
        peerRef.current.signal(signal);
      } catch (err) {
        console.error('Error handling stream signal:', err);
        setError('Failed to connect to stream');
      }
    });

    socketRef.current.on('stream-ended', () => {
      setIsConnected(false);
      setError('Stream has ended');
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
      if (peerRef.current) {
        peerRef.current.destroy();
      }
    };
  }, [roomId]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 to-indigo-900 pt-20 pb-10 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
          <h1 className="text-2xl font-bold text-white mb-4">Live Stream Viewer</h1>
          
          {error && (
            <div className="bg-red-500 text-white p-4 rounded-lg mb-4">
              {error}
            </div>
          )}

          <div className="aspect-video bg-black rounded-lg overflow-hidden mb-4">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
          </div>

          <div className="text-white text-center">
            {!isConnected ? 'Connecting to stream...' : 'Connected to stream'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveStreamViewer;