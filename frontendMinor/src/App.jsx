// src/App.js
import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import FindMentor from './components/FindMentor';
import Requests from './components/Requests';
import WebinarSchedule from './components/WebinarSchedule';
import ChatRoom from './components/ChatRoom';
import Home from './components/Home';
import WebinarFeed from './components/WebinarSchedulerFeed';
import ChatBot from './components/ChatBotAI';
import MatchingPreferences from './components/MatchingPreferences';
import MentorRecommendations from './components/MentorRecommendations';
import AlumniMatchingProfile from './components/AlumniMatchingProfile';
import MyMentors from './components/MyMentors';
import MyMentees from './components/MyMentees';

function App() {
  // Check if user is authenticated and store role (student/alumni)
  const [auth, setAuth] = useState(localStorage.getItem('token') ? true : false);
  const [role, setRole] = useState(localStorage.getItem('role') || '');

  // Simple logout function
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    setAuth(false);
    setRole('');
  };

  return (
    <Router>
      <Navbar role={role} logout={logout} />
      <Routes>
        {/* <Route path="/" element={<Login setAuth={setAuth} setRole={setRole} />} /> */}
        <Route path="/login" element={<Login setAuth={setAuth} setRole={setRole} />} />
        <Route path="/register" element={<Register />} />
        {/* <Route path="/" element={<Home />} /> */}
        
        <Route path="/dashboard" element={<Dashboard auth={auth} role={role} />} />
        <Route path="/find-mentor" element={<FindMentor auth={auth} role={role} />} />
        <Route path="/requests" element={<Requests auth={auth} role={role} />} />
        <Route path="/webinars" element={<WebinarSchedule auth={auth} role={role} />} />
        <Route path="/chatroom" element={<ChatRoom auth={auth} role={role} />} />
        <Route path="/webinarsFeed" element={<WebinarFeed auth={auth} role={role} />} />
        <Route path="/chatbot" element={<ChatBot auth={auth} role={role} />} />
        <Route path="/matching-preferences" element={<MatchingPreferences auth={auth} role={role} />} />
        <Route path="/mentor-recommendations" element={<MentorRecommendations auth={auth} role={role} />} /> 
        <Route path="/alumni-matching-profile" element={<AlumniMatchingProfile auth={auth} role={role} />} /> 
        <Route path="/my-mentors" element={<MyMentors auth={auth} role={role} />} /> 
        <Route path="/my-mentees" element={<MyMentees auth={auth} role={role} />} />
        <Route path="/" element={<Home />} />

      </Routes>
    </Router>
  );
}

export default App;
