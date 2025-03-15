import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const Home = () => {
  const navigate = useNavigate();
  const [activeSlide, setActiveSlide] = useState(0);
  const [isVisible, setIsVisible] = useState({});
  
  // Testimonials data
  const testimonials = [
    { name: "Alex Johnson", role: "Student", text: "Found my perfect mentor through the AI matching system!" },
    { name: "Sarah Williams", role: "Alumni", text: "Hosting webinars has been a rewarding way to give back." },
    { name: "Michael Chen", role: "Student", text: "The chatbot helped me prepare for technical interviews." }
  ];
  
  // Auto-advance testimonial slides
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide(prev => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [testimonials.length]);
  
  // Animation observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setIsVisible(prev => ({ ...prev, [entry.target.id]: true }));
          }
        });
      },
      { threshold: 0.2 }
    );
    
    document.querySelectorAll('section[id]').forEach(section => {
      observer.observe(section);
    });
    
    return () => observer.disconnect();
  }, []);

  const animateClass = (sectionId) => 
    isVisible[sectionId] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10';

  return (
    <div className="bg-gray-900 text-gray-200">
      {/* Hero Section with Particle Background */}
      <section id="hero" className="relative h-screen flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1523240795612-9a054b0db644')] bg-cover bg-center opacity-10"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-900/70 to-gray-900/90"></div>
        
        {/* Animated particles */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-blue-500 rounded-full"
              initial={{ 
                x: Math.random() * 100 + "%", 
                y: Math.random() * 100 + "%", 
                opacity: Math.random() * 0.5 + 0.3 
              }}
              animate={{ 
                y: [null, Math.random() * 100 + "%"],
                opacity: [null, Math.random() > 0.5 ? 0.8 : 0.2]
              }}
              transition={{ 
                duration: Math.random() * 10 + 10, 
                repeat: Infinity, 
                repeatType: "reverse" 
              }}
            />
          ))}
        </div>
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-6xl font-extrabold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-500">
              Alumni-Student Interconnection
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto">
              Connect, Collaborate, and Grow with AI-powered mentorship
            </p>
            <motion.button 
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-semibold rounded-full hover:shadow-lg hover:shadow-blue-500/20"
              onClick={() => navigate('/Login')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Get Started
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-800">
        <div className="container mx-auto px-4">
          <motion.h2 
            className="text-3xl font-bold mb-16 text-center text-blue-300"
            initial={{ opacity: 0 }}
            animate={isVisible['features'] ? { opacity: 1 } : {}}
            transition={{ duration: 0.5 }}
          >
            Powerful Features
          </motion.h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { 
                icon: "🤖", 
                title: "AI Matching", 
                desc: "Find the perfect mentor with our intelligent matching algorithm.",
                color: "from-blue-600 to-indigo-700"
              },
              { 
                icon: "🎓", 
                title: "Live Webinars", 
                desc: "Attend or host interactive sessions with industry experts.",
                color: "from-indigo-600 to-purple-700"
              },
              { 
                icon: "💬", 
                title: "Smart Chatbot", 
                desc: "Get instant answers to your career and academic questions.",
                color: "from-purple-600 to-pink-700"
              }
            ].map((item, i) => (
              <motion.div 
                key={i} 
                className="bg-gray-900 rounded-xl overflow-hidden shadow-lg shadow-blue-900/20 hover:shadow-blue-700/20 transition-all"
                initial={{ opacity: 0, y: 30 }}
                animate={isVisible['features'] ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: i * 0.2 }}
                whileHover={{ y: -10 }}
              >
                <div className={`h-2 bg-gradient-to-r ${item.color}`}></div>
                <div className="p-6">
                  <div className="text-4xl mb-4">{item.icon}</div>
                  <h3 className="text-xl font-bold mb-3 text-white">{item.title}</h3>
                  <p className="text-gray-400">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Chatbot Demo */}
      <section id="chatbot" className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900 via-indigo-900/30 to-gray-900"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={isVisible['chatbot'] ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl font-bold mb-4 text-blue-300">AI-Powered Assistance</h2>
              <p className="text-gray-300 mb-6">
                Our intelligent chatbot provides instant answers to your questions about careers, 
                courses, and connects you with the right resources.
              </p>
              <ul className="space-y-3">
                {[
                  "Get personalized career advice",
                  "Find relevant webinars and resources",
                  "Prepare for technical interviews",
                  "Connect with alumni in your field"
                ].map((item, i) => (
                  <motion.li 
                    key={i} 
                    className="flex items-center text-gray-300"
                    initial={{ opacity: 0, x: -20 }}
                    animate={isVisible['chatbot'] ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.3, delay: 0.1 * i }}
                  >
                    <span className="text-blue-500 mr-2">✓</span> {item}
                  </motion.li>
                ))}
              </ul>
            </motion.div>
            
            <motion.div
              className="bg-gray-800 rounded-xl p-4 shadow-xl shadow-blue-900/10"
              initial={{ opacity: 0, y: 30 }}
              animate={isVisible['chatbot'] ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6 }}
            >
              <div className="border-b border-gray-700 pb-2 mb-4">
                <h3 className="text-blue-400 font-medium">AI Assistant</h3>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white mr-3 flex-shrink-0">
                    <span>🤖</span>
                  </div>
                  <div className="bg-gray-700 rounded-lg p-3 max-w-xs">
                    <p className="text-gray-200">How can I help with your career questions today?</p>
                  </div>
                </div>
                
                <div className="flex items-start justify-end">
                  <div className="bg-indigo-900 rounded-lg p-3 max-w-xs">
                    <p className="text-indigo-100">How do I prepare for technical interviews?</p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white ml-3 flex-shrink-0">
                    <span>👤</span>
                  </div>
                </div>
                
                <motion.div 
                  className="flex items-start"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                >
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white mr-3 flex-shrink-0">
                    <span>🤖</span>
                  </div>
                  <div className="bg-gray-700 rounded-lg p-3">
                    <p className="text-gray-200">I recommend practicing with these resources...</p>
                  </div>
                </motion.div>
              </div>
              
              <div className="mt-4 pt-3 border-t border-gray-700 flex">
                <input 
                  type="text" 
                  placeholder="Ask a question..." 
                  className="bg-gray-700 text-gray-200 rounded-l-lg px-4 py-2 w-full focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <button className="bg-blue-600 text-white px-4 rounded-r-lg hover:bg-blue-700">
                  <span>→</span>
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 bg-gray-800">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-12 text-center text-blue-300">What Our Users Say</h2>
          
          <div className="relative max-w-3xl mx-auto">
            <div className="overflow-hidden">
              <div className="flex transition-transform duration-500 ease-in-out" 
                style={{ transform: `translateX(-${activeSlide * 100}%)` }}>
                {testimonials.map((testimonial, i) => (
                  <div key={i} className="w-full flex-shrink-0 px-4">
                    <div className="bg-gray-900 p-6 rounded-xl shadow-lg">
                      <p className="text-gray-300 italic mb-4">"{testimonial.text}"</p>
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-600 to-indigo-700 flex items-center justify-center text-white">
                          {testimonial.name.charAt(0)}
                        </div>
                        <div className="ml-3">
                          <p className="font-medium text-white">{testimonial.name}</p>
                          <p className="text-sm text-blue-400">{testimonial.role}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex justify-center mt-6 space-x-2">
              {testimonials.map((_, i) => (
                <button 
                  key={i}
                  onClick={() => setActiveSlide(i)}
                  className={`w-3 h-3 rounded-full ${activeSlide === i ? 'bg-blue-500' : 'bg-gray-600'}`}
                  aria-label={`Go to slide ${i+1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Colleges We Cover */}
      <section id="colleges" className="py-16 bg-gradient-to-b from-gray-800 to-gray-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-blue-900/10 bg-opacity-50"></div>
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(10)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-blue-500 rounded-full"
              initial={{ 
                x: Math.random() * 100 + "%", 
                y: Math.random() * 100 + "%", 
                opacity: Math.random() * 0.3 + 0.1 
              }}
              animate={{ 
                y: [null, Math.random() * 100 + "%"],
                opacity: [null, Math.random() > 0.5 ? 0.4 : 0.1]
              }}
              transition={{ 
                duration: Math.random() * 15 + 15, 
                repeat: Infinity, 
                repeatType: "reverse" 
              }}
            />
          ))}
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <h2 className="text-3xl font-bold mb-6 text-center text-blue-300">Colleges We Cover</h2>
          <p className="text-center text-gray-400 max-w-2xl mx-auto mb-10">
            Our platform provides assistance and mentorship for students from these prestigious institutions
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[
              { name: "IIT Delhi", logo: "🏛️", location: "New Delhi" },
              { name: "NIT Trichy", logo: "🔬", location: "Tamil Nadu" },
              { name: "BITS Pilani", logo: "📊", location: "Rajasthan" },
              { name: "Delhi University", logo: "🎨", location: "New Delhi" },
              { name: "AIIMS", logo: "🏥", location: "Multiple Locations" },
              { name: "VIT Vellore", logo: "⚙️", location: "Tamil Nadu" },
              { name: "NALSAR", logo: "⚖️", location: "Hyderabad" },
              { name: "NID Ahmedabad", logo: "🎭", location: "Gujarat" }
            ].map((college, i) => (
              <motion.div
                key={i}
                className="bg-gray-900/80 backdrop-blur-sm p-4 rounded-lg text-center border border-gray-800 hover:border-blue-800 transition-colors"
                whileHover={{ y: -5 }}
                initial={{ opacity: 0, y: 20 }}
                animate={isVisible['colleges'] ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.3, delay: i * 0.05 }}
              >
                <div className="text-3xl mb-2">{college.logo}</div>
                <h3 className="text-white font-medium">{college.name}</h3>
                <p className="text-gray-400 text-sm mt-1">{college.location}</p>
              </motion.div>
            ))}
          </div>
          
          <div className="mt-10 text-center">
            <p className="text-gray-400 mb-4">Don't see your college? We're expanding our coverage regularly.</p>
            <motion.button
              className="px-6 py-2 bg-transparent border border-blue-500 text-blue-400 rounded-lg hover:bg-blue-900/20 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Request Your College
            </motion.button>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section id="cta" className="py-20 bg-gradient-to-r from-indigo-900 to-blue-900">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isVisible['cta'] ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Ready to Connect?</h2>
            <p className="text-blue-200 mb-8 max-w-2xl mx-auto">
              Join our community of students and alumni to accelerate your career growth
            </p>
            <motion.button 
              className="px-8 py-3 bg-white text-indigo-900 font-semibold rounded-full hover:bg-blue-100"
              onClick={() => navigate('/Login')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
                            Get Started Now
            </motion.button>
          </motion.div>
        </div>
      </section>

      

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold text-white mb-4">Alumni-Student Platform</h3>
              <p className="mb-4">Connecting generations of talent through mentorship and knowledge sharing.</p>
              <div className="flex space-x-4">
                {['facebook', 'twitter', 'linkedin', 'instagram'].map((social) => (
                  <a key={social} href="#" className="text-gray-400 hover:text-blue-400 transition-colors">
                    <span className="sr-only">{social}</span>
                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                    </svg>
                  </a>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Quick Links</h3>
              <ul className="space-y-2">
                {['Home', 'About Us', 'Features', 'Testimonials', 'Contact'].map((link) => (
                  <li key={link}>
                    <a href="#" className="hover:text-blue-400 transition-colors">{link}</a>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Resources</h3>
              <ul className="space-y-2">
                {['Blog', 'Webinars', 'Documentation', 'Support', 'Privacy Policy'].map((link) => (
                  <li key={link}>
                    <a href="#" className="hover:text-blue-400 transition-colors">{link}</a>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Subscribe</h3>
              <p className="mb-4">Stay updated with our latest features and announcements</p>
              <div className="flex">
                <input 
                  type="email" 
                  placeholder="Your email" 
                  className="bg-gray-800 text-gray-200 px-4 py-2 rounded-l-lg focus:outline-none focus:ring-1 focus:ring-blue-500 w-full"
                />
                <button className="bg-blue-600 text-white px-4 py-2 rounded-r-lg hover:bg-blue-700">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 text-center">
            <p>&copy; {new Date().getFullYear()} Alumni-Student Platform. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;