import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';

const CollegeChatbot = () => {
  const [messages, setMessages] = useState([
    { 
      id: 1, 
      text: "Hello! I'm your College Info Assistant. Ask me anything about courses, fees, admissions, placements, or scholarships.", 
      isUser: false 
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  
  // Sample questions for the sidebar
  const sampleQuestions = [
    "What courses are offered at Maharishi Arvind University?",
    "What is the fee structure for B.Tech?",
    "Tell me about the placement opportunities.",
    "How can I apply for admission?",
    "Are there any scholarships available?"
  ];

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle sending a message
  const handleSendMessage = async (message) => {
    if (!message.trim()) return;

    // Add user message to chat
    const newUserMessage = { id: Date.now(), text: message, isUser: true };
    setMessages(prev => [...prev, newUserMessage]);
    setInputMessage('');
    
    // Set loading state
    setIsLoading(true);

    try {
      // Send message to backend
      const response = await axios.post('https://alumni-student-minor-project-backend.vercel.app/api/chat', {
        message: message
      });

      // Add bot response to chat
      const botMessage = { 
        id: Date.now() + 1, 
        text: response.data.message, 
        isUser: false,
        sources: response.data.sources 
      };
      
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Add error message
      const errorMessage = { 
        id: Date.now() + 1, 
        text: "Sorry, I encountered an error. Please try again.", 
        isUser: false,
        isError: true
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle reset chat
  const handleResetChat = async () => {
    try {
      await axios.post('https://alumni-student-minor-project-backend.vercel.app/api/reset');
      setMessages([
        { 
          id: 1, 
          text: "Hello! I'm your College Info Assistant. Ask me anything about courses, fees, admissions, placements, or scholarships.", 
          isUser: false 
        }
      ]);
    } catch (error) {
      console.error('Error resetting chat:', error);
    }
  };

  // Format message text with line breaks
  const formatMessageText = (text) => {
    return text.split('\n').map((line, i) => (
      <p key={i} className={i > 0 ? "mt-2" : ""}>{line}</p>
    ));
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-blue-700 text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <h1 className="text-xl font-bold">College Info Chatbot</h1>
          </div>
          <button 
            onClick={handleResetChat}
            className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-md transition duration-300 flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Reset Chat
          </button>
        </div>
      </header>
      
      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Chat area */}
        <div className="flex-1 flex flex-col">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4">
            {messages.map(message => (
              <div 
                key={message.id} 
                className={`flex ${message.isUser ? 'justify-end' : 'justify-start'} mb-4`}
              >
                <div 
                  className={`rounded-lg p-3 max-w-[80%] ${
                    message.isUser 
                      ? 'bg-blue-600 text-white self-end rounded-br-none' 
                      : message.isError
                        ? 'bg-red-100 border border-red-300 text-gray-800 self-start rounded-bl-none'
                        : 'bg-white text-gray-800 self-start rounded-bl-none shadow'
                  }`}
                >
                  {formatMessageText(message.text)}
                  
                  {message.sources && message.sources.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-gray-200 text-xs text-gray-500">
                      <p className="font-semibold">Sources:</p>
                      <ul className="list-disc pl-4 mt-1">
                        {message.sources.slice(0, 2).map((source, index) => (
                          <li key={index} className="truncate">{source.substring(0, 100)}...</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {/* Loading indicator */}
            {isLoading && (
              <div className="flex justify-start mb-4">
                <div className="rounded-lg p-3 bg-white text-gray-800 self-start rounded-bl-none shadow">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
          
          {/* Input area */}
          <div className="p-4 border-t border-gray-200 bg-white">
            <div className="flex">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage(inputMessage)}
                placeholder="Type your question here..."
                className="flex-1 p-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isLoading}
              />
              <button
                onClick={() => handleSendMessage(inputMessage)}
                disabled={isLoading || !inputMessage.trim()}
                className={`p-2 rounded-r-md ${
                  isLoading || !inputMessage.trim() 
                    ? 'bg-gray-300 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-500'
                } text-white transition duration-300`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </div>
        </div>
        
        {/* Sidebar with sample questions */}
        <div className="hidden md:block w-80 bg-white p-4 overflow-y-auto border-l border-gray-200">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Sample Questions</h2>
          <ul className="space-y-2">
            {sampleQuestions.map((question, index) => (
              <li key={index}>
                <button
                  onClick={() => handleSendMessage(question)}
                  disabled={isLoading}
                  className="w-full text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-md transition duration-300 text-gray-700"
                >
                  {question}
                </button>
              </li>
            ))}
          </ul>
          
          <div className="mt-8 p-4 bg-blue-50 rounded-md border border-blue-100">
            <h3 className="font-medium text-blue-800 mb-2">About This Chatbot</h3>
            <p className="text-sm text-blue-700">
              This AI assistant provides information about college courses, fees, admissions, placements, and scholarships. 
              The information is based on data from Maharishi Arvind University, Jaipur.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CollegeChatbot;