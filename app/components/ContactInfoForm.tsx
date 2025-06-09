"use client";
import React, { useState, useEffect } from "react";
import { ChevronDownIcon, LinkIcon } from "@heroicons/react/24/outline";

interface ContactInfoFormProps {
  isOpen: boolean;
  onClose: () => void;
  resumeId?: string;
  initialData?: ContactFormData;
  onSave?: (data: ContactFormData) => void;
}

export interface ContactFormData {
  fullName: string;
  emailAddress: string;
  phoneNumber: string;
  linkedinUrl: string;
  personalWebsite: string;
  country: string;
  state: string;
  city: string;
  address: string;
  zipCode: string;
  showCountry: boolean;
  showState: boolean;
  showCity: boolean;
  showAddress: boolean;
  showZipCode: boolean;
}

const ContactInfoForm: React.FC<ContactInfoFormProps> = ({
  isOpen,
  onClose,
  resumeId,
  initialData,
  onSave
}) => {
  const [formData, setFormData] = useState<ContactFormData>({
    fullName: "",
    emailAddress: "",
    phoneNumber: "",
    linkedinUrl: "",
    personalWebsite: "",
    country: "USA",
    state: "",
    city: "",
    address: "",
    zipCode: "",
    showCountry: true,
    showState: true,
    showCity: true,
    showAddress: true,
    showZipCode: true,
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else if (resumeId) {
      // Fetch contact info for this resume if available
      fetchContactInfo(resumeId);
    }
  }, [initialData, resumeId]);

  const fetchContactInfo = async (id: string) => {
    try {
      console.log('Fetching contact info for resume ID:', id);
      const res = await fetch(`/api/resume/contact-info?id=${id}`);
      console.log('API response status:', res.status);
      
      if (res.ok) {
        const data = await res.json();
        console.log('API response data:', JSON.stringify(data, null, 2));
        
        if (data.contactInfo) {
          console.log('Contact info found:', JSON.stringify(data.contactInfo, null, 2));
          console.log('Address field:', data.contactInfo.address);
          console.log('Zip code field:', data.contactInfo.zipCode);
          setFormData(data.contactInfo);
        } else {
          console.warn('No contactInfo in API response');
        }
      } else {
        console.error('API response not OK:', await res.text());
      }
    } catch (error) {
      console.error("Error fetching contact info:", error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleToggle = (field: 'showCountry' | 'showState' | 'showCity' | 'showAddress' | 'showZipCode') => {
    setFormData(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (onSave) {
      onSave(formData);
    } else {
      try {
        const payload = {
          resumeId,
          contactInfo: formData
        };
        
        console.log('FRONTEND DEBUG: Attempting to save contact info. Payload:', JSON.stringify(payload, null, 2));
        const res = await fetch('/api/resume/update-contact-info', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });
        
        if (res.ok) {
          onClose();
        } else {
          console.error("Failed to save contact info");
        }
      } catch (error) {
        console.error("Error saving contact info:", error);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
      <div className="bg-[#1a1d2d] border border-[#2a2d3d] rounded-lg shadow-xl w-full max-w-4xl overflow-hidden">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <div className="bg-blue-600 text-white px-3 py-1 rounded text-xs font-bold">
                [TARGETED] MOHAMMAD DAUD KHAN
              </div>
              <button className="text-gray-400">
                <ChevronDownIcon className="h-5 w-5" />
              </button>
            </div>
            
            <div className="flex space-x-2">
              <button 
                className="bg-[#2a2d3d] text-white px-4 py-2 rounded-md text-sm hover:bg-[#3a3d4d] transition"
                onClick={onClose}
              >
                Cancel
              </button>
            </div>
          </div>
          
          <div className="flex space-x-2 mb-6 overflow-x-auto">
            <button className="bg-[#5246ec] text-white px-4 py-2 rounded-md text-sm">CONTACT</button>
            <button className="text-gray-400 px-4 py-2 rounded-md text-sm hover:bg-[#2a2d3d]">EXPERIENCE</button>
            <button className="text-gray-400 px-4 py-2 rounded-md text-sm hover:bg-[#2a2d3d]">PROJECT</button>
            <button className="text-gray-400 px-4 py-2 rounded-md text-sm hover:bg-[#2a2d3d]">EDUCATION</button>
            <button className="text-gray-400 px-4 py-2 rounded-md text-sm hover:bg-[#2a2d3d]">CERTIFICATIONS</button>
            <button className="text-gray-400 px-4 py-2 rounded-md text-sm hover:bg-[#2a2d3d]">COURSEWORK</button>
            <button className="text-gray-400 px-4 py-2 rounded-md text-sm hover:bg-[#2a2d3d]">INVOLVEMENT</button>
            <button className="text-gray-400 px-4 py-2 rounded-md text-sm hover:bg-[#2a2d3d]">AWARDS & HONORS</button>
            <button className="text-gray-400 px-4 py-2 rounded-md text-sm hover:bg-[#2a2d3d]">PUBLICATIONS</button>
            <button className="text-gray-400 px-4 py-2 rounded-md text-sm hover:bg-[#2a2d3d]">SKILLS</button>
            <button className="text-gray-400 px-4 py-2 rounded-md text-sm hover:bg-[#2a2d3d]">REFERENCES</button>
            <button className="text-gray-400 px-4 py-2 rounded-md text-sm hover:bg-[#2a2d3d]">SUMMARY</button>
            <button className="text-gray-400 px-4 py-2 rounded-md text-sm hover:bg-[#2a2d3d]">...</button>
          </div>
          
          <div className="flex space-x-2 mb-8">
            <button className="border border-[#3a3d4d] text-white px-4 py-2 rounded-md text-sm hover:bg-[#2a2d3d]">
              FINISH UP & PREVIEW
            </button>
            <button className="border border-[#3a3d4d] text-white px-4 py-2 rounded-md text-sm hover:bg-[#2a2d3d]">
              AI COVER LETTER
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Full Name */}
              <div>
                <label className="block text-white uppercase text-xs font-bold mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full bg-[#1a1d2d] border border-[#363b4d] rounded-md px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Mohammad Daud Khan"
                />
              </div>
              
              {/* Email Address */}
              <div>
                <label className="block text-white uppercase text-xs font-bold mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  name="emailAddress"
                  value={formData.emailAddress}
                  onChange={handleChange}
                  className="w-full bg-[#1a1d2d] border border-[#363b4d] rounded-md px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Mohammaddaud.khan@northwestern.edu"
                />
              </div>
              
              {/* Phone Number */}
              <div>
                <label className="block text-white uppercase text-xs font-bold mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  className="w-full bg-[#1a1d2d] border border-[#363b4d] rounded-md px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="+14693636867"
                />
              </div>
              
              {/* LinkedIn URL */}
              <div>
                <label className="block text-white uppercase text-xs font-bold mb-2">
                  LinkedIn URL
                </label>
                <div className="relative">
                  <input
                    type="url"
                    name="linkedinUrl"
                    value={formData.linkedinUrl}
                    onChange={handleChange}
                    className="w-full bg-[#1a1d2d] border border-[#363b4d] rounded-md px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                    placeholder="https://linkedin.com/in/Daud-Khan15"
                  />
                  <button type="button" className="absolute right-3 top-3 text-gray-400">
                    <LinkIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
              
              {/* Personal Website */}
              <div>
                <label className="block text-white uppercase text-xs font-bold mb-2">
                  Personal Website <span className="text-gray-500 normal-case">OR RELEVANT LINK</span>
                </label>
                <input
                  type="url"
                  name="personalWebsite"
                  value={formData.personalWebsite}
                  onChange={handleChange}
                  className="w-full bg-[#1a1d2d] border border-[#363b4d] rounded-md px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://www.charlesbloomberg.com"
                />
              </div>
              
              {/* Country */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-white uppercase text-xs font-bold">
                    Country
                  </label>
                  <div className="flex items-center">
                    <span className="text-xs text-gray-400 mr-2">Show on resume</span>
                    <button 
                      type="button"
                      onClick={() => handleToggle('showCountry')}
                      className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ease-in-out ${formData.showCountry ? 'bg-blue-600' : 'bg-gray-700'}`}
                    >
                      <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ease-in-out ${formData.showCountry ? 'translate-x-6' : 'translate-x-0'}`}></div>
                    </button>
                  </div>
                </div>
                <div className="relative">
                  <select
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    className="w-full bg-[#1a1d2d] border border-[#363b4d] rounded-md px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                  >
                    <option value="USA">USA</option>
                    <option value="Canada">Canada</option>
                    <option value="UK">UK</option>
                    <option value="Australia">Australia</option>
                    <option value="India">India</option>
                  </select>
                  <ChevronDownIcon className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
                </div>
              </div>
              
              {/* State */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-white uppercase text-xs font-bold">
                    State
                  </label>
                  <div className="flex items-center">
                    <span className="text-xs text-gray-400 mr-2">Show on resume</span>
                    <button 
                      type="button"
                      onClick={() => handleToggle('showState')}
                      className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ease-in-out ${formData.showState ? 'bg-blue-600' : 'bg-gray-700'}`}
                    >
                      <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ease-in-out ${formData.showState ? 'translate-x-6' : 'translate-x-0'}`}></div>
                    </button>
                  </div>
                </div>
                <div className="relative">
                  <select
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    className="w-full bg-[#1a1d2d] border border-[#363b4d] rounded-md px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                  >
                    <option value="IL">IL</option>
                    <option value="CA">CA</option>
                    <option value="NY">NY</option>
                    <option value="TX">TX</option>
                    <option value="FL">FL</option>
                  </select>
                  <ChevronDownIcon className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
                </div>
              </div>
              
              {/* City */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-white uppercase text-xs font-bold">
                    City
                  </label>
                  <div className="flex items-center">
                    <span className="text-xs text-gray-400 mr-2">Show on resume</span>
                    <button 
                      type="button"
                      onClick={() => handleToggle('showCity')}
                      className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ease-in-out ${formData.showCity ? 'bg-blue-600' : 'bg-gray-700'}`}
                    >
                      <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ease-in-out ${formData.showCity ? 'translate-x-6' : 'translate-x-0'}`}></div>
                    </button>
                  </div>
                </div>
                <div className="relative">
                  <select
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className="w-full bg-[#1a1d2d] border border-[#363b4d] rounded-md px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                  >
                    <option value="Chicago">Chicago</option>
                    <option value="New York">New York</option>
                    <option value="Los Angeles">Los Angeles</option>
                    <option value="San Francisco">San Francisco</option>
                    <option value="Austin">Austin</option>
                    <option value="Charlottesville">Charlottesville</option>
                  </select>
                  <ChevronDownIcon className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
                </div>
              </div>
              
              {/* Address */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-white uppercase text-xs font-bold">
                    Address
                  </label>
                  <div className="flex items-center">
                    <span className="text-xs text-gray-400 mr-2">Show on resume</span>
                    <button 
                      type="button"
                      onClick={() => handleToggle('showAddress')}
                      className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ease-in-out ${formData.showAddress ? 'bg-blue-600' : 'bg-gray-700'}`}
                    >
                      <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ease-in-out ${formData.showAddress ? 'translate-x-6' : 'translate-x-0'}`}></div>
                    </button>
                  </div>
                </div>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full bg-[#1a1d2d] border border-[#363b4d] rounded-md px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="112 Montibello Circle, Apt-8."
                />
              </div>
              
              {/* ZIP Code */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-white uppercase text-xs font-bold">
                    ZIP Code
                  </label>
                  <div className="flex items-center">
                    <span className="text-xs text-gray-400 mr-2">Show on resume</span>
                    <button 
                      type="button"
                      onClick={() => handleToggle('showZipCode')}
                      className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ease-in-out ${formData.showZipCode ? 'bg-blue-600' : 'bg-gray-700'}`}
                    >
                      <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ease-in-out ${formData.showZipCode ? 'translate-x-6' : 'translate-x-0'}`}></div>
                    </button>
                  </div>
                </div>
                <input
                  type="text"
                  name="zipCode"
                  value={formData.zipCode}
                  onChange={handleChange}
                  className="w-full bg-[#1a1d2d] border border-[#363b4d] rounded-md px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="22908"
                />
              </div>
            </div>
            
            <div className="flex justify-end">
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-md transition"
              >
                SAVE BASIC INFO
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ContactInfoForm;