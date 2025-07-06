import React, { useState } from 'react';
import Image from 'next/image';

interface MinimalCoverLetterTemplateProps {
  data: {
    applicantName: string;
    applicantTitle: string;
    applicantPhone: string;
    applicantEmail: string;
    applicantLinkedin: string;
    applicantLocation: string;
    recipientSalutation: string;
    bodyParagraphs: string[];
    closingSalutation: string;
    signatureName: string;
  };
  isEditable?: boolean;
}

const MinimalCoverLetterTemplate: React.FC<MinimalCoverLetterTemplateProps> = ({ 
  data, 
  isEditable = false 
}) => {
  const [photoSrc, setPhotoSrc] = useState<string>('/placeholder-profile.svg');

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setPhotoSrc(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="bg-white text-gray-800 font-sans selection:bg-blue-200 p-4 md:p-6" style={{ width: '100%', minHeight: '11in' }}>
      {/* Header Section */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8 mb-8">
        <div className="flex flex-col items-center md:items-start text-center md:text-left flex-grow">
          <h1 
            className="text-3xl md:text-4xl font-bold text-gray-800 mb-2" 
            contentEditable={isEditable}
            suppressContentEditableWarning={true}
          >
            {data.applicantName}
          </h1>
          <p 
            className="text-lg md:text-xl font-medium text-blue-600 mb-3" 
            contentEditable={isEditable}
            suppressContentEditableWarning={true}
          >
            {data.applicantTitle}
          </p>
          <div className="flex flex-wrap justify-center md:justify-start gap-x-6 gap-y-2 text-gray-600 text-sm md:text-base font-medium">
            <div 
              className="flex items-center gap-2" 
              contentEditable={isEditable}
              suppressContentEditableWarning={true}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.928.7L7.5 6H10a1 1 0 011 1v4a1 1 0 01-1 1H7.5l-1.428 2.3a1 1 0 01-.928.7H3a1 1 0 01-1-1V3z"/>
              </svg>
              {data.applicantPhone}
            </div>
            <div 
              className="flex items-center gap-2" 
              contentEditable={isEditable}
              suppressContentEditableWarning={true}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
              </svg>
              {data.applicantEmail}
            </div>
            <div 
              className="flex items-center gap-2" 
              contentEditable={isEditable}
              suppressContentEditableWarning={true}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M14.243 5.757a6 6 0 10-.986 9.284 1 1 0 111.087 1.678A8 8 0 1118 10a3 3 0 01-4.8 2.401A4 4 0 1114 10a1 1 0 102 0c0-1.537-.586-3.07-1.757-4.243zM12 10a2 2 0 10-4 0 2 2 0 004 0z" clipRule="evenodd"/>
              </svg>
              {data.applicantLinkedin}
            </div>
            <div 
              className="flex items-center gap-2" 
              contentEditable={isEditable}
              suppressContentEditableWarning={true}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/>
              </svg>
              {data.applicantLocation}
            </div>
          </div>
        </div>
        <div className="flex flex-col items-center">
          <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-2 border-gray-200">
            <Image 
              src={photoSrc} 
              alt="Profile" 
              fill
              className="object-cover"
            />
          </div>
          {isEditable && photoSrc === '/placeholder-profile.svg' && (
            <label className="mt-2 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded cursor-pointer transition photo-control">
              Upload Photo
              <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handlePhotoUpload}
              />
            </label>
          )}
          {isEditable && photoSrc !== '/placeholder-profile.svg' && (
            <div className="flex gap-2 mt-2 photo-control">
              <button 
                className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white text-xs rounded cursor-pointer transition"
                onClick={() => setPhotoSrc('/placeholder-profile.svg')}
              >
                Remove
              </button>
              <label className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded cursor-pointer transition">
                Change
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handlePhotoUpload}
                />
              </label>
            </div>
          )}
        </div>
      </div>

      {/* Cover Letter Body */}
      <div className="text-gray-800 text-base leading-relaxed">

        <p 
          className="mb-6" 
          contentEditable={isEditable}
          suppressContentEditableWarning={true}
        >
          {data.recipientSalutation}
        </p>

        {data.bodyParagraphs.map((paragraph, index) => (
          <p 
            key={index} 
            className="mb-6" 
            contentEditable={isEditable}
            suppressContentEditableWarning={true}
          >
            {paragraph}
          </p>
        ))}

        {/* Closing salutation and signature */}
        <div className="mt-8">
          <p 
            className="mb-2 text-gray-800 text-base" 
            contentEditable={isEditable}
            suppressContentEditableWarning={true}
          >
            {data.closingSalutation}
          </p>
          <p 
            className="text-gray-800 text-base" 
            contentEditable={isEditable}
            suppressContentEditableWarning={true}
          >
            {data.signatureName}
          </p>
        </div>
      </div>
    </div>
  );
};

export default MinimalCoverLetterTemplate;
