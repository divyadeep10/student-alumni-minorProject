import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState('student');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    collegeId: '',
    password: '',
    interests: '',
    careerGoals: '',
    careerInsights: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const endpoint = `http://localhost:5000/api/auth/register/${role}`;
      const payload = {
        name: formData.name,
        email: formData.email,
        collegeId: formData.collegeId,
        password: formData.password,
        ...(role === 'student' ? {
          interests: formData.interests.split(',').map(item => item.trim()),
          careerGoals: formData.careerGoals
        } : {
          careerInsights: formData.careerInsights
        })
      };
      
      await axios.post(endpoint, payload);
      navigate('/login');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const inputFields = [
    { name: 'name', label: 'Full Name', type: 'text', required: true },
    { name: 'email', label: 'Email Address', type: 'email', required: true },
    { name: 'collegeId', label: 'College ID', type: 'text', required: true },
    { name: 'password', label: 'Password', type: 'password', required: true },
    { name: 'interests', label: 'Interests (comma separated)', type: 'text', showFor: 'student' },
    { name: 'careerGoals', label: 'Career Goals', type: 'text', showFor: 'student' },
    { name: 'careerInsights', label: 'Career Insights', type: 'text', showFor: 'alumni' }
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-2xl">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Create your account</h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Join as a {role === 'student' ? 'Student' : 'Alumni'} to connect with our community
          </p>
        </div>
        
        <div className="flex justify-center space-x-4 mb-6">
          {['student', 'alumni'].map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRole(r)}
              className={`px-6 py-2 rounded-full transition-all duration-200 ${
                role === r 
                  ? 'bg-indigo-600 text-white shadow-md' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {r.charAt(0).toUpperCase() + r.slice(1)}
            </button>
          ))}
        </div>
        
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="rounded-md space-y-4">
            {inputFields
              .filter(field => !field.showFor || field.showFor === role)
              .map((field) => (
                <div key={field.name}>
                  <label htmlFor={field.name} className="block text-sm font-medium text-gray-700 mb-1">
                    {field.label}
                  </label>
                  <input
                    id={field.name}
                    name={field.name}
                    type={field.type}
                    required={field.required}
                    value={formData[field.name]}
                    onChange={handleChange}
                    className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  />
                </div>
              ))}
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white ${
                isLoading ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700'
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200`}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating Account...
                </>
              ) : 'Sign up'}
            </button>
          </div>
        </form>
        
        <div className="text-center mt-4">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
