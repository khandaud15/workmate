/**
 * Utility to clear localStorage when a new resume is uploaded
 */

/**
 * Keys that should be cleared when a new resume is uploaded
 */
const RESUME_RELATED_KEYS = [
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

/**
 * Completely clear all resume-related data from localStorage
 * This ensures that old data doesn't persist when a new resume is uploaded
 */
export const clearResumeDataFromLocalStorage = () => {
  try {
    console.log('Clearing all resume-related data from localStorage');
    
    // Clear all resume-related keys
    RESUME_RELATED_KEYS.forEach(key => {
      localStorage.removeItem(key);
      console.log(`Cleared ${key} from localStorage`);
    });
    
    // Set a flag indicating localStorage has been cleared
    localStorage.setItem('localStorageCleared', new Date().toISOString());
    
    return true;
  } catch (error) {
    console.error('Error clearing localStorage:', error);
    return false;
  }
};

/**
 * Check if the server indicates we should ignore localStorage
 * @param userData User data from the server
 * @returns Boolean indicating if localStorage should be ignored
 */
export const shouldIgnoreLocalStorage = (userData: any) => {
  return userData?.ignoreLocalStorage === true;
};
