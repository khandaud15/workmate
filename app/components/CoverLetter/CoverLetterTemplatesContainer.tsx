import React, { useState } from 'react';
import MinimalCoverLetterTemplate from './MinimalCoverLetterTemplate';

interface CoverLetterTemplatesContainerProps {
  coverLetterData?: any;
  selectedTemplate?: string;
  isEditable?: boolean;
}

const CoverLetterTemplatesContainer: React.FC<CoverLetterTemplatesContainerProps> = ({
  coverLetterData,
  selectedTemplate = 'minimal',
  isEditable = false
}) => {
  // This component will be expanded to include more templates in the future
  
  // Render the appropriate template based on the selection
  const renderSelectedTemplate = () => {
    switch (selectedTemplate) {
      case 'minimal':
      default:
        return <MinimalCoverLetterTemplate coverLetterData={coverLetterData} isEditable={isEditable} />;
    }
  };

  return (
    <div className="cover-letter-templates-container w-full max-w-[21cm] mx-auto bg-white shadow-lg rounded-xl overflow-hidden">
      {renderSelectedTemplate()}
    </div>
  );
};

export default CoverLetterTemplatesContainer;
