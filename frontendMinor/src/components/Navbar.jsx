import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

const Navbar = ({ role, setRole }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/");
    window.location.href = window.location.href;
  };

  const isActive = (path) => location.pathname === path;

  const navLinks = {
    student: [
      { to: "/dashboard", label: "Dashboard" },
      { to: "/find-mentor", label: "Find Mentor" },
      { to: "/webinars", label: "Webinars" },
      { to: "/chatbot", label: "AI Chatbot" },
      { to: "/chatroom", label: "Common Room" }

    ],
    alumni: [
      { to: "/dashboard", label: "Dashboard" },
      { to: "/requests", label: "Mentorship Requests" },
      { to: "/chatroom", label: "Common Room" },
      { to: "/webinars", label: "Schedule Webinar" }
    ],
    guest: [
      { to: "/login", label: "Login" },
      { to: "/register", label: "Register" }
    ]
  };

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'bg-indigo-800 shadow-lg' : 'bg-gradient-to-r from-blue-700 to-indigo-600'}`}>
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-3">
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-white text-xl font-bold">Alumni-Student Platform</span>
          </Link>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-white focus:outline-none"
            >
              {isMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
                </svg>
              )}
            </button>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {navLinks[role || 'guest'].map((link, index) => (
              <Link 
                key={index}
                to={link.to}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                  isActive(link.to) 
                    ? 'bg-white text-indigo-700' 
                    : 'text-white hover:bg-indigo-500 hover:bg-opacity-25'
                }`}
              >
                {link.label}
              </Link>
            ))}
            
            {role && (
              <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors duration-200 text-sm font-medium"
              >
                Logout
              </button>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className={`md:hidden transition-all duration-300 overflow-hidden ${isMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="px-2 pt-2 pb-3 space-y-1 bg-indigo-700 rounded-md mt-1">
            {navLinks[role || 'guest'].map((link, index) => (
              <Link
                key={index}
                to={link.to}
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  isActive(link.to)
                    ? 'bg-indigo-900 text-white'
                    : 'text-indigo-100 hover:bg-indigo-600'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            
            {role && (
              <button
                onClick={handleLogout}
                className="w-full text-left block px-3 py-2 rounded-md text-base font-medium bg-red-500 text-white hover:bg-red-600"
              >
                Logout
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
