'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckIcon } from '@heroicons/react/24/solid';

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

type ValidationState = {
  [K in keyof ContactInfo]: boolean;
};

export default function ContactInfoForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  // Load resume data on mount
  useEffect(() => {
    const savedData = localStorage.getItem('resumeData');
    if (savedData) {
      const resumeData = JSON.parse(savedData);
      setFormData(prevData => ({
        ...prevData,
        firstName: resumeData.name?.first || '',
        lastName: resumeData.name?.last || '',
        email: resumeData.email || '',
        phone: resumeData.phone || '',
      }));
    }
    setIsLoading(false);
  }, []);

  const [formData, setFormData] = useState<ContactInfo>({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    address: '',
    city: '',
    postalCode: '',
    state: '',
    linkedIn: '',
    phone: '',
    email: '',
    smsOptIn: false,
  });

  const [validation, setValidation] = useState<ValidationState>({
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
    smsOptIn: true,
  });

  useEffect(() => {
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
          // Extract name parts
          let firstName = '', lastName = '';
          if (typeof data.data.name === 'object') {
            firstName = data.data.name.first || '';
            lastName = data.data.name.last || '';
          } else if (typeof data.data.name === 'string') {
            const parts = data.data.name.split(' ');
            firstName = parts[0] || '';
            lastName = parts.slice(1).join(' ') || '';
          }

          // Get location data
          const location = data.data.location || (data.data.addresses && data.data.addresses[0]);
          
          setFormData(prev => ({
            ...prev,
            firstName,
            lastName,
            email: data.data.email || '',
            phone: data.data.phone || '',
            address: location?.street_address || '',
            city: location?.city || '',
            state: location?.state || '',
            postalCode: location?.postal_code || '',
            linkedIn: data.data.linkedin_url || 
                     (data.data.social_links?.find((link: string) => link.toLowerCase().includes('linkedin'))?.url) || '',
            dateOfBirth: data.data.date_of_birth || '',
          }));
        }
      } catch (error) {
        console.error('Error fetching resume data:', error);
      }
    };

    fetchResumeData();
  }, []);

  const validateField = (name: keyof ContactInfo, value: string | boolean): boolean => {
    switch (name) {
      case 'email':
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value as string);
      case 'phone':
        return /^\+?[\d\s-()]{10,}$/.test(value as string);
      case 'postalCode':
        return /^\d{5}(-\d{4})?$/.test(value as string);
      case 'linkedIn':
        return value === '' || /^https?:\/\/(www\.)?linkedin\.com\/.*$/.test(value as string);
      case 'smsOptIn':
        return true;
      default:
        return (value as string).length > 0;
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    const inputValue = type === 'checkbox' ? checked : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: inputValue
    }));

    setValidation(prev => ({
      ...prev,
      [name]: validateField(name as keyof ContactInfo, inputValue)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all fields
    const newValidation: ValidationState = {} as ValidationState;
    let isValid = true;
    
    Object.entries(formData).forEach(([key, value]) => {
      const fieldValid = validateField(key as keyof ContactInfo, value);
      newValidation[key as keyof ContactInfo] = fieldValid;
      if (!fieldValid && key !== 'linkedIn') isValid = false; // LinkedIn is optional
    });
    
    setValidation(newValidation);

    if (!isValid) {
      alert('Please fill in all required fields correctly');
      return;
    }

    // TODO: Save to database
    console.log('Form submitted:', formData);
    
    // Proceed to next step
    router.push('/profile/next-step');
  };

  const InputField = ({ 
    label, 
    name, 
    type = 'text',
    required = true,
    placeholder,
    ...props 
  }: { 
    label: string; 
    name: keyof ContactInfo; 
    type?: string;
    required?: boolean;
    placeholder?: string;
  }) => (
    <div className="relative mb-2">
      <label className="block text-sm font-semibold text-gray-700 mb-0.5">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="relative">
        <input
          type={type}
          name={name}
          value={formData[name] as string}
          onChange={handleInputChange}
          className={`
            w-full px-3 py-1.5 border rounded-lg focus:outline-none focus:ring-1
            transform transition-all duration-200
            hover:shadow-md hover:-translate-y-0.5
            ${validation[name] ? 'border-green-500 focus:ring-green-200 shadow-green-100' : 'border-gray-400 focus:ring-blue-200'}
          `}
          {...props}
        />
        {validation[name] && (
          <CheckIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-green-500" />
        )}
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-200 rounded-full animate-spin border-t-blue-500"></div>
      </div>
    );
  }

  return (
    <>
      {/* Mobile fixed buttons */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-50 shadow-lg">
        <div className="flex justify-between max-w-[800px] mx-auto">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-all hover:shadow-md hover:-translate-y-0.5 active:translate-y-0"
          >
            Back
          </button>
          <button
            type="submit"
            form="contact-form"
            className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-all hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 shadow-lg"
          >
            Next
          </button>
        </div>
      </div>

      <div className="w-full max-w-[800px] mx-auto px-4 py-6 pb-24 md:pb-6">
        <div className="relative transform hover:-translate-y-0.5 transition-transform">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 drop-shadow-sm">Contact Information</h1>
          <p className="text-gray-600 mb-6 text-base drop-shadow-sm">Ensure your contact details are up to date — employers may reach out anytime.</p>
        </div>
      
        <form id="contact-form" onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <InputField 
              label="First Name" 
              name="firstName" 
              placeholder="John"
            />
            <InputField 
              label="Last Name" 
              name="lastName" 
              placeholder="Doe"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <InputField 
              label="Date of Birth" 
              name="dateOfBirth" 
              type="date"
            />
            <InputField 
              label="Address" 
              name="address" 
              placeholder="123 Main St"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <InputField 
              label="City" 
              name="city" 
              placeholder="San Francisco"
            />
            <InputField 
              label="State" 
              name="state" 
              placeholder="CA"
            />
            <InputField 
              label="Postal Code" 
              name="postalCode" 
              placeholder="94105"
            />
          </div>

          <InputField 
            label="LinkedIn Profile" 
            name="linkedIn" 
            placeholder="https://linkedin.com/in/johndoe"
            required={false}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <InputField 
              label="Phone Number" 
              name="phone" 
              type="tel" 
              placeholder="(555) 555-5555"
            />
            <InputField 
              label="Email Address" 
              name="email" 
              type="email" 
              placeholder="john@example.com"
            />
          </div>

          <div className="mt-6 border-t border-gray-200 pt-6">
            <div className="flex items-start">
              <input
                type="checkbox"
                name="smsOptIn"
                id="smsOptIn"
                checked={formData.smsOptIn}
                onChange={handleInputChange}
                className="mt-1 h-5 w-5 border-[1.5px] border-gray-300 text-blue-600 focus:ring-1 focus:ring-blue-500"
              />
              <div className="ml-3 flex-1">
                <p className="text-sm leading-relaxed text-gray-700">
                  By providing your phone number and selecting the checkbox, you consent to receive new job alerts and account information via SMS text messages. Message frequency may vary based on your interactions with us. Message & data rates may apply. You can opt-out at any time by replying "STOP" to unsubscribe or contacting Customer Service. For more information, please refer to our{' '}
                  <a href="/privacy" className="text-blue-600 underline hover:text-blue-800">Privacy Policy</a>{' '}
                  and{' '}
                  <a href="/terms" className="text-blue-600 underline hover:text-blue-800">Terms of Service</a>.
                </p>
              </div>
            </div>
          </div>

          {/* Desktop-only buttons */}
          <div className="hidden md:flex justify-between pt-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-all hover:shadow-md hover:-translate-y-0.5 active:translate-y-0"
            >
              Back
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-all hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 shadow-lg"
            >
              Next
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
