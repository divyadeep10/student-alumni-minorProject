import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';

const MatchingPreferences = () => {
  const token = localStorage.getItem('token');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [preferences, setPreferences] = useState({
    interests: [],
    detailedInterests: {}, // Interest areas with strength (1-10)
    careerGoals: '',
    preferredIndustries: [],
    communicationFrequency: 'weekly',
    mentorshipDuration: '3 months',
    skillsToLearn: [],
    learningStyle: 'visual', // From schema enum
    availability: [], // From schema
    communicationPreference: 'video', // From schema enum
    matchingPreferences: {
      expertiseImportance: 5, // 1-10
      availabilityImportance: 3, // 1-10
      communicationImportance: 2 // 1-10
    }
  });

  // Predefined options
  const interestOptions = ['AI/ML', 'Web Development', 'Mobile Apps', 'Data Science', 'Cybersecurity', 'Cloud Computing', 'UI/UX Design'];
  const industryOptions = ['Technology', 'Finance', 'Healthcare', 'Education', 'E-commerce', 'Manufacturing', 'Consulting'];
  const skillOptions = ['Programming', 'Leadership', 'Communication', 'Problem Solving', 'Project Management', 'Data Analysis', 'Design Thinking'];
  const frequencyOptions = ['weekly', 'biweekly', 'monthly', 'as needed'];
  const durationOptions = ['1 month', '3 months', '6 months', '1 year', 'ongoing'];
  const learningStyleOptions = ['visual', 'auditory', 'reading', 'kinesthetic', 'mixed'];
  const communicationOptions = ['email', 'video', 'chat', 'in-person'];
  const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  // State for availability scheduling
  const [selectedDay, setSelectedDay] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  
  // State for interest strength
  const [selectedInterest, setSelectedInterest] = useState('');
  const [interestStrength, setInterestStrength] = useState(5);

  useEffect(() => {
    const fetchPreferences = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get('http://localhost:5000/api/matching/preferences', {
          headers: { Authorization: token }
        });
        if (response.data) {
          setPreferences(response.data);
        }
      } catch (err) {
        console.error('Error fetching preferences:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPreferences();
  }, [token]);

  const handleInterestChange = (interest) => {
    if (preferences.interests.includes(interest)) {
      setPreferences({
        ...preferences,
        interests: preferences.interests.filter(i => i !== interest)
      });
    } else {
      setPreferences({
        ...preferences,
        interests: [...preferences.interests, interest]
      });
    }
  };

  const handleAddInterestStrength = () => {
    if (selectedInterest && interestStrength >= 1 && interestStrength <= 10) {
      setPreferences({
        ...preferences,
        detailedInterests: {
          ...preferences.detailedInterests,
          [selectedInterest]: interestStrength
        }
      });
      setSelectedInterest('');
      setInterestStrength(5);
    }
  };

  const handleRemoveInterestStrength = (interest) => {
    const updatedDetailedInterests = { ...preferences.detailedInterests };
    delete updatedDetailedInterests[interest];
    setPreferences({
      ...preferences,
      detailedInterests: updatedDetailedInterests
    });
  };

  const handleIndustryChange = (industry) => {
    if (preferences.preferredIndustries.includes(industry)) {
      setPreferences({
        ...preferences,
        preferredIndustries: preferences.preferredIndustries.filter(i => i !== industry)
      });
    } else {
      setPreferences({
        ...preferences,
        preferredIndustries: [...preferences.preferredIndustries, industry]
      });
    }
  };

  const handleSkillChange = (skill) => {
    if (preferences.skillsToLearn.includes(skill)) {
      setPreferences({
        ...preferences,
        skillsToLearn: preferences.skillsToLearn.filter(s => s !== skill)
      });
    } else {
      setPreferences({
        ...preferences,
        skillsToLearn: [...preferences.skillsToLearn, skill]
      });
    }
  };

  const handleAddAvailability = () => {
    if (selectedDay && startTime && endTime) {
      setPreferences({
        ...preferences,
        availability: [
          ...preferences.availability,
          { day: selectedDay, startTime, endTime }
        ]
      });
      setSelectedDay('');
      setStartTime('');
      setEndTime('');
    }
  };

  const handleRemoveAvailability = (index) => {
    setPreferences({
      ...preferences,
      availability: preferences.availability.filter((_, i) => i !== index)
    });
  };

  const handleImportanceChange = (type, value) => {
    setPreferences({
      ...preferences,
      matchingPreferences: {
        ...preferences.matchingPreferences,
        [type]: parseInt(value)
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      await axios.put('http://localhost:5000/api/matching/preferences', preferences, {
        headers: { Authorization: token }
      });
      setSuccess('Matching preferences updated successfully!');
    } catch (err) {
      setError('Failed to update preferences. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gray-900 min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-gray-800 rounded-xl shadow-xl overflow-hidden"
        >
          <div className="p-6 border-b border-gray-700">
            <h1 className="text-2xl font-bold text-blue-400">Matching Preferences</h1>
            <p className="text-gray-400 mt-2">Customize your preferences to find the perfect mentor match</p>
          </div>

          {error && (
            <div className="bg-red-900/30 border-l-4 border-red-500 p-4 m-6">
              <p className="text-red-400">{error}</p>
            </div>
          )}

          {success && (
            <div className="bg-green-900/30 border-l-4 border-green-500 p-4 m-6">
              <p className="text-green-400">{success}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Interests */}
            <div>
              <label className="block text-blue-300 mb-2 font-medium">Areas of Interest</label>
              <div className="flex flex-wrap gap-2">
                {interestOptions.map((interest) => (
                  <button
                    key={interest}
                    type="button"
                    onClick={() => handleInterestChange(interest)}
                    className={`px-4 py-2 rounded-full text-sm ${
                      preferences.interests.includes(interest)
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {interest}
                  </button>
                ))}
              </div>
            </div>

            {/* Detailed Interests with Strength */}
            <div>
              <label className="block text-blue-300 mb-2 font-medium">Interest Strength (1-10)</label>
              <div className="flex gap-2 mb-3">
                <select
                  value={selectedInterest}
                  onChange={(e) => setSelectedInterest(e.target.value)}
                  className="flex-grow bg-gray-700 text-gray-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select an interest</option>
                  {interestOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={interestStrength}
                  onChange={(e) => setInterestStrength(parseInt(e.target.value))}
                  className="w-20 bg-gray-700 text-gray-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={handleAddInterestStrength}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  Add
                </button>
              </div>
              
              {/* Display interest strengths */}
              <div className="space-y-2 mt-3">
                {Object.entries(preferences.detailedInterests || {}).map(([interest, strength]) => (
                  <div key={interest} className="flex items-center justify-between bg-gray-700 p-2 rounded-lg">
                    <span className="text-white">{interest}</span>
                    <div className="flex items-center">
                      <span className="text-blue-300 mr-3">Strength: {strength}/10</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveInterestStrength(interest)}
                        className="text-red-400 hover:text-red-300"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Career Goals */}
            <div>
              <label htmlFor="careerGoals" className="block text-blue-300 mb-2 font-medium">
                Career Goals
              </label>
              <textarea
                id="careerGoals"
                value={preferences.careerGoals}
                onChange={(e) => setPreferences({ ...preferences, careerGoals: e.target.value })}
                className="w-full bg-gray-700 text-gray-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="3"
                placeholder="Describe your career goals and aspirations..."
              ></textarea>
            </div>

            {/* Preferred Industries */}
            <div>
              <label className="block text-blue-300 mb-2 font-medium">Preferred Industries</label>
              <div className="flex flex-wrap gap-2">
                {industryOptions.map((industry) => (
                  <button
                    key={industry}
                    type="button"
                    onClick={() => handleIndustryChange(industry)}
                    className={`px-4 py-2 rounded-full text-sm ${
                      preferences.preferredIndustries.includes(industry)
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {industry}
                  </button>
                ))}
              </div>
            </div>

            {/* Skills to Learn */}
            <div>
              <label className="block text-blue-300 mb-2 font-medium">Skills to Learn</label>
              <div className="flex flex-wrap gap-2">
                {skillOptions.map((skill) => (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => handleSkillChange(skill)}
                    className={`px-4 py-2 rounded-full text-sm ${
                      preferences.skillsToLearn.includes(skill)
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {skill}
                  </button>
                ))}
              </div>
            </div>

            {/* Learning Style */}
            <div>
              <label className="block text-blue-300 mb-2 font-medium">Learning Style</label>
              <select
                value={preferences.learningStyle}
                onChange={(e) => setPreferences({ ...preferences, learningStyle: e.target.value })}
                className="w-full bg-gray-700 text-gray-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {learningStyleOptions.map((option) => (
                  <option key={option} value={option}>
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Availability Schedule */}
            <div>
              <label className="block text-blue-300 mb-2 font-medium">Availability Schedule</label>
              <div className="flex flex-wrap gap-2 mb-3">
                <select
                  value={selectedDay}
                  onChange={(e) => setSelectedDay(e.target.value)}
                  className="flex-grow bg-gray-700 text-gray-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select day</option>
                  {daysOfWeek.map((day) => (
                    <option key={day} value={day}>
                      {day.charAt(0).toUpperCase() + day.slice(1)}
                    </option>
                  ))}
                </select>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-32 bg-gray-700 text-gray-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Start time"
                />
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-32 bg-gray-700 text-gray-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="End time"
                />
                <button
                  type="button"
                  onClick={handleAddAvailability}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  Add
                </button>
              </div>
              
              {/* Display availability slots */}
              <div className="space-y-2 mt-3">
                {preferences.availability.map((slot, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-700 p-2 rounded-lg">
                    <span className="text-white capitalize">{slot.day}</span>
                    <div className="flex items-center">
                      <span className="text-blue-300 mr-3">
                        {slot.startTime} - {slot.endTime}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveAvailability(index)}
                        className="text-red-400 hover:text-red-300"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Communication Preference */}
            <div>
              <label className="block text-blue-300 mb-2 font-medium">Communication Preference</label>
              <select
                value={preferences.communicationPreference}
                onChange={(e) => setPreferences({ ...preferences, communicationPreference: e.target.value })}
                className="w-full bg-gray-700 text-gray-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {communicationOptions.map((option) => (
                  <option key={option} value={option}>
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Communication Frequency */}
            <div>
              <label className="block text-blue-300 mb-2 font-medium">Communication Frequency</label>
              <select
                value={preferences.communicationFrequency}
                onChange={(e) => setPreferences({ ...preferences, communicationFrequency: e.target.value })}
                className="w-full bg-gray-700 text-gray-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {frequencyOptions.map((option) => (
                  <option key={option} value={option}>
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Mentorship Duration */}
            <div>
              <label className="block text-blue-300 mb-2 font-medium">Preferred Mentorship Duration</label>
              <select
                value={preferences.mentorshipDuration}
                onChange={(e) => setPreferences({ ...preferences, mentorshipDuration: e.target.value })}
                className="w-full bg-gray-700 text-gray-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {durationOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            {/* Matching Importance Sliders */}
            <div>
              <label className="block text-blue-300 mb-2 font-medium">Matching Priorities</label>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-300">Expertise Importance</span>
                    <span className="text-blue-300">{preferences.matchingPreferences.expertiseImportance}/10</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={preferences.matchingPreferences.expertiseImportance}
                    onChange={(e) => handleImportanceChange('expertiseImportance', e.target.value)}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
                
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-300">Availability Importance</span>
                    <span className="text-blue-300">{preferences.matchingPreferences.availabilityImportance}/10</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={preferences.matchingPreferences.availabilityImportance}
                    onChange={(e) => handleImportanceChange('availabilityImportance', e.target.value)}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
                
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-300">Communication Importance</span>
                    <span className="text-blue-300">{preferences.matchingPreferences.communicationImportance}/10</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={preferences.matchingPreferences.communicationImportance}
                    onChange={(e) => handleImportanceChange('communicationImportance', e.target.value)}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4">
              <motion.button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-3 rounded-lg font-medium hover:shadow-lg disabled:opacity-50"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {isLoading ? 'Updating...' : 'Save Preferences'}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default MatchingPreferences;