import React, { useState, ChangeEvent } from 'react';
import MinimalCoverLetterTemplate from './MinimalCoverLetterTemplate';

interface CoverLetterTemplatesContainerProps {
  coverLetterData?: any;
  selectedTemplate?: string;
  isEditable?: boolean;
  onSelectTemplate?: (template: string) => void;
}

const CoverLetterTemplatesContainer: React.FC<CoverLetterTemplatesContainerProps> = ({
  coverLetterData,
  selectedTemplate = 'minimal',
  isEditable = false,
  onSelectTemplate
}) => {
  // This component will be expanded to include more templates in the future
  
  // Render the appropriate template based on the selection
  const renderSelectedTemplate = () => {
    switch (selectedTemplate) {
      case 'minimal':
      default:
        return (
          <div className="relative">
            <MinimalCoverLetterTemplate data={coverLetterData} isEditable={isEditable} />
            {isEditable && (
              <div className="absolute top-4 right-4 flex flex-col items-center gap-2">
                <img src={applicantPhoto} alt="Applicant Photo" className="w-24 h-24 rounded-full object-cover border-2 border-blue-600 shadow-md"/>
                <input type="file" accept="image/*" id="photo-upload-input" className="hidden" onChange={handlePhotoUpload}/>
                <button
                  onClick={() => document.getElementById('photo-upload-input')?.click()}
                  className="px-3 py-1 bg-blue-500 text-white text-xs rounded-full hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors duration-200"
                >
                  Upload Photo
                </button>
              </div>
            )}
          </div>
        );
    }
  };

  // If we're in selection mode, show the template previews
  const [hoveredTemplate, setHoveredTemplate] = useState<string | null>(null);
  
  // State to hold the URL of the applicant's photo
  const [applicantPhoto, setApplicantPhoto] = useState<string>('https://placehold.co/120x120/E0E0E0/FFFFFF?text=Photo');

  /**
   * Handles the photo upload event.
   * Reads the selected file and updates the applicantPhoto state with its Data URL.
   * @param event The change event from the file input.
   */
  const handlePhotoUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]; // Get the first selected file, if any

    if (file) {
      const reader = new FileReader();

      // Callback when the file has been successfully read
      reader.onload = (e: ProgressEvent<FileReader>) => {
        if (e.target?.result) {
          setApplicantPhoto(e.target.result as string); // Update state with the new photo URL
        }
      };

      // Read the file as a Data URL (base64 encoded string)
      reader.readAsDataURL(file);
    }
  };

  // Function to handle template selection
  const handleSelectTemplate = (template: string) => {
    if (onSelectTemplate) {
      onSelectTemplate(template);
    }
  };

  // If onSelectTemplate is provided, we're in template selection mode
  if (onSelectTemplate) {
    return (
      <div className="w-full" style={{marginBottom: '-20px'}}>
        <div className="p-2 pt-2 pb-0 px-2 md:p-3 md:pb-0 md:pt-2 rounded-lg">
          {/* Mobile-optimized scrollable container */}
          <div className="flex flex-row gap-4 justify-start max-w-full overflow-x-auto pb-0 -mx-2 px-2 snap-x snap-mandatory scroll-smooth" style={{ WebkitOverflowScrolling: 'touch', marginBottom: '-10px' }}>
            {/* Minimal Template Preview */}
            <div 
              className={`template-preview-card flex-1 max-w-[240px] min-w-[240px] border-2 ${selectedTemplate === 'minimal' || hoveredTemplate === 'minimal' ? 'border-blue-500' : 'border-gray-400'} rounded-lg cursor-pointer transition-all duration-300 snap-center`}
              onClick={() => handleSelectTemplate('minimal')}
              onMouseEnter={() => setHoveredTemplate('minimal')}
              onMouseLeave={() => setHoveredTemplate(null)}
            >
              <div className="template-preview bg-white rounded-t-lg overflow-hidden relative border border-gray-200" style={{height: '240px', padding: '8px'}}>
                <img 
                  src="/images/cover-letter-templates/Minimal_1_9cbfcc5566.png" 
                  alt="Minimal Template" 
                  className="w-full h-full object-cover" style={{objectPosition: 'top'}}
                />
              </div>
              <div className="bg-slate-800 p-2 rounded-b-lg text-center">
                <span className="text-sm font-medium text-white">Minimal</span>
              </div>
            </div>

            {/* Modern Template Preview */}
            <div 
              className={`template-preview-card flex-1 max-w-[240px] min-w-[240px] border-2 ${selectedTemplate === 'modern' || hoveredTemplate === 'modern' ? 'border-blue-500' : 'border-gray-400'} rounded-lg cursor-pointer transition-all duration-300 snap-center`}
              onClick={() => handleSelectTemplate('modern')}
              onMouseEnter={() => setHoveredTemplate('modern')}
              onMouseLeave={() => setHoveredTemplate(null)}
            >
              <div className="template-preview bg-white rounded-t-lg overflow-hidden relative border border-gray-200" style={{height: '240px', padding: '8px'}}>
                <img 
                  src="/images/cover-letter-templates/Modern_1_8812773e4d.png" 
                  alt="Modern Template" 
                  className="w-full h-full object-cover" style={{objectPosition: 'top'}}
                />
              </div>
              <div className="bg-slate-800 p-2 rounded-b-lg text-center">
                <span className="text-sm font-medium text-white">Modern</span>
              </div>
            </div>

            {/* Multi-Column Template Preview */}
            <div 
              className={`template-preview-card flex-1 max-w-[240px] min-w-[240px] border-2 ${selectedTemplate === 'multi-column' || hoveredTemplate === 'multi-column' ? 'border-blue-500' : 'border-gray-400'} rounded-lg cursor-pointer transition-all duration-300 snap-center`}
              onClick={() => handleSelectTemplate('multi-column')}
              onMouseEnter={() => setHoveredTemplate('multi-column')}
              onMouseLeave={() => setHoveredTemplate(null)}
            >
              <div className="template-preview bg-white rounded-t-lg overflow-hidden relative border border-gray-200" style={{height: '240px', padding: '8px'}}>
                <img 
                  src="/images/cover-letter-templates/Multi_Column_1_64c1f63d40.png" 
                  alt="Multi-Column Template" 
                  className="w-full h-full object-cover" style={{objectPosition: 'top'}}
                />
              </div>
              <div className="bg-slate-800 p-2 rounded-b-lg text-center">
                <span className="text-sm font-medium text-white">Multi-Column</span>
              </div>
            </div>

            {/* Minimal 2 Template Preview */}
            <div 
              className={`template-preview-card flex-1 max-w-[240px] min-w-[240px] border-2 ${selectedTemplate === 'minimal-2' || hoveredTemplate === 'minimal-2' ? 'border-blue-500' : 'border-gray-400'} rounded-lg cursor-pointer transition-all duration-300 snap-center`}
              onClick={() => handleSelectTemplate('minimal-2')}
              onMouseEnter={() => setHoveredTemplate('minimal-2')}
              onMouseLeave={() => setHoveredTemplate(null)}
            >
              <div className="template-preview bg-white rounded-t-lg overflow-hidden relative border border-gray-200" style={{height: '240px', padding: '8px'}}>
                <img 
                  src="/images/cover-letter-templates/Minimal_2_5eac4d0acc.png" 
                  alt="Minimal 2 Template" 
                  className="w-full h-full object-cover" style={{objectPosition: 'top'}}
                />
              </div>
              <div className="bg-slate-800 p-2 rounded-b-lg text-center">
                <span className="text-sm font-medium text-white">Minimal 2</span>
              </div>
            </div>

            {/* Minimal 3 Template Preview */}
            <div 
              className={`template-preview-card flex-1 max-w-[240px] min-w-[240px] border-2 ${selectedTemplate === 'minimal-3' || hoveredTemplate === 'minimal-3' ? 'border-blue-500' : 'border-gray-400'} rounded-lg cursor-pointer transition-all duration-300 snap-center`}
              onClick={() => handleSelectTemplate('minimal-3')}
              onMouseEnter={() => setHoveredTemplate('minimal-3')}
              onMouseLeave={() => setHoveredTemplate(null)}
            >
              <div className="template-preview bg-white rounded-t-lg overflow-hidden relative border border-gray-200" style={{height: '240px', padding: '8px'}}>
                <img 
                  src="/images/cover-letter-templates/Minimal_3_c2ebd8bd9e.png" 
                  alt="Minimal 3 Template" 
                  className="w-full h-full object-cover" style={{objectPosition: 'top'}}
                />
              </div>
              <div className="bg-slate-800 p-2 rounded-b-lg text-center">
                <span className="text-sm font-medium text-white">Minimal 3</span>
              </div>
            </div>

            {/* Modern 2 Template Preview */}
            <div 
              className={`template-preview-card flex-1 max-w-[240px] min-w-[240px] border-2 ${selectedTemplate === 'modern-2' || hoveredTemplate === 'modern-2' ? 'border-blue-500' : 'border-gray-400'} rounded-lg cursor-pointer transition-all duration-300 snap-center`}
              onClick={() => handleSelectTemplate('modern-2')}
              onMouseEnter={() => setHoveredTemplate('modern-2')}
              onMouseLeave={() => setHoveredTemplate(null)}
            >
              <div className="template-preview bg-white rounded-t-lg overflow-hidden relative border border-gray-200" style={{height: '240px', padding: '8px'}}>
                <img 
                  src="/images/cover-letter-templates/Modern_2_23beea2e93.png" 
                  alt="Modern 2 Template" 
                  className="w-full h-full object-cover" style={{objectPosition: 'top'}}
                />
              </div>
              <div className="bg-slate-800 p-2 rounded-b-lg text-center">
                <span className="text-sm font-medium text-white">Modern 2</span>
              </div>
            </div>

            {/* Modern 3 Template Preview */}
            <div 
              className={`template-preview-card flex-1 max-w-[240px] min-w-[240px] border-2 ${selectedTemplate === 'modern-3' || hoveredTemplate === 'modern-3' ? 'border-blue-500' : 'border-gray-400'} rounded-lg cursor-pointer transition-all duration-300 snap-center`}
              onClick={() => handleSelectTemplate('modern-3')}
              onMouseEnter={() => setHoveredTemplate('modern-3')}
              onMouseLeave={() => setHoveredTemplate(null)}
            >
              <div className="template-preview bg-white rounded-t-lg overflow-hidden relative border border-gray-200" style={{height: '240px', padding: '8px'}}>
                <img 
                  src="/images/cover-letter-templates/Modern_3_0bfef66bd7.png" 
                  alt="Modern 3 Template" 
                  className="w-full h-full object-cover" style={{objectPosition: 'top'}}
                />
              </div>
              <div className="bg-slate-800 p-2 rounded-b-lg text-center">
                <span className="text-sm font-medium text-white">Modern 3</span>
              </div>
            </div>

            {/* Multi-Column 2 Template Preview */}
            <div 
              className={`template-preview-card flex-1 max-w-[240px] min-w-[240px] border-2 ${selectedTemplate === 'multi-column-2' || hoveredTemplate === 'multi-column-2' ? 'border-blue-500' : 'border-gray-400'} rounded-lg cursor-pointer transition-all duration-300 snap-center`}
              onClick={() => handleSelectTemplate('multi-column-2')}
              onMouseEnter={() => setHoveredTemplate('multi-column-2')}
              onMouseLeave={() => setHoveredTemplate(null)}
            >
              <div className="template-preview bg-white rounded-t-lg overflow-hidden relative border border-gray-200" style={{height: '240px', padding: '8px'}}>
                <img 
                  src="/images/cover-letter-templates/Multi_Column_2_af467c430f.png" 
                  alt="Multi-Column 2 Template" 
                  className="w-full h-full object-cover" style={{objectPosition: 'top'}}
                />
              </div>
              <div className="bg-slate-800 p-2 rounded-b-lg text-center">
                <span className="text-sm font-medium text-white">Multi-Column 2</span>
              </div>
            </div>

            {/* Multi-Column 3 Template Preview */}
            <div 
              className={`template-preview-card flex-1 max-w-[240px] min-w-[240px] border-2 ${selectedTemplate === 'multi-column-3' || hoveredTemplate === 'multi-column-3' ? 'border-blue-500' : 'border-gray-400'} rounded-lg cursor-pointer transition-all duration-300 snap-center`}
              onClick={() => handleSelectTemplate('multi-column-3')}
              onMouseEnter={() => setHoveredTemplate('multi-column-3')}
              onMouseLeave={() => setHoveredTemplate(null)}
            >
              <div className="template-preview bg-white rounded-t-lg overflow-hidden relative border border-gray-200" style={{height: '240px', padding: '8px'}}>
                <img 
                  src="/images/cover-letter-templates/Multi_Column_3_29ee44d27b.png" 
                  alt="Multi-Column 3 Template" 
                  className="w-full h-full object-cover" style={{objectPosition: 'top'}}
                />
              </div>
              <div className="bg-slate-800 p-2 rounded-b-lg text-center">
                <span className="text-sm font-medium text-white">Multi-Column 3</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
};

// If onSelectTemplate is provided, we're in template selection mode
if (onSelectTemplate) {
return (
  <div className="cover-letter-templates-selection-container w-full max-w-[21cm] mx-auto bg-white shadow-lg rounded-xl overflow-hidden p-6">
    <div className="templates-grid">
      <div className="flex flex-row gap-4 overflow-x-auto pb-4 snap-x snap-mandatory">
        {/* Minimal Template Preview */}
        <div 
          className={`template-preview-card flex-1 max-w-[240px] min-w-[240px] border-2 border-gray-400 rounded-lg cursor-pointer transition-all duration-300 snap-center ${selectedTemplate === 'minimal' || hoveredTemplate === 'minimal' ? 'border-blue-500' : ''}`}
          onClick={() => handleSelectTemplate('minimal')}
          onMouseEnter={() => setHoveredTemplate('minimal')}
          onMouseLeave={() => setHoveredTemplate(null)}
        >
          <div className="template-preview bg-white rounded-t-lg overflow-hidden relative border border-gray-200" style={{height: '240px', padding: '8px'}}>
            <img 
              src="/images/cover-letter-templates/Minimal_1_9cbfcc5566.png" 
              alt="Minimal Template" 
              className="w-full h-full object-contain" style={{objectPosition: 'top'}}
            />
          </div>
          <div className="bg-gray-100 p-2 rounded-b-lg text-center border-t border-gray-200">
            <span className="text-sm font-medium">Minimal</span>
          </div>
        </div>

        {/* Modern Template Preview */}
        <div 
          className={`template-preview-card flex-1 max-w-[240px] min-w-[240px] border-2 border-gray-400 rounded-lg cursor-pointer transition-all duration-300 snap-center ${selectedTemplate === 'modern' || hoveredTemplate === 'modern' ? 'border-blue-500' : ''}`}
          onClick={() => handleSelectTemplate('modern')}
          onMouseEnter={() => setHoveredTemplate('modern')}
          onMouseLeave={() => setHoveredTemplate(null)}
        >
          <div className="template-preview bg-white rounded-t-lg overflow-hidden relative border border-gray-200" style={{height: '240px', padding: '8px'}}>
            <img 
              src="/images/cover-letter-templates/Modern_1_8812773e4d.png" 
              alt="Modern Template" 
              className="w-full h-full object-contain" style={{objectPosition: 'top'}}
            />
          </div>
          <div className="bg-gray-100 p-2 rounded-b-lg text-center border-t border-gray-200">
            <span className="text-sm font-medium">Modern</span>
          </div>
        </div>

        {/* Multi-Column Template Preview */}
        <div 
          className={`template-preview-card flex-1 max-w-[240px] min-w-[240px] border-2 border-gray-400 rounded-lg cursor-pointer transition-all duration-300 snap-center ${selectedTemplate === 'multi-column' || hoveredTemplate === 'multi-column' ? 'border-blue-500' : ''}`}
          onClick={() => handleSelectTemplate('multi-column')}
          onMouseEnter={() => setHoveredTemplate('multi-column')}
          onMouseLeave={() => setHoveredTemplate(null)}
        >
          <div className="template-preview bg-white rounded-t-lg overflow-hidden relative border border-gray-200" style={{height: '240px', padding: '8px'}}>
            <img 
              src="/images/cover-letter-templates/Multi_Column_1_64c1f63d40.png" 
              alt="Multi-Column Template" 
              className="w-full h-full object-contain" style={{objectPosition: 'top'}}
            />
          </div>
          <div className="bg-gray-100 p-2 rounded-b-lg text-center border-t border-gray-200">
            <span className="text-sm font-medium">Multi-Column</span>
          </div>
        </div>

        {/* Minimal 2 Template Preview */}
        <div 
          className={`template-preview-card flex-1 max-w-[240px] min-w-[240px] border-2 border-gray-400 rounded-lg cursor-pointer transition-all duration-300 snap-center ${selectedTemplate === 'minimal-2' || hoveredTemplate === 'minimal-2' ? 'border-blue-500' : ''}`}
          onClick={() => handleSelectTemplate('minimal-2')}
          onMouseEnter={() => setHoveredTemplate('minimal-2')}
          onMouseLeave={() => setHoveredTemplate(null)}
        >
          <div className="template-preview bg-white rounded-t-lg overflow-hidden relative border border-gray-200" style={{height: '240px', padding: '8px'}}>
            <img 
              src="/images/cover-letter-templates/Minimal_2_5eac4d0acc.png" 
              alt="Minimal 2 Template" 
              className="w-full h-full object-contain" style={{objectPosition: 'top'}}
            />
          </div>
          <div className="bg-gray-100 p-2 rounded-b-lg text-center border-t border-gray-200">
            <span className="text-sm font-medium">Minimal 2</span>
          </div>
        </div>

        {/* Minimal 3 Template Preview */}
        <div 
          className={`template-preview-card flex-1 max-w-[240px] min-w-[240px] border-2 border-gray-400 rounded-lg cursor-pointer transition-all duration-300 snap-center ${selectedTemplate === 'minimal-3' || hoveredTemplate === 'minimal-3' ? 'border-blue-500' : ''}`}
          onClick={() => handleSelectTemplate('minimal-3')}
          onMouseEnter={() => setHoveredTemplate('minimal-3')}
          onMouseLeave={() => setHoveredTemplate(null)}
        >
          <div className="template-preview bg-white rounded-t-lg overflow-hidden relative border border-gray-200" style={{height: '240px', padding: '8px'}}>
            <img 
              src="/images/cover-letter-templates/Minimal_3_c2ebd8bd9e.png" 
              alt="Minimal 3 Template" 
              className="w-full h-full object-contain" style={{objectPosition: 'top'}}
            />
          </div>
          <div className="bg-gray-100 p-2 rounded-b-lg text-center border-t border-gray-200">
            <span className="text-sm font-medium">Minimal 3</span>
          </div>
        </div>

        {/* Modern 2 Template Preview */}
        <div 
          className={`template-preview-card flex-1 max-w-[240px] min-w-[240px] border-2 border-gray-400 rounded-lg cursor-pointer transition-all duration-300 snap-center ${selectedTemplate === 'modern-2' || hoveredTemplate === 'modern-2' ? 'border-blue-500' : ''}`}
          onClick={() => handleSelectTemplate('modern-2')}
          onMouseEnter={() => setHoveredTemplate('modern-2')}
          onMouseLeave={() => setHoveredTemplate(null)}
        >
          <div className="template-preview bg-white rounded-t-lg overflow-hidden relative border border-gray-200" style={{height: '240px', padding: '8px'}}>
            <img 
              src="/images/cover-letter-templates/Modern_2_23beea2e93.png" 
              alt="Modern 2 Template" 
              className="w-full h-full object-contain" style={{objectPosition: 'top'}}
            />
          </div>
          <div className="bg-gray-100 p-2 rounded-b-lg text-center border-t border-gray-200">
            <span className="text-sm font-medium">Modern 2</span>
          </div>
        </div>

        {/* Modern 3 Template Preview */}
        <div 
          className={`template-preview-card flex-1 max-w-[240px] min-w-[240px] border-2 border-gray-400 rounded-lg cursor-pointer transition-all duration-300 snap-center ${selectedTemplate === 'modern-3' || hoveredTemplate === 'modern-3' ? 'border-blue-500' : ''}`}
          onClick={() => handleSelectTemplate('modern-3')}
          onMouseEnter={() => setHoveredTemplate('modern-3')}
          onMouseLeave={() => setHoveredTemplate(null)}
        >
          <div className="template-preview bg-white rounded-t-lg overflow-hidden relative border border-gray-200" style={{height: '240px', padding: '8px'}}>
            <img 
              src="/images/cover-letter-templates/Modern_3_0bfef66bd7.png" 
              alt="Modern 3 Template" 
              className="w-full h-full object-contain" style={{objectPosition: 'top'}}
            />
          </div>
          <div className="bg-gray-100 p-2 rounded-b-lg text-center border-t border-gray-200">
            <span className="text-sm font-medium">Modern 3</span>
          </div>
        </div>

        {/* Multi-Column 2 Template Preview */}
        <div 
          className={`template-preview-card flex-1 max-w-[240px] min-w-[240px] border-2 border-gray-400 rounded-lg cursor-pointer transition-all duration-300 snap-center ${selectedTemplate === 'multi-column-2' || hoveredTemplate === 'multi-column-2' ? 'border-blue-500' : ''}`}
          onClick={() => handleSelectTemplate('multi-column-2')}
          onMouseEnter={() => setHoveredTemplate('multi-column-2')}
          onMouseLeave={() => setHoveredTemplate(null)}
        >
          <div className="template-preview bg-white rounded-t-lg overflow-hidden relative border border-gray-200" style={{height: '240px', padding: '8px'}}>
            <img 
              src="/images/cover-letter-templates/Multi_Column_2_af467c430f.png" 
              alt="Multi-Column 2 Template" 
              className="w-full h-full object-contain" style={{objectPosition: 'top'}}
            />
          </div>
          <div className="bg-gray-100 p-2 rounded-b-lg text-center border-t border-gray-200">
            <span className="text-sm font-medium">Multi-Column 2</span>
          </div>
        </div>

        {/* Multi-Column 3 Template Preview */}
        <div 
          className={`template-preview-card flex-1 max-w-[240px] min-w-[240px] border-2 border-gray-400 rounded-lg cursor-pointer transition-all duration-300 snap-center ${selectedTemplate === 'multi-column-3' || hoveredTemplate === 'multi-column-3' ? 'border-blue-500' : ''}`}
          onClick={() => handleSelectTemplate('multi-column-3')}
          onMouseEnter={() => setHoveredTemplate('multi-column-3')}
          onMouseLeave={() => setHoveredTemplate(null)}
        >
          <div className="template-preview bg-white rounded-t-lg overflow-hidden relative border border-gray-200" style={{height: '240px', padding: '8px'}}>
            <img 
              src="/images/cover-letter-templates/Multi_Column_3_29ee44d27b.png" 
              alt="Multi-Column 3 Template" 
              className="w-full h-full object-contain" style={{objectPosition: 'top'}}
            />
          </div>
          <div className="bg-gray-100 p-2 rounded-b-lg text-center border-t border-gray-200">
            <span className="text-sm font-medium">Multi-Column 3</span>
          </div>
        </div>
      </div>
    </div>
  </div>
);
}

// If not in selection mode and a template is selected, render the selected template
if (!onSelectTemplate && selectedTemplate) {
return (
  <div className="cover-letter-templates-container w-full max-w-[21cm] mx-auto bg-white shadow-lg rounded-xl overflow-hidden">
    {renderSelectedTemplate()}
  </div>
);
}

// If not in selection mode and no template is selected, return null
return null;
};

export default CoverLetterTemplatesContainer;
