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
    <div className="relative mb-4">
      <label className="block text-sm font-semibold text-gray-700 mb-1">
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
            w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2
            ${validation[name] ? 'border-green-500 focus:ring-green-200' : 'border-gray-300 focus:ring-blue-200'}
          `}
          {...props}
        />
        {validation[name] && (
          <CheckIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-green-500" />
        )}
      </div>
    </div>
  );

  return (
    <div className="w-full bg-gray-50 py-12">
      <div className="w-[800px] mx-auto bg-white p-8 rounded-xl shadow-sm">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Contact Information</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
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

          <div className="grid grid-cols-2 gap-4">
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
          </div>

          <InputField 
            label="Postal Code" 
            name="postalCode" 
            placeholder="94105"
          />

          <InputField 
            label="LinkedIn Profile" 
            name="linkedIn" 
            placeholder="https://linkedin.com/in/johndoe"
            required={false}
          />

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

          <div className="flex items-center space-x-3 mt-6">
            <input
              type="checkbox"
              name="smsOptIn"
              id="smsOptIn"
              checked={formData.smsOptIn}
              onChange={handleInputChange}
              className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="smsOptIn" className="text-sm text-gray-700">
              I agree to receive SMS alerts about my application status
            </label>
          </div>

          <div className="flex justify-between pt-6">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Back
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              Continue
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
