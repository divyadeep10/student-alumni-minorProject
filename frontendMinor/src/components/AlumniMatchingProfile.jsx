import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';

const AlumniMatchingProfile = () => {
  const token = localStorage.getItem('token');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [profile, setProfile] = useState({
    expertise: [],
    expertiseAreas: {}, // Map of expertise areas with strength
    industry: '',
    industryExperience: [],
    yearsOfExperience: '',
    mentorshipStyle: 'structured',
    mentorStyle: 'collaborative', // From schema enum
    availabilityPerWeek: '1-2 hours',
    availability: [], // From schema
    preferredCommunication: 'video',
    communicationPreference: 'video', // From schema enum
    preferredMenteeAttributes: [],
    mentorshipGoals: ''
  });

  // Predefined options
  const expertiseOptions = ['AI/ML', 'Web Development', 'Mobile Apps', 'Data Science', 'Cybersecurity', 'Cloud Computing', 'UI/UX Design'];
  const industryOptions = ['Technology', 'Finance', 'Healthcare', 'Education', 'E-commerce', 'Manufacturing', 'Consulting'];
  const experienceOptions = ['1-3 years', '3-5 years', '5-10 years', '10+ years'];
  const styleOptions = ['structured', 'flexible', 'goal-oriented', 'hands-on'];
  const mentorStyleOptions = ['directive', 'non-directive', 'collaborative', 'observational'];
  const availabilityOptions = ['1-2 hours', '2-4 hours', '4-6 hours', '6+ hours'];
  const communicationOptions = ['video', 'chat', 'email', 'in-person'];
  const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const menteeAttributeOptions = ['Self-motivated', 'Curious', 'Organized', 'Proactive', 'Open to feedback', 'Goal-oriented', 'Communicative'];

  // State for availability scheduling
  const [selectedDay, setSelectedDay] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  
  // State for expertise strength
  const [selectedExpertise, setSelectedExpertise] = useState('');
  const [expertiseStrength, setExpertiseStrength] = useState(5);

  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get('http://localhost:5000/api/matching/alumni-profile', {
          headers: { Authorization: token }
        });
        if (response.data) {
          setProfile(response.data);
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [token]);

  const handleExpertiseChange = (expertise) => {
    if (profile.expertise.includes(expertise)) {
      setProfile({
        ...profile,
        expertise: profile.expertise.filter(e => e !== expertise)
      });
    } else {
      setProfile({
        ...profile,
        expertise: [...profile.expertise, expertise]
      });
    }
  };

  const handleAddExpertiseStrength = () => {
    if (selectedExpertise && expertiseStrength >= 1 && expertiseStrength <= 10) {
      setProfile({
        ...profile,
        expertiseAreas: {
          ...profile.expertiseAreas,
          [selectedExpertise]: expertiseStrength
        }
      });
      setSelectedExpertise('');
      setExpertiseStrength(5);
    }
  };

  const handleRemoveExpertiseStrength = (expertise) => {
    const updatedExpertiseAreas = { ...profile.expertiseAreas };
    delete updatedExpertiseAreas[expertise];
    setProfile({
      ...profile,
      expertiseAreas: updatedExpertiseAreas
    });
  };

  const handleIndustryChange = (industry) => {
    if (profile.industryExperience.includes(industry)) {
      setProfile({
        ...profile,
        industryExperience: profile.industryExperience.filter(i => i !== industry)
      });
    } else {
      setProfile({
        ...profile,
        industryExperience: [...profile.industryExperience, industry]
      });
    }
  };

  const handleAddAvailability = () => {
    if (selectedDay && startTime && endTime) {
      setProfile({
        ...profile,
        availability: [
          ...profile.availability,
          { day: selectedDay, startTime, endTime }
        ]
      });
      setSelectedDay('');
      setStartTime('');
      setEndTime('');
    }
  };

  const handleRemoveAvailability = (index) => {
    setProfile({
      ...profile,
      availability: profile.availability.filter((_, i) => i !== index)
    });
  };

  const handleMenteeAttributeChange = (attribute) => {
    if (profile.preferredMenteeAttributes.includes(attribute)) {
      setProfile({
        ...profile,
        preferredMenteeAttributes: profile.preferredMenteeAttributes.filter(a => a !== attribute)
      });
    } else {
      setProfile({
        ...profile,
        preferredMenteeAttributes: [...profile.preferredMenteeAttributes, attribute]
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      await axios.put('http://localhost:5000/api/matching/alumni-profile', profile, {
        headers: { Authorization: token }
      });
      setSuccess('Mentoring profile updated successfully!');
    } catch (err) {
      setError('Failed to update profile. Please try again.');
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
            <h1 className="text-2xl font-bold text-blue-400">Mentoring Profile</h1>
            <p className="text-gray-400 mt-2">Set up your profile to match with students who can benefit from your expertise</p>
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
            {/* Expertise */}
            <div>
              <label className="block text-blue-300 mb-2 font-medium">Areas of Expertise</label>
              <div className="flex flex-wrap gap-2">
                {expertiseOptions.map((expertise) => (
                  <button
                    key={expertise}
                    type="button"
                    onClick={() => handleExpertiseChange(expertise)}
                    className={`px-4 py-2 rounded-full text-sm ${
                      profile.expertise.includes(expertise)
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {expertise}
                  </button>
                ))}
              </div>
            </div>

            {/* Expertise Areas with Strength */}
            <div>
              <label className="block text-blue-300 mb-2 font-medium">Expertise Strength (1-10)</label>
              <div className="flex gap-2 mb-3">
                <select
                  value={selectedExpertise}
                  onChange={(e) => setSelectedExpertise(e.target.value)}
                  className="flex-grow bg-gray-700 text-gray-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select an expertise</option>
                  {expertiseOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={expertiseStrength}
                  onChange={(e) => setExpertiseStrength(parseInt(e.target.value))}
                  className="w-20 bg-gray-700 text-gray-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={handleAddExpertiseStrength}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  Add
                </button>
              </div>
              
              {/* Display expertise strengths */}
              <div className="space-y-2 mt-3">
                {Object.entries(profile.expertiseAreas || {}).map(([expertise, strength]) => (
                  <div key={expertise} className="flex items-center justify-between bg-gray-700 p-2 rounded-lg">
                    <span className="text-white">{expertise}</span>
                    <div className="flex items-center">
                      <span className="text-blue-300 mr-3">Strength: {strength}/10</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveExpertiseStrength(expertise)}
                        className="text-red-400 hover:text-red-300"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Industry Experience */}
            <div>
              <label className="block text-blue-300 mb-2 font-medium">Industry Experience</label>
              <div className="flex flex-wrap gap-2">
                {industryOptions.map((industry) => (
                  <button
                    key={industry}
                    type="button"
                    onClick={() => handleIndustryChange(industry)}
                    className={`px-4 py-2 rounded-full text-sm ${
                      profile.industryExperience.includes(industry)
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {industry}
                  </button>
                ))}
              </div>
            </div>

            {/* Years of Experience */}
            <div>
              <label className="block text-blue-300 mb-2 font-medium">Years of Experience</label>
              <select
                value={profile.yearsOfExperience}
                onChange={(e) => setProfile({ ...profile, yearsOfExperience: e.target.value })}
                className="w-full bg-gray-700 text-gray-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select experience level</option>
                {experienceOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            {/* Mentor Style (from schema) */}
            <div>
              <label className="block text-blue-300 mb-2 font-medium">Mentor Style</label>
              <select
                value={profile.mentorStyle}
                onChange={(e) => setProfile({ ...profile, mentorStyle: e.target.value })}
                className="w-full bg-gray-700 text-gray-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {mentorStyleOptions.map((option) => (
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
                {profile.availability.map((slot, index) => (
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

            {/* Availability Per Week (original field) */}
            <div>
              <label className="block text-blue-300 mb-2 font-medium">General Availability Per Week</label>
              <select
                value={profile.availabilityPerWeek}
                onChange={(e) => setProfile({ ...profile, availabilityPerWeek: e.target.value })}
                className="w-full bg-gray-700 text-gray-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {availabilityOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            {/* Communication Preference (from schema) */}
            <div>
              <label className="block text-blue-300 mb-2 font-medium">Communication Preference</label>
              <select
                value={profile.communicationPreference}
                onChange={(e) => setProfile({ ...profile, communicationPreference: e.target.value })}
                className="w-full bg-gray-700 text-gray-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {communicationOptions.map((option) => (
                  <option key={option} value={option}>
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Preferred Mentee Attributes */}
            <div>
              <label className="block text-blue-300 mb-2 font-medium">Preferred Mentee Attributes</label>
              <div className="flex flex-wrap gap-2">
                {menteeAttributeOptions.map((attribute) => (
                  <button
                    key={attribute}
                    type="button"
                    onClick={() => handleMenteeAttributeChange(attribute)}
                    className={`px-4 py-2 rounded-full text-sm ${
                      profile.preferredMenteeAttributes.includes(attribute)
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {attribute}
                  </button>
                ))}
              </div>
            </div>

            {/* Mentorship Goals */}
            <div>
              <label htmlFor="mentorshipGoals" className="block text-blue-300 mb-2 font-medium">
                Mentorship Goals
              </label>
              <textarea
                id="mentorshipGoals"
                value={profile.mentorshipGoals}
                onChange={(e) => setProfile({ ...profile, mentorshipGoals: e.target.value })}
                className="w-full bg-gray-700 text-gray-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="3"
                placeholder="What do you hope to achieve as a mentor?"
              ></textarea>
            </div>

            <div className="pt-4">
              <motion.button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-3 rounded-lg font-medium hover:shadow-lg disabled:opacity-50"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {isLoading ? 'Updating...' : 'Save Profile'}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default AlumniMatchingProfile;
