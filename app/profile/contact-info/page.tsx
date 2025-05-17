'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

type ContactInfo = {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  address: string;
  city: string;
  postalCode: string;
  state: string;
  linkedIn: string;
  phone: string;
  email: string;
  smsOptIn: boolean;
};

// Global styles to fix autofill background color
const globalStyles = `
  input:-webkit-autofill,
  input:-webkit-autofill:hover,
  input:-webkit-autofill:focus,
  input:-webkit-autofill:active {
    -webkit-box-shadow: 0 0 0 1000px white inset !important;
    box-shadow: 0 0 0 1000px white inset !important;
    -webkit-text-fill-color: #1f2937 !important; /* gray-800 */
    background-color: white !important;
    transition: background-color 5000s ease-in-out 0s;
  }
`;

// Add the styles to the head
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.innerHTML = globalStyles;
  document.head.appendChild(style);
}

export default function ContactInfoForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  // Store form values directly in local state variables instead of a single object
  // This helps prevent re-renders that cause cursor position issues
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [state, setState] = useState('');
  const [linkedIn, setLinkedIn] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [smsOptIn, setSmsOptIn] = useState(false);
  
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  
  // Track which fields have been touched for validation
  const [touched, setTouched] = useState({
    firstName: false,
    lastName: false,
    dateOfBirth: false,
    address: false,
    city: false,
    postalCode: false,
    state: false,
    linkedIn: false,
    phone: false,
    email: false,
    smsOptIn: false,
  });
  
  // Store validation state
  const [validFields, setValidFields] = useState({
    firstName: false,
    lastName: false,
    dateOfBirth: false,
    address: false,
    city: false,
    postalCode: false,
    state: false,
    linkedIn: true, // Optional field
    phone: false,
    email: false,
    smsOptIn: false,
  });

  // Update validation state when form fields change
  useEffect(() => {
    // Validate all fields when they change
    const validateAllFields = () => {
      setValidFields({
        firstName: validateField('firstName', firstName, true),
        lastName: validateField('lastName', lastName, true),
        dateOfBirth: validateField('dateOfBirth', dateOfBirth, true),
        address: validateField('address', address, true),
        city: validateField('city', city, true),
        postalCode: validateField('postalCode', postalCode, true),
        state: validateField('state', state, true),
        linkedIn: true, // Optional field
        phone: validateField('phone', phone, true),
        email: validateField('email', email, true),
        smsOptIn: validateField('smsOptIn', smsOptIn, true),
      });
    };

    // Only validate if we're not in the initial loading state
    if (!isLoading) {
      validateAllFields();
    }
  }, [firstName, lastName, dateOfBirth, address, city, postalCode, state, phone, email, smsOptIn, isLoading]);

  // Load saved form data from localStorage on mount
  useEffect(() => {
    const loadSavedFormData = () => {
      try {
        const savedFormData = localStorage.getItem('contactFormData');
        if (savedFormData) {
          const formData = JSON.parse(savedFormData);
          // Update all form fields with saved data
          if (formData.firstName) setFirstName(formData.firstName);
          if (formData.lastName) setLastName(formData.lastName);
          if (formData.dateOfBirth) setDateOfBirth(formData.dateOfBirth);
          if (formData.address) setAddress(formData.address);
          if (formData.city) setCity(formData.city);
          if (formData.postalCode) setPostalCode(formData.postalCode);
          if (formData.state) setState(formData.state);
          if (formData.linkedIn) setLinkedIn(formData.linkedIn);
          if (formData.phone) setPhone(formData.phone);
          if (formData.email) setEmail(formData.email);
          if (formData.smsOptIn !== undefined) setSmsOptIn(formData.smsOptIn);
        }
      } catch (error) {
        console.error('Error loading saved form data:', error);
      }
    };

    loadSavedFormData();
  }, []);

  // Save form data to localStorage whenever any field changes
  useEffect(() => {
    // Only save if we have at least some data to prevent unnecessary saves
    if (firstName || lastName || email || phone) {
      const formData = {
        firstName,
        lastName,
        dateOfBirth,
        address,
        city,
        postalCode,
        state,
        linkedIn,
        phone,
        email,
        smsOptIn
      };
      
      try {
        localStorage.setItem('contactFormData', JSON.stringify(formData));
      } catch (error) {
        console.error('Error saving form data:', error);
      }
    }
  }, [firstName, lastName, dateOfBirth, address, city, postalCode, state, linkedIn, phone, email, smsOptIn]);
  
  // Handle component unmounting and window close
  useEffect(() => {
    // Save data before the page is unloaded
    const handleBeforeUnload = () => {
      if (firstName || lastName || email || phone) {
        const formData = {
          firstName,
          lastName,
          dateOfBirth,
          address,
          city,
          postalCode,
          state,
          linkedIn,
          phone,
          email,
          smsOptIn
        };
        
        try {
          localStorage.setItem('contactFormData', JSON.stringify(formData));
        } catch (error) {
          console.error('Error saving form data before unload:', error);
        }
      }
    };
    
    // Add event listeners for page unload
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    // Cleanup function to remove event listeners
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      
      // Final save when component unmounts
      if (firstName || lastName || email || phone) {
        const formData = {
          firstName,
          lastName,
          dateOfBirth,
          address,
          city,
          postalCode,
          state,
          linkedIn,
          phone,
          email,
          smsOptIn
        };
        
        try {
          localStorage.setItem('contactFormData', JSON.stringify(formData));
        } catch (error) {
          console.error('Error saving form data on unmount:', error);
        }
      }
    };
  }, [firstName, lastName, dateOfBirth, address, city, postalCode, state, linkedIn, phone, email, smsOptIn]);

  // Load resume data on mount
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        // Check if we have a new resume upload that hasn't been processed yet
        const resumeLastUploaded = localStorage.getItem('resumeUploadTimestamp');
        const contactLastProcessed = localStorage.getItem('lastProcessedContactTimestamp');
        const hasNewResume = resumeLastUploaded && resumeLastUploaded !== contactLastProcessed;
        
        // Always load saved contact form data first
        const savedContactFormData = localStorage.getItem('contactFormData');
        let hasExistingData = false;
        
        if (savedContactFormData) {
          try {
            const formData = JSON.parse(savedContactFormData);
            // Only use saved form data if we don't have a new resume to process
            if (!hasNewResume) {
              if (formData.firstName) setFirstName(formData.firstName);
              if (formData.lastName) setLastName(formData.lastName);
              if (formData.dateOfBirth) {
                setDateOfBirth(formData.dateOfBirth);
                try {
                  setSelectedDate(new Date(formData.dateOfBirth));
                } catch (e) {}
              }
              if (formData.address) setAddress(formData.address);
              if (formData.city) setCity(formData.city);
              if (formData.postalCode) setPostalCode(formData.postalCode);
              if (formData.state) setState(formData.state);
              if (formData.linkedIn) setLinkedIn(formData.linkedIn);
              if (formData.phone) setPhone(formData.phone);
              if (formData.email) setEmail(formData.email);
              if (formData.smsOptIn !== undefined) setSmsOptIn(formData.smsOptIn);
              
              // Check if we have meaningful data (not just empty strings)
              hasExistingData = !!(formData.firstName || formData.lastName || formData.email || formData.phone);
            }
          } catch (error) {
            console.error('Error parsing saved contact form data:', error);
          }
        }
        
        // Only load from resume data if we have a new resume to process
        if (hasNewResume) {
          // Clear fields to prepare for new resume data
          setFirstName('');
          setLastName('');
          setEmail('');
          setPhone('');
          setAddress('');
          setCity('');
          setState('');
          setPostalCode('');
          setLinkedIn('');
          setDateOfBirth('');
          setSelectedDate(null);
          
          // Try to load from resume data
          const savedData = localStorage.getItem('resumeData');
          if (savedData) {
            try {
              const resumeData = JSON.parse(savedData);
              if (resumeData.name?.first) setFirstName(resumeData.name.first);
              if (resumeData.name?.last) setLastName(resumeData.name.last);
              if (resumeData.email) setEmail(resumeData.email);
              if (resumeData.phone) setPhone(resumeData.phone);
              
              // Update other fields if available
              if (resumeData.address) setAddress(resumeData.address);
              if (resumeData.city) setCity(resumeData.city);
              if (resumeData.state) setState(resumeData.state);
              if (resumeData.postalCode) setPostalCode(resumeData.postalCode);
              if (resumeData.linkedIn) setLinkedIn(resumeData.linkedIn);
              
              // Mark this resume as processed for contact info
              localStorage.setItem('lastProcessedContactTimestamp', resumeLastUploaded || '');
              
              // Update the saved contact form data with the new resume data
              const updatedFormData = {
                firstName: resumeData.name?.first || '',
                lastName: resumeData.name?.last || '',
                email: resumeData.email || '',
                phone: resumeData.phone || '',
                address: resumeData.address || '',
                city: resumeData.city || '',
                state: resumeData.state || '',
                postalCode: resumeData.postalCode || '',
                linkedIn: resumeData.linkedIn || '',
                dateOfBirth: '', // Don't overwrite DOB from resume
                smsOptIn: false // Reset opt-in
              };
              
              localStorage.setItem('contactFormData', JSON.stringify(updatedFormData));
            } catch (error) {
              console.error('Error parsing resume data:', error);
            }
          }
        }
        
        // Then try to fetch from API
        const fetchResumeData = async () => {
          const identifier = localStorage.getItem('resumeIdentifier');
          if (!identifier) {
            console.error('No resume identifier found');
            return;
          }
    
          try {
            const response = await fetch(`/api/resume/scan?identifier=${identifier}`);
            if (!response.ok) {
              throw new Error('Failed to fetch resume data');
            }
    
            const data = await response.json();
            if (data.data) {
              // Extract name parts with enhanced matching
              let firstNameVal = '', lastNameVal = '';
              if (typeof data.data.name === 'object') {
                firstNameVal = data.data.name.first || data.data.name.firstName || data.data.name.given_name || '';
                lastNameVal = data.data.name.last || data.data.name.lastName || data.data.name.family_name || data.data.name.surname || '';
              } else if (typeof data.data.name === 'string') {
                const parts = data.data.name.split(' ');
                firstNameVal = parts[0] || '';
                lastNameVal = parts.slice(1).join(' ') || '';
              }
              
              // If name wasn't found in the standard fields, try alternate fields
              if (!firstNameVal && !lastNameVal) {
                // Try basic_info section
                if (data.data.basic_info && typeof data.data.basic_info === 'object') {
                  if (data.data.basic_info.name) {
                    if (typeof data.data.basic_info.name === 'string') {
                      const parts = data.data.basic_info.name.split(' ');
                      firstNameVal = parts[0] || '';
                      lastNameVal = parts.slice(1).join(' ') || '';
                    } else if (typeof data.data.basic_info.name === 'object') {
                      firstNameVal = data.data.basic_info.name.first || data.data.basic_info.name.firstName || '';
                      lastNameVal = data.data.basic_info.name.last || data.data.basic_info.name.lastName || '';
                    }
                  }
                }
                
                // Try personal_info section
                if (!firstNameVal && data.data.personal_info && typeof data.data.personal_info === 'object') {
                  if (data.data.personal_info.name) {
                    if (typeof data.data.personal_info.name === 'string') {
                      const parts = data.data.personal_info.name.split(' ');
                      firstNameVal = parts[0] || '';
                      lastNameVal = parts.slice(1).join(' ') || '';
                    } else if (typeof data.data.personal_info.name === 'object') {
                      firstNameVal = data.data.personal_info.name.first || data.data.personal_info.name.firstName || '';
                      lastNameVal = data.data.personal_info.name.last || data.data.personal_info.name.lastName || '';
                    }
                  }
                }
                
                // Try firstName/lastName direct fields
                if (!firstNameVal) {
                  firstNameVal = data.data.firstName || data.data.first_name || '';
                }
                if (!lastNameVal) {
                  lastNameVal = data.data.lastName || data.data.last_name || '';
                }
              }
              if (firstNameVal) setFirstName(firstNameVal);
              if (lastNameVal) setLastName(lastNameVal);
    
              // Get location data with enhanced matching
              let location = null;
              
              // Try standard location fields
              if (data.data.location) {
                location = data.data.location;
              } else if (data.data.addresses && data.data.addresses.length > 0) {
                location = data.data.addresses[0];
              } else if (data.data.address) {
                location = data.data.address;
              }
              
              // Try alternate location fields
              if (!location) {
                // Try contact_info section
                if (data.data.contact_info && typeof data.data.contact_info === 'object') {
                  if (data.data.contact_info.address) {
                    location = data.data.contact_info.address;
                  } else if (data.data.contact_info.location) {
                    location = data.data.contact_info.location;
                  }
                }
                
                // Try personal_info section
                if (!location && data.data.personal_info && typeof data.data.personal_info === 'object') {
                  if (data.data.personal_info.address) {
                    location = data.data.personal_info.address;
                  } else if (data.data.personal_info.location) {
                    location = data.data.personal_info.location;
                  }
                }
                
                // Try basic_info section
                if (!location && data.data.basic_info && typeof data.data.basic_info === 'object') {
                  if (data.data.basic_info.address) {
                    location = data.data.basic_info.address;
                  } else if (data.data.basic_info.location) {
                    location = data.data.basic_info.location;
                  }
                }
              }
    
              // Extract phone number - try multiple possible fields with enhanced matching
              let phoneVal = '';
              
              // Try standard phone fields
              if (data.data.phone) {
                phoneVal = data.data.phone;
              } else if (data.data.phoneNumbers && data.data.phoneNumbers.length > 0) {
                phoneVal = data.data.phoneNumbers[0];
              } else if (data.data.phones && data.data.phones.length > 0) {
                phoneVal = typeof data.data.phones[0] === 'string' ? 
                  data.data.phones[0] : 
                  data.data.phones[0].number || data.data.phones[0].phone || '';
              } else if (data.data.contactPoints) {
                const phonePoint = data.data.contactPoints.find((point: any) => 
                  point.type === 'phone' || point.type === 'mobile'
                );
                if (phonePoint) {
                  phoneVal = phonePoint.value;
                }
              }
              
              // Try alternate phone fields
              if (!phoneVal) {
                // Try contact_info section
                if (data.data.contact_info && typeof data.data.contact_info === 'object') {
                  if (data.data.contact_info.phone) {
                    phoneVal = data.data.contact_info.phone;
                  } else if (data.data.contact_info.mobile) {
                    phoneVal = data.data.contact_info.mobile;
                  } else if (data.data.contact_info.cell) {
                    phoneVal = data.data.contact_info.cell;
                  } else if (data.data.contact_info.telephone) {
                    phoneVal = data.data.contact_info.telephone;
                  } else if (data.data.contact_info.phone_number) {
                    phoneVal = data.data.contact_info.phone_number;
                  }
                }
                
                // Try personal_info section
                if (!phoneVal && data.data.personal_info && typeof data.data.personal_info === 'object') {
                  if (data.data.personal_info.phone) {
                    phoneVal = data.data.personal_info.phone;
                  } else if (data.data.personal_info.mobile) {
                    phoneVal = data.data.personal_info.mobile;
                  } else if (data.data.personal_info.cell) {
                    phoneVal = data.data.personal_info.cell;
                  } else if (data.data.personal_info.telephone) {
                    phoneVal = data.data.personal_info.telephone;
                  }
                }
                
                // Try basic_info section
                if (!phoneVal && data.data.basic_info && typeof data.data.basic_info === 'object') {
                  if (data.data.basic_info.phone) {
                    phoneVal = data.data.basic_info.phone;
                  } else if (data.data.basic_info.mobile) {
                    phoneVal = data.data.basic_info.mobile;
                  } else if (data.data.basic_info.cell) {
                    phoneVal = data.data.basic_info.cell;
                  }
                }
                
                // Try direct fields
                if (!phoneVal) {
                  phoneVal = data.data.mobile || data.data.cell || data.data.telephone || data.data.phone_number || data.data.mobile_number || '';
                }
              }
    
              // Clean up phone number
              phoneVal = phoneVal.replace(/[^\d+]/g, '');
              if (phoneVal && !phoneVal.startsWith('+')) {
                phoneVal = '+1' + phoneVal; // Add US country code if missing
              }
              if (phoneVal) setPhone(phoneVal);
    
              // Extract email with enhanced matching
              let emailVal = data.data.email || 
                           data.data.emailAddress || 
                           data.data.email_address || 
                           (data.data.emails && data.data.emails.length > 0 && data.data.emails[0]) || 
                           '';
              
              // Try alternate email fields if not found
              if (!emailVal) {
                // Try contact_info section
                if (data.data.contact_info && typeof data.data.contact_info === 'object') {
                  emailVal = data.data.contact_info.email || 
                             data.data.contact_info.emailAddress || 
                             data.data.contact_info.email_address || 
                             '';
                }
                
                // Try personal_info section
                if (!emailVal && data.data.personal_info && typeof data.data.personal_info === 'object') {
                  emailVal = data.data.personal_info.email || 
                             data.data.personal_info.emailAddress || 
                             data.data.personal_info.email_address || 
                             '';
                }
                
                // Try basic_info section
                if (!emailVal && data.data.basic_info && typeof data.data.basic_info === 'object') {
                  emailVal = data.data.basic_info.email || 
                             data.data.basic_info.emailAddress || 
                             data.data.basic_info.email_address || 
                             '';
                }
                
                // Try contactPoints array
                if (!emailVal && data.data.contactPoints && Array.isArray(data.data.contactPoints)) {
                  const emailPoint = data.data.contactPoints.find((point: any) => 
                    point.type === 'email' || point.label === 'email'
                  );
                  if (emailPoint) {
                    emailVal = emailPoint.value || emailPoint.address || '';
                  }
                }
                
                // Try contact array
                if (!emailVal && data.data.contact && Array.isArray(data.data.contact)) {
                  const emailContact = data.data.contact.find((item: any) => 
                    item.type === 'email' || 
                    (typeof item === 'object' && item.email) || 
                    (typeof item === 'string' && item.includes('@'))
                  );
                  if (emailContact) {
                    emailVal = typeof emailContact === 'string' ? 
                      emailContact : 
                      emailContact.email || emailContact.value || emailContact.address || '';
                  }
                }
              }
              
              // Validate email format
              if (emailVal && !emailVal.includes('@')) {
                // If it doesn't look like an email, try to find a better match
                const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
                const rawText = JSON.stringify(data.data);
                const matches = rawText.match(emailRegex);
                if (matches && matches.length > 0) {
                  emailVal = matches[0];
                }
              }
              if (emailVal) setEmail(emailVal);
    
              // Extract LinkedIn URL with enhanced matching
              let linkedInVal = '';
              
              // First try direct LinkedIn URL fields
              if (data.data.linkedin_url) {
                linkedInVal = data.data.linkedin_url;
              } else if (data.data.linkedInUrl) {
                linkedInVal = data.data.linkedInUrl;
              } else if (data.data.linkedin) {
                linkedInVal = data.data.linkedin;
              } else {
                // Look in websites array
                if (data.data.websites) {
                  const linkedInSite = data.data.websites.find((site: any) => 
                    (typeof site === 'string' && site.toLowerCase().includes('linkedin.com')) ||
                    (site.url && site.url.toLowerCase().includes('linkedin.com')) ||
                    (site.name && site.name.toLowerCase().includes('linkedin'))
                  );
                  if (linkedInSite) {
                    linkedInVal = typeof linkedInSite === 'string' ? linkedInSite : linkedInSite.url;
                  }
                }
                
                // Look in social_links array
                if (!linkedInVal && data.data.social_links) {
                  const linkedInProfile = data.data.social_links.find((link: any) => 
                    (typeof link === 'string' && link.toLowerCase().includes('linkedin.com')) ||
                    (link.url && link.url.toLowerCase().includes('linkedin.com')) ||
                    (link.type && link.type.toLowerCase() === 'linkedin') ||
                    (link.network && link.network.toLowerCase() === 'linkedin') ||
                    (link.name && link.name.toLowerCase().includes('linkedin'))
                  );
                  if (linkedInProfile) {
                    linkedInVal = typeof linkedInProfile === 'string' ? linkedInProfile : linkedInProfile.url;
                  }
                }
                
                // Look in profiles array
                if (!linkedInVal && data.data.profiles) {
                  const linkedInProfile = data.data.profiles.find((profile: any) => 
                    profile.network?.toLowerCase() === 'linkedin' || 
                    profile.url?.toLowerCase().includes('linkedin.com') ||
                    profile.name?.toLowerCase().includes('linkedin')
                  );
                  if (linkedInProfile) {
                    linkedInVal = profileToUrl(linkedInProfile);
                  }
                }
                
                // Look in raw URLs array
                if (!linkedInVal && data.data.urls) {
                  const linkedInUrl = data.data.urls.find((url: string) => 
                    url.toLowerCase().includes('linkedin.com')
                  );
                  if (linkedInUrl) {
                    linkedInVal = linkedInUrl;
                  }
                }
                
                // Look in social_media array
                if (!linkedInVal && data.data.social_media) {
                  const linkedInSocial = data.data.social_media.find((social: any) => 
                    (typeof social === 'string' && social.toLowerCase().includes('linkedin.com')) ||
                    (social.url && social.url.toLowerCase().includes('linkedin.com')) ||
                    (social.type && social.type.toLowerCase() === 'linkedin') ||
                    (social.network && social.network.toLowerCase() === 'linkedin')
                  );
                  if (linkedInSocial) {
                    linkedInVal = typeof linkedInSocial === 'string' ? linkedInSocial : linkedInSocial.url || linkedInSocial.link || '';
                  }
                }
                
                // Try contact_info section
                if (!linkedInVal && data.data.contact_info && typeof data.data.contact_info === 'object') {
                  if (data.data.contact_info.linkedin) {
                    linkedInVal = data.data.contact_info.linkedin;
                  } else if (data.data.contact_info.linkedin_url) {
                    linkedInVal = data.data.contact_info.linkedin_url;
                  } else if (data.data.contact_info.linkedInUrl) {
                    linkedInVal = data.data.contact_info.linkedInUrl;
                  }
                }
                
                // Try to extract from raw text if all else fails
                if (!linkedInVal) {
                  const rawText = JSON.stringify(data.data);
                  const linkedInRegex = /(?:https?:\/\/)?(?:www\.)?linkedin\.com\/(?:in|profile)\/[\w\-]+/i;
                  const matches = rawText.match(linkedInRegex);
                  if (matches && matches.length > 0) {
                    linkedInVal = matches[0];
                  }
                }
              }
              
              // Helper function to extract URL from profile object
              function profileToUrl(profile: any): string {
                if (profile.url) return profile.url;
                if (profile.link) return profile.link;
                if (profile.username) {
                  return `https://www.linkedin.com/in/${profile.username}`;
                }
                return '';
              }
              
              // Ensure LinkedIn URL starts with https://
              if (linkedInVal && !linkedInVal.startsWith('http')) {
                linkedInVal = 'https://' + linkedInVal;
              }
              if (linkedInVal) setLinkedIn(linkedInVal);
    
              // Set address fields with enhanced matching
              if (location) {
                console.log('Location data found:', location);
                
                // Handle case where location is just a string
                if (typeof location === 'string') {
                  // Try to extract information from a simple string location
                  const parts = location.split(',').map(part => part.trim());
                  if (parts.length === 1) {
                    // Likely just a country or city
                    if (parts[0].length > 0) {
                      setCity(parts[0]);
                    }
                  } else if (parts.length === 2) {
                    // Likely city, country/state format
                    setCity(parts[0]);
                    setState(parts[1]);
                  } else if (parts.length >= 3) {
                    // More detailed address
                    setAddress(parts[0]);
                    setCity(parts[1]);
                    setState(parts[2]);
                  }
                } else {
                  // Extract street address with more variations
                  const addressVal = location.street_address || 
                                     location.streetAddress || 
                                     location.street || 
                                     location.address_line1 || 
                                     location.addressLine1 || 
                                     location.line1 || 
                                     location.address || 
                                     location.street_line1 || 
                                     '';
                  
                  // Extract city with more variations
                  let cityVal = location.city || 
                                location.municipality || 
                                location.town || 
                                location.locality || 
                                '';
                  
                  // Extract state with more variations
                  let stateVal = location.state || 
                                 location.region || 
                                 location.stateCode || 
                                 location.state_code || 
                                 location.province || 
                                 location.administrative_area || 
                                 '';
                  
                  // Extract postal code with more variations
                  const postalCodeVal = location.postal_code || 
                                       location.postalCode || 
                                       location.zip || 
                                       location.zipCode || 
                                       location.zip_code || 
                                       location.postcode || 
                                       '';
                  
                  // Handle country information
                  const countryVal = location.country || location.countryName || '';
                  const countryCodeVal = location.countryCode || location.country_code || '';
                  
                  // Handle formatted location
                  const formattedLocation = location.formatted || location.formattedAddress || '';
                  
                  // If we have a country but no city/state, try to extract from formatted
                  if ((!cityVal || !stateVal) && (countryVal || formattedLocation)) {
                    const locationToProcess = formattedLocation || countryVal;
                    const parts = locationToProcess.split(',').map((part: string) => part.trim());
                    
                    if (parts.length === 1) {
                      // Just a country or city
                      if (!cityVal && !stateVal) {
                        // If it's likely a country (longer name, contains 'Kingdom', etc.)
                        if (parts[0].includes('Kingdom') || parts[0].includes('States') || 
                            parts[0].includes('Republic') || parts[0].length > 12) {
                          stateVal = parts[0];
                        } else {
                          cityVal = parts[0];
                        }
                      }
                    } else if (parts.length >= 2) {
                      // City, Country format
                      if (!cityVal) cityVal = parts[0];
                      if (!stateVal) stateVal = parts[parts.length - 1];
                    }
                  }
                  
                  // Set the values if they exist
                  if (addressVal) setAddress(addressVal);
                  if (cityVal) setCity(cityVal);
                  if (stateVal) setState(stateVal);
                  if (postalCodeVal) setPostalCode(postalCodeVal);
                  
                  // If we have raw input and nothing else, use that
                  if (!addressVal && !cityVal && !stateVal && location.rawInput) {
                    const rawLocation = location.rawInput;
                    if (typeof rawLocation === 'string') {
                      const parts = rawLocation.split(',').map(part => part.trim());
                      if (parts.length === 1) {
                        setCity(parts[0]);
                      } else if (parts.length >= 2) {
                        setCity(parts[0]);
                        setState(parts[parts.length - 1]);
                      }
                    }
                  }
                }
              }
              
              // If we couldn't extract from location object, try alternate approaches
              if (!address) {
                // Try to extract from formatted address string
                const formattedAddress = data.data.formatted_address || data.data.formattedAddress || '';
                if (formattedAddress) {
                  // Try to parse formatted address
                  const addressParts = formattedAddress.split(',').map((part: string) => part.trim());
                  if (addressParts.length >= 3) {
                    // Typically format is: street, city, state zip
                    setAddress(addressParts[0]);
                    setCity(addressParts[1]);
                    
                    // Last part might contain state and zip
                    const stateZipPart = addressParts[addressParts.length - 1];
                    const stateZipMatch = stateZipPart.match(/([A-Z]{2})\s+([0-9]{5}(-[0-9]{4})?)/);
                    if (stateZipMatch) {
                      setState(stateZipMatch[1]);
                      setPostalCode(stateZipMatch[2]);
                    }
                  }
                }
              }
              
              // Try to extract postal code from raw text if not found yet
              if (!postalCode) {
                const rawText = JSON.stringify(data.data);
                const zipRegex = /\b\d{5}(-\d{4})?\b/;
                const zipMatch = rawText.match(zipRegex);
                if (zipMatch) {
                  setPostalCode(zipMatch[0]);
                }
              }
    
              // Set date of birth if available
              const dobVal = data.data.date_of_birth || data.data.dateOfBirth || data.data.birthDate || '';
              if (dobVal) {
                setDateOfBirth(dobVal);
                try {
                  setSelectedDate(new Date(dobVal));
                } catch (e) {
                  console.error('Invalid date format:', dobVal);
                }
              }
            }
          } catch (error) {
            console.error('Error fetching resume data:', error);
          }
        };
        
        await fetchResumeData();
      } finally {
        setIsLoading(false);
      }
    };
    
    loadInitialData();
  }, []);

  // Validation function for a single field
  const validateField = useCallback((fieldName: string, value: any, silent: boolean = false): boolean => {
    switch (fieldName) {
      case 'email':
        return !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      case 'phone':
        return !value || /^\+?[\d\s-()]{10,}$/.test(value);
      case 'postalCode':
        return !value || /^\d{5}(-\d{4})?$/.test(value);
      case 'linkedIn':
        return value === '' || !value || /^https?:\/\/(www\.)?linkedin\.com\/.*$/.test(value);
      case 'smsOptIn':
        return value === true || value === false;
      default:
        return value && value.length > 0;
    }
  }, []);

  // Mark a field as touched and validate it
  const touchAndValidate = useCallback((name: string, value: any) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    const isValid = validateField(name, value);
    setValidFields(prev => ({ ...prev, [name]: isValid }));
  }, [validateField]);

  // Check if all required fields are valid
  const isFormValid = useCallback(() => {
    const allFields = {
      firstName,
      lastName,
      dateOfBirth,
      address,
      city,
      postalCode,
      state,
      linkedIn,
      phone,
      email,
      smsOptIn
    };
    
    let formIsValid = true;
    
    // Check all required fields except LinkedIn (which is optional)
    Object.entries(allFields).forEach(([key, value]) => {
      if (key !== 'linkedIn') {
        const fieldValid = validateField(key, value, true);
        if (!fieldValid) {
          formIsValid = false;
        }
      }
    });
    
    return formIsValid;
  }, [
    firstName, lastName, dateOfBirth, address, city,
    postalCode, state, linkedIn, phone, email, smsOptIn,
    validateField
  ]);

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mark all fields as touched for validation
    const allTouched = {
      firstName: true,
      lastName: true,
      dateOfBirth: true,
      address: true,
      city: true,
      postalCode: true,
      state: true,
      linkedIn: true,
      phone: true,
      email: true,
      smsOptIn: true,
    };
    setTouched(allTouched);
    
    // Validate all fields at once
    const fieldValidations = {
      firstName: validateField('firstName', firstName),
      lastName: validateField('lastName', lastName),
      dateOfBirth: validateField('dateOfBirth', dateOfBirth),
      address: validateField('address', address),
      city: validateField('city', city),
      postalCode: validateField('postalCode', postalCode),
      state: validateField('state', state),
      linkedIn: validateField('linkedIn', linkedIn),
      phone: validateField('phone', phone),
      email: validateField('email', email),
      smsOptIn: validateField('smsOptIn', smsOptIn),
    };
    setValidFields(fieldValidations);
    
    // Check if all required fields are valid
    const isFormCurrentlyValid = Object.entries(fieldValidations).every(([key, isValid]) => 
      key === 'linkedIn' || isValid // LinkedIn is optional
    );
    
    if (!isFormCurrentlyValid) {
      // Find the first invalid field and scroll to it
      const firstInvalidField = Object.entries(fieldValidations).find(([key, isValid]) => 
        key !== 'linkedIn' && !isValid
      );
      
      if (firstInvalidField) {
        const [fieldName] = firstInvalidField;
        const element = document.getElementById(fieldName);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          element.focus({ preventScroll: true });
        }
      }
      
      return;
    }
    
    // Construct the form data object to save
    const formData = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      dateOfBirth: dateOfBirth.trim(),
      address: address.trim(),
      city: city.trim(),
      postalCode: postalCode.trim(),
      state: state.trim(),
      linkedIn: linkedIn.trim(),
      phone: phone.trim().replace(/\D/g, ''), // Remove non-numeric characters
      email: email.trim().toLowerCase(),
      smsOptIn,
    };
    
    // Save to localStorage with error handling
    try {
      // Save the form data
      localStorage.setItem('contactFormData', JSON.stringify(formData));
      
      // Update the last processed timestamp to match the current resume
      const resumeLastUploaded = localStorage.getItem('resumeUploadTimestamp');
      if (resumeLastUploaded) {
        localStorage.setItem('lastProcessedContactTimestamp', resumeLastUploaded);
      } else {
        // If no resume was uploaded, set a timestamp to track when this data was saved
        localStorage.setItem('lastProcessedContactTimestamp', new Date().toISOString());
      }
      
      console.log('Contact form data saved successfully');
    } catch (error) {
      console.error('Error saving contact form data:', error);
      // Try to recover by clearing old data if storage is full
      try {
        localStorage.removeItem('contactFormData');
        localStorage.setItem('contactFormData', JSON.stringify(formData));
      } catch (e) {
        console.error('Failed to save contact form data after recovery attempt:', e);
      }
    }
    
    // Proceed to resume builder page
    router.push('/profile/resume-builder');
  };
  
  // Single handleChange function for all inputs
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    // Update the form state
    if (name === 'firstName') setFirstName(value);
    else if (name === 'lastName') setLastName(value);
    else if (name === 'address') setAddress(value);
    else if (name === 'city') setCity(value);
    else if (name === 'state') setState(value);
    else if (name === 'postalCode') setPostalCode(value);
    else if (name === 'linkedIn') setLinkedIn(value);
    else if (name === 'phone') setPhone(value);
    else if (name === 'email') setEmail(value);
    else if (name === 'smsOptIn') setSmsOptIn(checked);
    
    // Validate the field
    if (touched[name as keyof typeof touched]) {
      validateField(name, newValue);
    }
  };
  
  // Handle blur event for validation
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    const fieldValue = type === 'checkbox' ? checked : value;
    
    // Skip validation for optional fields if empty
    if (name === 'linkedIn' && !value) {
      return true;
    }
    
    // Mark the field as touched
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));
    
    // Validate the field
    validateField(name, fieldValue);
  };
  
  // Using the validateField from useCallback above
  // ... existing code ...
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fefcf9]">
        <div className="animate-pulse text-lg font-medium text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fefcf9] pb-28">
      <style jsx global>{`
        /* Add black borders to all input fields */
        input, textarea, .react-datepicker__input-container input {
          border: 1px solid rgba(0, 0, 0, 0.7) !important;
          border-radius: 0.375rem !important;
        }
      `}</style>
      {/* Main Content */}
      <div className="w-full max-w-[800px] mx-auto px-2 sm:px-4 py-6">
        <div className="relative transform hover:-translate-y-0.5 transition-transform bg-white rounded-xl border border-black/70 shadow-[0_4px_8px_rgba(0,0,0,0.1)] p-6 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 drop-shadow-sm text-center font-['Helvetica_Neue']">Contact Information</h1>
          <p className="text-gray-600 mb-6 text-base drop-shadow-sm text-center font-['Helvetica_Neue'] font-medium">Ensure your contact details are up to date — employers may reach out anytime.</p>
        </div>
      
        <form 
          onSubmit={handleSubmit} 
          autoComplete="off" 
          className="space-y-6 bg-white rounded-xl border border-black/70 shadow-[0_4px_8px_rgba(0,0,0,0.05)] p-6 transform hover:translate-y-[-2px] transition-transform"
          data-form-type="other"
          data-lpignore="true"
          data-form-type-other="true"
        >
          {/* Hidden dummy fields to trick browser autofill */}
          <input className="hidden" type="text" autoComplete="off" />
          <input className="hidden" type="password" autoComplete="off" />
          <input className="hidden" type="email" autoComplete="off" />
          <input className="hidden" type="tel" autoComplete="off" />
          
          {/* Real form fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="relative mb-2">
              <label htmlFor="firstName" className="block text-sm font-semibold text-gray-700 mb-0.5">
                First Name <span className="text-red-500">*</span>
              </label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                value={firstName}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full px-3 py-1.5 border rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0e3a68]/20 ${
                  touched.firstName && !validFields.firstName ? 'border-red-500' : 'border-gray-400'
                } transition-colors duration-200 bg-white`}
                style={{
                  WebkitBoxShadow: '0 0 0 1000px white inset',
                  WebkitTextFillColor: 'inherit',
                }}
                placeholder="John"
                autoComplete="off"
                data-lpignore="true"
                data-form-type="other"
                spellCheck="false"
                readOnly
                onFocus={(e) => e.target.removeAttribute('readOnly')}
              />
              {touched.firstName && !validFields.firstName && (
                <p className="text-red-500 text-xs mt-0.5">This field is required</p>
              )}
            </div>
            <div className="relative mb-2">
              <label htmlFor="lastName" className="block text-sm font-semibold text-gray-700 mb-0.5">
                Last Name <span className="text-red-500">*</span>
              </label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                value={lastName}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full px-3 py-1.5 border rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0e3a68]/20 ${
                  touched.lastName && !validFields.lastName ? 'border-red-500' : 'border-gray-400'
                } transition-colors duration-200 bg-white`}
                style={{
                  WebkitBoxShadow: '0 0 0 1000px white inset',
                  WebkitTextFillColor: 'inherit',
                }}
                placeholder="Doe"
                autoComplete="off"
                data-lpignore="true"
                data-form-type="other"
                spellCheck="false"
                readOnly
                onFocus={(e) => e.target.removeAttribute('readOnly')}
              />
              {touched.lastName && !validFields.lastName && (
                <p className="text-red-500 text-xs mt-0.5">This field is required</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="relative mb-2">
              <label className="block text-sm font-semibold text-gray-700 mb-0.5">
                Date of Birth
                <span className="text-red-500 ml-1">*</span>
              </label>
              <div className="relative">
                <DatePicker
                  selected={selectedDate}
                  onChange={(date: Date | null) => {
                    setSelectedDate(date);
                    setDateOfBirth(date ? date.toISOString().split('T')[0] : '');
                    touchAndValidate('dateOfBirth', date ? date.toISOString().split('T')[0] : '');
                  }}
                  dateFormat="MMMM d, yyyy"
                  showMonthDropdown
                  showYearDropdown
                  dropdownMode="select"
                  className="w-full px-3 py-1.5 border border-gray-400 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0e3a68]/20 transition-colors duration-200 bg-white autofill:bg-white autofill:shadow-[inset_0_0_0_1000px_white]"
                  placeholderText="Select date"
                  maxDate={new Date()}
                  yearDropdownItemNumber={100}
                  scrollableYearDropdown
                  calendarClassName="shadow-lg border border-gray-200 rounded-lg p-2"
                  autoComplete="off"
                  aria-label="Date of Birth"
                  aria-required={true}
                  aria-invalid={touched.dateOfBirth && !validFields.dateOfBirth}
                  wrapperClassName="w-full"
                />
              </div>
            </div>
            <div className="relative mb-2">
              <label htmlFor="address" className="block text-sm font-semibold text-gray-700 mb-0.5">
                Address <span className="text-red-500">*</span>
              </label>
              <input
                id="address"
                name="address"
                type="text"
                value={address}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full px-3 py-1.5 border rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0e3a68]/20 ${
                  touched.address && !validFields.address ? 'border-red-500' : 'border-gray-400'
                } transition-colors duration-200 bg-white`}
                style={{
                  WebkitBoxShadow: '0 0 0 1000px white inset',
                  WebkitTextFillColor: 'inherit',
                }}
                placeholder="123 Main St"
                autoComplete="off"
                data-lpignore="true"
                data-form-type="other"
                spellCheck="false"
                readOnly
                onFocus={(e) => e.target.removeAttribute('readOnly')}
              />
              {touched.address && !validFields.address && (
                <p className="text-red-500 text-xs mt-0.5">This field is required</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="relative mb-2">
              <label htmlFor="city" className="block text-sm font-semibold text-gray-700 mb-0.5">
                City <span className="text-red-500">*</span>
              </label>
              <input
                id="city"
                name="city"
                type="text"
                value={city}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full px-3 py-1.5 border rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0e3a68]/20 ${
                  touched.city && !validFields.city ? 'border-red-500' : 'border-gray-400'
                } transition-colors duration-200 bg-white`}
                style={{
                  WebkitBoxShadow: '0 0 0 1000px white inset',
                  WebkitTextFillColor: 'inherit',
                }}
                placeholder="San Francisco"
                autoComplete="off"
                data-lpignore="true"
                data-form-type="other"
                spellCheck="false"
                readOnly
                onFocus={(e) => e.target.removeAttribute('readOnly')}
              />
              {touched.city && !validFields.city && (
                <p className="text-red-500 text-xs mt-0.5">This field is required</p>
              )}
            </div>
            <div className="relative mb-2">
              <label htmlFor="state" className="block text-sm font-semibold text-gray-700 mb-0.5">
                State <span className="text-red-500">*</span>
              </label>
              <input
                id="state"
                name="state"
                type="text"
                value={state}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full px-3 py-1.5 border rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0e3a68]/20 ${
                  touched.state && !validFields.state ? 'border-red-500' : 'border-gray-400'
                } transition-colors duration-200 bg-white`}
                style={{
                  WebkitBoxShadow: '0 0 0 1000px white inset',
                  WebkitTextFillColor: 'inherit',
                }}
                placeholder="CA"
                autoComplete="off"
                data-lpignore="true"
                data-form-type="other"
                spellCheck="false"
                readOnly
                onFocus={(e) => e.target.removeAttribute('readOnly')}
              />
              {touched.state && !validFields.state && (
                <p className="text-red-500 text-xs mt-0.5">This field is required</p>
              )}
            </div>
            <div className="relative mb-2">
              <label htmlFor="postalCode" className="block text-sm font-semibold text-gray-700 mb-0.5">
                Postal Code <span className="text-red-500">*</span>
              </label>
              <input
                id="postalCode"
                name="postalCode"
                type="text"
                value={postalCode}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full px-3 py-1.5 border rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0e3a68]/20 ${
                  touched.postalCode && !validFields.postalCode ? 'border-red-500' : 'border-gray-400'
                } transition-colors duration-200 bg-white`}
                style={{
                  WebkitBoxShadow: '0 0 0 1000px white inset',
                  WebkitTextFillColor: 'inherit',
                }}
                placeholder="94105"
                autoComplete="off"
                data-lpignore="true"
                data-form-type="other"
                spellCheck="false"
                readOnly
                onFocus={(e) => e.target.removeAttribute('readOnly')}
              />
              {touched.postalCode && !validFields.postalCode && (
                <p className="text-red-500 text-xs mt-0.5">This field is required</p>
              )}
            </div>
          </div>

          <div className="relative mb-2">
            <label htmlFor="linkedIn" className="block text-sm font-semibold text-gray-700 mb-0.5">
              LinkedIn Profile
            </label>
            <input
              id="linkedIn"
              name="linkedIn"
              type="text"
              value={linkedIn}
              onChange={handleChange}
              onBlur={handleBlur}
              className="w-full px-3 py-1.5 border border-gray-400 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0e3a68]/20"
              placeholder="https://linkedin.com/in/johndoe"
              autoComplete="off"
              spellCheck="false"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="relative mb-2">
              <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-0.5">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                value={phone}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full px-3 py-1.5 border rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0e3a68]/20 ${
                  touched.phone && !validFields.phone ? 'border-red-500' : 'border-gray-400'
                } transition-colors duration-200 bg-white`}
                style={{
                  WebkitBoxShadow: '0 0 0 1000px white inset',
                  WebkitTextFillColor: 'inherit',
                }}
                placeholder="(555) 555-5555"
                autoComplete="off"
                data-lpignore="true"
                data-form-type="other"
                spellCheck="false"
                readOnly
                onFocus={(e) => e.target.removeAttribute('readOnly')}
              />
              {touched.phone && !validFields.phone && (
                <p className="text-red-500 text-xs mt-0.5">This field is required</p>
              )}
            </div>
            <div className="relative mb-2">
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-0.5">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full px-3 py-1.5 border rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0e3a68]/20 ${
                  touched.email && !validFields.email ? 'border-red-500' : 'border-gray-400'
                } transition-colors duration-200 bg-white`}
                style={{
                  WebkitBoxShadow: '0 0 0 1000px white inset',
                  WebkitTextFillColor: 'inherit',
                }}
                placeholder="john@example.com"
                autoComplete="off"
                data-lpignore="true"
                data-form-type="other"
                spellCheck="false"
                readOnly
                onFocus={(e) => e.target.removeAttribute('readOnly')}
              />
              {touched.email && !validFields.email && (
                <p className="text-red-500 text-xs mt-0.5">This field is required</p>
              )}
            </div>
          </div>

          <div className="mt-6 border-t border-gray-200 pt-6">
            <div className="flex items-start">
              <input
                type="checkbox"
                id="smsOptIn"
                name="smsOptIn"
                checked={smsOptIn}
                onChange={(e) => {
                  setSmsOptIn(e.target.checked);
                  touchAndValidate('smsOptIn', e.target.checked);
                }}
                className="mt-1 h-5 w-5 rounded border-[1.5px] border-gray-300 accent-[#0e3a68] checked:bg-[#0e3a68] checked:hover:bg-[#0c3156] focus:ring-2 focus:ring-[#0e3a68]/20 hover:border-[#0e3a68] transition-colors cursor-pointer"
              />
              <div className="ml-3 flex-1">
                <p className="text-sm leading-relaxed text-gray-700">
                  By providing your phone number and selecting the checkbox, you consent to receive new job alerts and account information via SMS text messages. Message frequency may vary based on your interactions with us. Message & data rates may apply. You can opt-out at any time by replying "STOP" to unsubscribe or contacting Customer Service. For more information, please refer to our{' '}
                  <a href="/privacy" className="text-[#0e3a68] underline hover:text-[#0c3156]">Privacy Policy</a>{' '}
                  and{' '}
                  <a href="/terms" className="text-[#0e3a68] underline hover:text-[#0c3156]">Terms of Service</a>.
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Sticky Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-black/20">
        <div className="mx-auto px-2 sm:px-4 py-3 sm:py-4 w-full max-w-[800px]">
          <div className="flex justify-between items-center w-full">
            <button
              onClick={() => router.push('/profile/resume-upload')}
              className="flex items-center w-[80px] sm:w-[100px] rounded-lg border-2 border-[#0e3a68] px-4 sm:px-6 py-2 sm:py-2.5 text-[#0e3a68] text-sm sm:text-base transition-colors hover:bg-[#0e3a68]/5"
            >
              <ArrowLeftIcon className="mr-1 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5" />
              Back
            </button>
            <button
              type="submit" 
              onClick={handleSubmit}
              disabled={!isFormValid()}
              className={`flex items-center w-[80px] sm:w-[100px] rounded-lg border-2 px-4 sm:px-6 py-2 sm:py-2.5 text-sm sm:text-base font-medium transition-colors ${isFormValid() ? 'border-[#0e3a68] bg-[#0e3a68] text-white hover:bg-[#0c3156]' : 'border-gray-300 bg-gray-200 text-gray-500 cursor-not-allowed'}`}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}