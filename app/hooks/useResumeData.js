/**
 * Custom hook to fetch resume data directly from the server
 * This bypasses localStorage completely and ensures we always get the latest data
 */
import { useState, useEffect } from 'react';

export function useResumeData() {
  const [resumeData, setResumeData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [timestamp, setTimestamp] = useState(null);

  // Function to fetch the resume data directly from the server
  const fetchResumeData = async (force = false) => {
    try {
      setIsLoading(true);
      setError(null);

      // Add a cache-busting parameter to ensure we get fresh data
      const cacheBuster = force ? `?force=${Date.now()}` : '';
      
      // Call our new API endpoint that bypasses localStorage
      const response = await fetch(`/api/resume/get-parsed-data${cacheBuster}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch resume data');
      }
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      // Set the resume data and timestamp
      setResumeData(data.parsedResumeData);
      setTimestamp(data.timestamp);
      
      return data.parsedResumeData;
    } catch (err) {
      console.error('Error fetching resume data:', err);
      setError(err.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Function to extract work experience from the resume data
  const extractWorkExperience = (data) => {
    if (!data) return [];
    
    // Initialize work experiences array
    let workExperiences = [];
    
    // Try to find work experience data in various possible paths
    if (data['Work Experience'] && Array.isArray(data['Work Experience'])) {
      workExperiences = data['Work Experience'];
    } else if (data['work experience'] && Array.isArray(data['work experience'])) {
      workExperiences = data['work experience'];
    } else {
      // Fallback to other possible paths
      const possiblePaths = [
        'work_experience', 'workExperience', 'work_experiences', 
        'jobs', 'positions', 'experience', 'professional_experience',
        'employmentHistory', 'employment_history'
      ];
      
      // Look for work experience in different paths
      for (const path of possiblePaths) {
        const experiences = data[path] || data.data?.[path];
        if (experiences && Array.isArray(experiences)) {
          workExperiences = experiences;
          break;
        }
      }
      
      // If still not found, try to find any array that might contain work experience
      if (workExperiences.length === 0) {
        for (const key in data) {
          if (Array.isArray(data[key]) && data[key].length > 0) {
            // Check if the array items have job-related properties
            const firstItem = data[key][0];
            if (firstItem && (
              firstItem.jobTitle || firstItem.company || firstItem.position || 
              firstItem['Job Title'] || firstItem['Company'] || 
              firstItem.title || firstItem.employer || firstItem.organization
            )) {
              workExperiences = data[key];
              break;
            }
          }
        }
      }
    }
    
    return workExperiences;
  };

  // Function to extract education from the resume data
  const extractEducation = (data) => {
    if (!data) return [];
    
    // Initialize education array
    let education = [];
    
    // Try to find education data in various possible paths
    if (data['Education'] && Array.isArray(data['Education'])) {
      education = data['Education'];
    } else if (data['education'] && Array.isArray(data['education'])) {
      education = data['education'];
    } else {
      // Fallback to other possible paths
      const possiblePaths = [
        'education', 'educations', 'educational_background', 
        'schools', 'degrees', 'qualifications'
      ];
      
      // Look for education in different paths
      for (const path of possiblePaths) {
        const educationData = data[path] || data.data?.[path];
        if (educationData && Array.isArray(educationData)) {
          education = educationData;
          break;
        }
      }
    }
    
    return education;
  };

  // Function to extract skills from the resume data
  const extractSkills = (data) => {
    if (!data) return [];
    
    // Initialize skills array
    let skills = [];
    
    // Try to find skills data in various possible paths
    if (data['Skills'] && Array.isArray(data['Skills'])) {
      skills = data['Skills'];
    } else if (data['skills'] && Array.isArray(data['skills'])) {
      skills = data['skills'];
    } else {
      // Fallback to other possible paths
      const possiblePaths = [
        'skills', 'skillset', 'technical_skills', 
        'professional_skills', 'core_competencies'
      ];
      
      // Look for skills in different paths
      for (const path of possiblePaths) {
        const skillsData = data[path] || data.data?.[path];
        if (skillsData && Array.isArray(skillsData)) {
          skills = skillsData;
          break;
        }
      }
    }
    
    return skills;
  };

  // Function to extract contact info from the resume data
  const extractContactInfo = (data) => {
    if (!data) return {};
    
    // Initialize contact info object
    const contactInfo = {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      postalCode: '',
      linkedin: ''
    };
    
    // Try to extract name
    if (data.name) {
      const nameParts = data.name.split(' ');
      if (nameParts.length > 0) {
        contactInfo.firstName = nameParts[0] || '';
        contactInfo.lastName = nameParts.slice(1).join(' ') || '';
      }
    } else if (data.firstName && data.lastName) {
      contactInfo.firstName = data.firstName;
      contactInfo.lastName = data.lastName;
    } else if (data['First Name'] && data['Last Name']) {
      contactInfo.firstName = data['First Name'];
      contactInfo.lastName = data['Last Name'];
    }
    
    // Extract email
    contactInfo.email = data.email || data.Email || data['Email Address'] || '';
    
    // Extract phone
    contactInfo.phone = data.phone || data.Phone || data['Phone Number'] || '';
    
    // Extract address
    if (data.address) {
      contactInfo.address = typeof data.address === 'string' ? data.address : '';
      
      // Try to extract city, state, zip from address if it's an object
      if (typeof data.address === 'object') {
        contactInfo.city = data.address.city || data.address.City || '';
        contactInfo.state = data.address.state || data.address.State || '';
        contactInfo.postalCode = data.address.zip || data.address.postalCode || data.address['Postal Code'] || '';
      }
    }
    
    // Extract LinkedIn
    contactInfo.linkedin = data.linkedin || data.LinkedIn || data['LinkedIn URL'] || '';
    
    return contactInfo;
  };

  // Fetch resume data on mount
  useEffect(() => {
    fetchResumeData();
  }, []);

  return {
    resumeData,
    isLoading,
    error,
    timestamp,
    fetchResumeData,
    extractWorkExperience,
    extractEducation,
    extractSkills,
    extractContactInfo
  };
}
