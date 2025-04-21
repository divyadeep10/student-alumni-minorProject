import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';

const CollegeChatbot = () => {
  const [messages, setMessages] = useState([
    { 
      id: 1, 
      text: "Hello! I'm your Manipal University Jaipur Assistant. Ask me anything about courses, fees, admissions, placements, or scholarships.", 
      isUser: false 
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  
  // Updated sample questions for Manipal University Jaipur
  const sampleQuestions = [
    "What courses are offered at Manipal University Jaipur?",
    "What is the fee structure for B.Tech at Manipal Jaipur?",
    "Tell me about the placement statistics at Manipal University Jaipur.",
    "How can I apply for admission to Manipal Jaipur?",
    "Are there any scholarships available at Manipal University?"
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
      const response = await axios.post('http://localhost:5000/api/chat', {
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
      await axios.post('http://localhost:5000/api/reset');
      setMessages([
        { 
          id: 1, 
          text: "Hello! I'm your Manipal University Jaipur Assistant. Ask me anything about courses, fees, admissions, placements, or scholarships.", 
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
    <div className="flex flex-col h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white p-4 shadow-lg">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mr-3 text-yellow-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <h1 className="text-xl font-bold">Manipal Jaipur Assistant</h1>
          </div>
          <button 
            onClick={handleResetChat}
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-md transition duration-300 flex items-center shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
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
          <div className="flex-1 overflow-y-auto p-4 md:p-6">
            <div className="max-w-4xl mx-auto space-y-6">
              {messages.map(message => (
                <div 
                  key={message.id} 
                  className={`flex ${message.isUser ? 'justify-end' : 'justify-start'} animate-fadeIn`}
                >
                  {!message.isUser && (
                    <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white mr-2 flex-shrink-0 shadow-md">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    </div>
                  )}
                  
                  <div 
                    className={`rounded-2xl p-4 max-w-[85%] shadow-md ${
                      message.isUser 
                        ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white self-end rounded-br-none' 
                        : message.isError
                          ? 'bg-red-100 border border-red-300 text-gray-800 self-start rounded-bl-none'
                          : 'bg-white text-gray-800 self-start rounded-bl-none'
                    }`}
                  >
                    <ReactMarkdown>{message.text}</ReactMarkdown>
                    
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
                  
                  {message.isUser && (
                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white ml-2 flex-shrink-0 shadow-md">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  )}
                </div>
              ))}
              
              {/* Loading indicator */}
              {isLoading && (
                <div className="flex justify-start animate-fadeIn">
                  <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white mr-2 flex-shrink-0 shadow-md">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <div className="rounded-2xl p-4 bg-white text-gray-800 self-start rounded-bl-none shadow-md">
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </div>
          
          {/* Input area */}
          <div className="p-4 border-t border-gray-200 bg-white shadow-lg">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center bg-gray-50 rounded-full shadow-inner border border-gray-200 pr-2">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage(inputMessage)}
                  placeholder="Ask about Manipal University Jaipur..."
                  className="flex-1 p-3 bg-transparent rounded-l-full focus:outline-none"
                  disabled={isLoading}
                />
                <button
                  onClick={() => handleSendMessage(inputMessage)}
                  disabled={isLoading || !inputMessage.trim()}
                  className={`p-2 rounded-full ${
                    isLoading || !inputMessage.trim() 
                      ? 'bg-gray-300 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800'
                  } text-white transition duration-300 shadow-md`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Sidebar with sample questions */}
        <div className="hidden md:block w-80 bg-white p-4 overflow-y-auto border-l border-gray-200 shadow-inner">
          <h2 className="text-lg font-semibold text-indigo-800 mb-4">Popular Questions</h2>
          <ul className="space-y-2">
            {sampleQuestions.map((question, index) => (
              <li key={index}>
                <button
                  onClick={() => handleSendMessage(question)}
                  disabled={isLoading}
                  className="w-full text-left p-3 bg-gray-50 hover:bg-indigo-50 rounded-lg transition duration-300 text-gray-700 border border-gray-200 hover:border-indigo-200 shadow-sm hover:shadow"
                >
                  {question}
                </button>
              </li>
            ))}
          </ul>
          
          <div className="mt-8 p-4 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-lg border border-indigo-100 shadow-sm">
            <h3 className="font-medium text-indigo-800 mb-2">About This Chatbot</h3>
            <p className="text-sm text-indigo-700">
              This AI assistant provides information about courses, fees, admissions, placements, and scholarships at Manipal University Jaipur. 
              Ask any questions you have about the university!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CollegeChatbot;