'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

/**
 * DataCleaner component
 * 
 * This component is responsible for ensuring data isolation between users.
 * It clears all cached data and calls the server-side reset API when a user logs in or signs up.
 * It should be included in the root layout to ensure it runs on every page.
 */
export default function DataCleaner() {
  const { data: session, status } = useSession();
  const [lastResetUser, setLastResetUser] = useState<string | null>(null);
  
  // Function to clear all localStorage data
  const clearAllCachedData = () => {
    console.log('DataCleaner: Clearing all cached data');
    
    // Clear all localStorage items
    try {
      // First, clear specific resume-related items
      const resumeKeys = [
        'resumeIdentifier',
        'parsedResumeData',
        'rawResumeData',
        'resumeData',
        'workExperiences',
        'educationData',
        'skillsData',
        'resumeSkills',
        'newResumeUploaded',
        'resumeUploadTimestamp'
      ];
      
      resumeKeys.forEach(key => {
        localStorage.removeItem(key);
      });
      
      // Then check for any other items that might contain resume data
      const allKeys = Object.keys(localStorage);
      allKeys.forEach(key => {
        if (key.includes('resume') || 
            key.includes('experience') || 
            key.includes('education') || 
            key.includes('skill') || 
            key.includes('parsed') ||
            key.includes('profile') ||
            key.includes('user') ||
            key.includes('data')) {
          localStorage.removeItem(key);
        }
      });
      
      // Set a user-specific marker to indicate data has been cleaned
      if (session?.user?.email) {
        localStorage.setItem('dataCleanedFor', session.user.email);
        localStorage.setItem('dataCleanedAt', new Date().toISOString());
      }
      
      console.log('DataCleaner: Successfully cleared all cached data');
    } catch (error) {
      console.error('DataCleaner: Error clearing cached data', error);
    }
  };
  
  // Function to call the server-side data reset API
  const resetUserDataOnServer = async (email: string) => {
    try {
      console.log(`DataCleaner: Calling server-side reset for user ${email}`);
      
      // Call our API endpoint with cache busting
      const response = await fetch(`/api/user-data-reset?nocache=${Date.now()}`, {
        method: 'POST',
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        },
        credentials: 'same-origin' // Ensure cookies are sent for authentication
      });
      
      if (!response.ok) {
        throw new Error(`Server reset failed: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('DataCleaner: Server reset response:', data);
      
      // If the server signals to clear cache, do it
      if (data.clearCache) {
        clearAllCachedData();
      }
      
      // Update the last reset user
      setLastResetUser(email);
      localStorage.setItem('lastServerResetFor', email);
      localStorage.setItem('lastServerResetAt', new Date().toISOString());
      
      return data;
    } catch (error) {
      console.error('DataCleaner: Error calling server reset:', error);
      // Still clear local data even if server reset fails
      clearAllCachedData();
      throw error;
    }
  };
  
  // Reset data when user logs in
  useEffect(() => {
    const handleUserChange = async () => {
      // Only proceed if we have an authenticated session
      if (status === 'authenticated' && session?.user?.email) {
        const currentEmail = session.user.email;
        const lastCleanedFor = localStorage.getItem('dataCleanedFor');
        const lastServerResetFor = localStorage.getItem('lastServerResetFor');
        
        // If this is a different user or we haven't cleaned data for this user yet
        if (currentEmail !== lastCleanedFor || currentEmail !== lastServerResetFor || currentEmail !== lastResetUser) {
          console.log(`DataCleaner: User change detected - Current: ${currentEmail}, Last cleaned: ${lastCleanedFor}, Last reset: ${lastResetUser}`);
          
          // First clear local data
          clearAllCachedData();
          
          // Then call server-side reset
          try {
            await resetUserDataOnServer(currentEmail);
            console.log(`DataCleaner: Successfully reset data for user ${currentEmail}`);
          } catch (error) {
            console.error('DataCleaner: Failed to reset user data on server:', error);
          }
        }
      } else if (status === 'unauthenticated') {
        // When logged out, clear all data
        clearAllCachedData();
        setLastResetUser(null);
      }
    };
    
    handleUserChange();
  }, [session, status, lastResetUser]);
  
  // This component doesn't render anything
  return null;
}
