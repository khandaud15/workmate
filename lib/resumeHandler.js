/**
 * Client-side handler for resume uploads
 * This script ensures that when a new resume is uploaded, all old data is cleared
 */

/**
 * Clear all resume-related data from localStorage
 */
export const clearLocalStorageData = () => {
  try {
    console.log('Clearing all resume-related data from localStorage');
    
    // List of keys to clear
    const keysToRemove = [
      'contactInfo',
      'workExperience',
      'education',
      'skills',
      'resumeData',
      'parsedResume',
      'resumeSkills',
      'resumeEducation',
      'resumeWorkExperience'
    ];
    
    // Remove each key
    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
      console.log(`Cleared ${key} from localStorage`);
    });
    
    // Set a flag indicating we've cleared localStorage
    localStorage.setItem('localStorageCleared', new Date().toISOString());
    
    return true;
  } catch (error) {
    console.error('Error clearing localStorage:', error);
    return false;
  }
};

/**
 * Check if the server indicates we should ignore localStorage
 * This is set when a new resume is uploaded
 */
export const checkServerFlags = async () => {
  try {
    const response = await fetch('/api/profile');
    if (response.ok) {
      const data = await response.json();
      
      // Check if there's a new resume available flag
      if (data.newResumeAvailable === true) {
        console.log('Server indicates a new resume is available');
        
        // Clear localStorage data
        clearLocalStorageData();
        
        return {
          newResumeAvailable: true,
          parsedResumeData: data.parsedResumeData,
          parsedResumeUrl: data.parsedResumeUrl
        };
      }
      
      // Check if we should ignore localStorage
      if (data.ignoreLocalStorage === true) {
        console.log('Server indicates localStorage should be ignored');
        
        // Clear localStorage data
        clearLocalStorageData();
        
        return {
          ignoreLocalStorage: true,
          parsedResumeData: data.parsedResumeData,
          parsedResumeUrl: data.parsedResumeUrl
        };
      }
      
      return {
        newResumeAvailable: false,
        ignoreLocalStorage: false,
        parsedResumeData: data.parsedResumeData,
        parsedResumeUrl: data.parsedResumeUrl
      };
    }
    
    return {
      newResumeAvailable: false,
      ignoreLocalStorage: false
    };
  } catch (error) {
    console.error('Error checking server flags:', error);
    return {
      newResumeAvailable: false,
      ignoreLocalStorage: false,
      error: true
    };
  }
};

/**
 * Force clear all profile data on the server
 */
export const forceClearProfileData = async () => {
  try {
    const response = await fetch('/api/profile/clear', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      console.log('Successfully cleared profile data on server');
      
      // Also clear localStorage
      clearLocalStorageData();
      
      return true;
    }
    
    console.error('Failed to clear profile data on server');
    return false;
  } catch (error) {
    console.error('Error clearing profile data on server:', error);
    return false;
  }
};
