import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook to fetch and manage onboarding data from the backend
 * This ensures we always get fresh data and never rely on localStorage
 */
export function useOnboardingData() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState({
    profile: {},
    parsedResume: null,
    timestamp: null
  });

  // Function to fetch data with cache-busting
  const fetchData = useCallback(async (force = false) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Add cache-busting query parameter
      const cacheBuster = force ? `?force=${Date.now()}` : '';
      const response = await fetch(`/api/onboarding/get-data${cacheBuster}`, {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Error fetching onboarding data: ${response.status}`);
      }
      
      const result = await response.json();
      setData(result);
      return result;
    } catch (err) {
      console.error('Error in useOnboardingData:', err);
      setError(err.message || 'Failed to fetch onboarding data');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial data fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Extract contact info from parsed resume data
  const extractContactInfo = useCallback((parsedResume) => {
    if (!parsedResume) return null;
    
    // Initialize contact info object with empty values
    const contactInfo = {
      firstName: '',
      lastName: '',
      dob: '',
      address: '',
      city: '',
      state: '',
      postalCode: '',
      linkedin: '',
      phone: '',
      email: '',
      smsConsent: true
    };

    // Extract name - check various possible fields
    if (parsedResume['Full Name']) {
      const nameParts = parsedResume['Full Name'].split(' ');
      contactInfo.firstName = nameParts[0] || '';
      contactInfo.lastName = nameParts.slice(1).join(' ') || '';
    } else if (parsedResume.firstName && parsedResume.lastName) {
      contactInfo.firstName = parsedResume.firstName;
      contactInfo.lastName = parsedResume.lastName;
    } else if (parsedResume['First Name'] && parsedResume['Last Name']) {
      contactInfo.firstName = parsedResume['First Name'];
      contactInfo.lastName = parsedResume['Last Name'];
    }

    // Extract email
    contactInfo.email = parsedResume.email || parsedResume.Email || parsedResume['Email Address'] || '';

    // Extract phone
    contactInfo.phone = parsedResume.phone || parsedResume.Phone || parsedResume['Phone Number'] || '';

    // Extract address
    if (parsedResume.address) {
      if (typeof parsedResume.address === 'string') {
        contactInfo.address = parsedResume.address;
      } else if (typeof parsedResume.address === 'object') {
        // Try to extract city, state, zip from address if it's an object
        contactInfo.city = parsedResume.address.city || parsedResume.address.City || '';
        contactInfo.state = parsedResume.address.state || parsedResume.address.State || '';
        contactInfo.postalCode = parsedResume.address.zip || parsedResume.address.postalCode || parsedResume.address['Postal Code'] || '';
        
        // Combine street address components if available
        const street = parsedResume.address.street || parsedResume.address.Street || '';
        const unit = parsedResume.address.unit || parsedResume.address.Unit || '';
        contactInfo.address = street + (unit ? `, ${unit}` : '');
      }
    }

    // Extract LinkedIn
    contactInfo.linkedin = parsedResume.linkedin || parsedResume.LinkedIn || parsedResume['LinkedIn URL'] || '';

    return contactInfo;
  }, []);

  // Extract work experience from parsed resume data
  const extractWorkExperience = useCallback((parsedResume) => {
    if (!parsedResume) return [];
    
    let workExperiences = [];
    
    // Try to find work experience data in various possible paths
    if (parsedResume['Work Experience'] && Array.isArray(parsedResume['Work Experience'])) {
      workExperiences = parsedResume['Work Experience'];
    } else {
      // Fallback to other possible paths
      const possiblePaths = [
        'work_experience', 'workExperience', 'work_experiences', 
        'jobs', 'positions', 'experience', 'professional_experience'
      ];
      
      // Look for work experience in different paths
      for (const path of possiblePaths) {
        const experienceItems = parsedResume[path] || parsedResume.data?.[path];
        if (experienceItems && Array.isArray(experienceItems)) {
          workExperiences = experienceItems;
          break;
        }
      }
    }
    
    // Format work experiences
    if (workExperiences.length > 0) {
      return workExperiences.map((exp, index) => {
        // Handle different possible field names
        const jobTitle = exp.jobTitle || exp.title || exp.position || '';
        const company = exp.company || exp.employer || exp.organization || '';
        const location = exp.location || '';
        
        // Handle dates
        let startDate = '';
        let endDate = '';
        
        if (exp.dates) {
          startDate = exp.dates.startDate || exp.dates.start_date || '';
          endDate = exp.dates.endDate || exp.dates.end_date || (exp.dates.isCurrent ? 'Present' : '');
        } else {
          startDate = exp.startDate || exp.start_date || '';
          endDate = exp.endDate || exp.end_date || (exp.isCurrent ? 'Present' : '');
        }
        
        // Handle responsibilities
        let responsibilities = [];
        if (exp.responsibilities && Array.isArray(exp.responsibilities)) {
          responsibilities = exp.responsibilities;
        } else if (exp.description || exp.jobDescription || exp.text) {
          // If responsibilities aren't an array, try to split text by newlines or bullets
          const descText = exp.description || exp.jobDescription || exp.text || '';
          responsibilities = descText
            .split(/[\n•]+/)
            .map(item => item.trim())
            .filter(item => item.length > 0);
        }
        
        return {
          id: `exp-${index}`,
          jobTitle,
          company,
          location,
          startDate,
          endDate,
          responsibilities,
          isEditing: false,
          isExpanded: false
        };
      });
    }
    
    return [];
  }, []);

  // Extract education from parsed resume data
  const extractEducation = useCallback((parsedResume) => {
    if (!parsedResume) return [];
    
    let educations = [];
    
    // Try to find education data in various possible paths
    if (parsedResume['Education'] && Array.isArray(parsedResume['Education'])) {
      educations = parsedResume['Education'];
    } else {
      // Fallback to other possible paths
      const possiblePaths = [
        'education', 'educations', 'education_history', 
        'academic_history', 'schools', 'degrees'
      ];
      
      // Look for education in different paths
      for (const path of possiblePaths) {
        const educationItems = parsedResume[path] || parsedResume.data?.[path];
        if (educationItems && Array.isArray(educationItems)) {
          educations = educationItems;
          break;
        }
      }
    }
    
    // Format educations
    if (educations.length > 0) {
      return educations.map((edu, index) => {
        // Handle different possible field names
        const school = edu.school || edu.institution || edu.Institution || edu.university || '';
        const degree = edu.degree || edu.Degree || '';
        const fieldOfStudy = edu.fieldOfStudy || edu.major || edu.field || edu['Field of Study'] || '';
        
        // Handle dates
        let startDate = '';
        let endDate = '';
        
        if (edu.dates) {
          startDate = edu.dates.startDate || edu.dates.start_date || '';
          endDate = edu.dates.endDate || edu.dates.end_date || (edu.dates.isCurrent ? 'Present' : '');
        } else if (edu['Year']) {
          // Handle Year field that might contain a range
          const dateRange = edu['Year'].split(' - ');
          startDate = dateRange[0] || '';
          endDate = dateRange.length > 1 ? dateRange[1] : 'Present';
        } else {
          startDate = edu.startDate || edu.start_date || '';
          endDate = edu.endDate || edu.end_date || (edu.isCurrent ? 'Present' : '');
        }
        
        // Handle description
        const description = edu.description || '';
        
        return {
          id: `edu-${index}`,
          school,
          degree,
          fieldOfStudy,
          startDate,
          endDate,
          description,
          isEditing: false,
          isExpanded: false
        };
      });
    }
    
    return [];
  }, []);

  // Extract skills from parsed resume data
  const extractSkills = useCallback((parsedResume) => {
    if (!parsedResume) return [];
    
    let skills = [];
    
    // Try to find skills data in various possible paths
    if (parsedResume['Skills'] && Array.isArray(parsedResume['Skills'])) {
      skills = parsedResume['Skills'];
    } else if (parsedResume.skills && Array.isArray(parsedResume.skills)) {
      skills = parsedResume.skills;
    } else if (parsedResume.skills && typeof parsedResume.skills === 'string') {
      // If skills is a string, split by commas or semicolons
      skills = parsedResume.skills
        .split(/[,;]+/)
        .map(skill => skill.trim())
        .filter(skill => skill.length > 0);
    }
    
    // If skills are objects with name/value properties, extract just the names
    if (skills.length > 0 && typeof skills[0] === 'object') {
      skills = skills.map(skill => skill.name || skill.value || skill.skill || '').filter(Boolean);
    }
    
    return skills;
  }, []);

  return {
    isLoading,
    error,
    data,
    fetchData,
    extractContactInfo,
    extractWorkExperience,
    extractEducation,
    extractSkills
  };
}
