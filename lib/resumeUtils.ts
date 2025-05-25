/**
 * Utility functions for handling resume uploads
 */

/**
 * Sets a flag in localStorage to indicate a new resume was uploaded
 */
export const setNewResumeUploaded = () => {
  try {
    localStorage.setItem('newResumeUploaded', 'true');
    localStorage.setItem('resumeUploadTimestamp', new Date().toISOString());
    console.log('Set newResumeUploaded flag in localStorage');
  } catch (error) {
    console.error('Error setting newResumeUploaded flag:', error);
  }
};

/**
 * Checks if a new resume was uploaded
 * @returns boolean indicating if a new resume was uploaded
 */
export const checkNewResumeUploaded = () => {
  try {
    return localStorage.getItem('newResumeUploaded') === 'true';
  } catch (error) {
    console.error('Error checking newResumeUploaded flag:', error);
    return false;
  }
};

/**
 * Clears the new resume uploaded flag
 */
export const clearNewResumeUploaded = () => {
  try {
    localStorage.removeItem('newResumeUploaded');
    console.log('Cleared newResumeUploaded flag from localStorage');
  } catch (error) {
    console.error('Error clearing newResumeUploaded flag:', error);
  }
};

/**
 * Clears all resume-related data from localStorage
 */
export const clearResumeDataFromLocalStorage = () => {
  try {
    // List of keys to clear
    const keysToRemove = [
      'contactInfo',
      'workExperience',
      'education',
      'skills',
      'resumeData'
    ];
    
    // Remove each key
    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
    });
    
    console.log('Cleared all resume data from localStorage');
  } catch (error) {
    console.error('Error clearing resume data from localStorage:', error);
  }
};
