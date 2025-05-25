/**
 * Utility functions for managing resume data across localStorage and database
 */
import axios from 'axios';

/**
 * Clear all resume-related data from localStorage
 * @returns Promise that resolves when localStorage is cleared
 */
export const clearLocalStorageResumeData = () => {
  try {
    // Keys to clear from localStorage
    const keysToRemove = [
      'contactInfo',
      'workExperience',
      'education',
      'skills',
      'resumeData',
      'parsedResume',
      'uploadedResume',
      'resumeUrl',
      'parsedResumeUrl'
    ];
    
    // Remove each key
    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
      console.log(`Cleared ${key} from localStorage`);
    });
    
    // Set a flag to indicate localStorage has been cleared
    localStorage.setItem('localStorageCleared', new Date().toISOString());
    
    return true;
  } catch (error) {
    console.error('Error clearing localStorage:', error);
    return false;
  }
};

/**
 * Clear all profile data in the database
 * @returns Promise that resolves when database is cleared
 */
export const clearDatabaseProfileData = async () => {
  try {
    // Call the profile clear API
    const response = await axios.post('/api/profile/clear');
    console.log('Database profile data cleared:', response.data);
    return true;
  } catch (error) {
    console.error('Error clearing database profile data:', error);
    return false;
  }
};

/**
 * Check if a new resume has been uploaded
 * @returns Promise that resolves with a boolean indicating if a new resume has been uploaded
 */
export const checkNewResumeUploaded = async () => {
  try {
    // Call the resume check-status API
    const response = await axios.get('/api/resume/check-status');
    return response.data.hasNewResume === true;
  } catch (error) {
    console.error('Error checking for new resume:', error);
    return false;
  }
};

/**
 * Complete function to handle a new resume upload
 * This clears both localStorage and database data
 * @returns Promise that resolves when all data is cleared
 */
export const handleNewResumeUpload = async () => {
  try {
    console.log('Handling new resume upload...');
    
    // Clear localStorage first
    clearLocalStorageResumeData();
    
    // Then clear database
    await clearDatabaseProfileData();
    
    console.log('Successfully handled new resume upload');
    return true;
  } catch (error) {
    console.error('Error handling new resume upload:', error);
    return false;
  }
};
