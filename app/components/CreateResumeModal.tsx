"use client";
import React from "react";
import ContactInfoForm from "./ContactInfoForm";

interface CreateResumeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onResumeUploaded?: () => void;
}

const CreateResumeModal: React.FC<CreateResumeModalProps> = ({ isOpen, onClose, onResumeUploaded }) => {
  // Add custom styles for mobile
  React.useEffect(() => {
    // Create a style element
    const styleEl = document.createElement('style');
    styleEl.id = 'resume-modal-mobile-styles';
    
    // Add CSS for wider input fields on mobile
    styleEl.innerHTML = `
      @media (max-width: 767px) {
        .resume-modal-input, .resume-modal-button {
          width: calc(100% + 48px) !important;
          margin-left: -24px !important;
          margin-right: -24px !important;
          padding-left: 24px !important;
          padding-right: 24px !important;
          box-sizing: border-box !important;
        }
        
        .resume-modal-text {
          width: calc(100% + 48px) !important;
          margin-left: -24px !important;
          margin-right: -24px !important;
          padding-left: 24px !important;
          padding-right: 24px !important;
          box-sizing: border-box !important;
          text-align: left !important;
        }
        
        hr.resume-modal-divider {
          width: calc(100% + 48px) !important;
          margin-left: -24px !important;
          margin-right: -24px !important;
          box-sizing: border-box !important;
        }
        
        .resume-modal-button-container {
          display: flex;
          width: calc(100% + 48px) !important;
          margin-left: -24px !important;
          margin-right: -24px !important;
          padding-left: 24px !important;
          padding-right: 24px !important;
          box-sizing: border-box !important;
          justify-content: space-between;
        }
        
        .resume-modal-button-container button {
          width: 48% !important;
        }
      }
    `;
    
    // Add to document head
    document.head.appendChild(styleEl);
    
    // Clean up on unmount
    return () => {
      const existingStyle = document.getElementById('resume-modal-mobile-styles');
      if (existingStyle) {
        existingStyle.remove();
      }
    };
  }, []);
  const [uploading, setUploading] = React.useState(false);
  const [uploadError, setUploadError] = React.useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = React.useState<string | null>(null);
  const [resumeName, setResumeName] = React.useState('');
  const [isTargeted, setIsTargeted] = React.useState(false);
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [showContactForm, setShowContactForm] = React.useState(false);
  const [savedResumeId, setSavedResumeId] = React.useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // Auto-start upload when file is selected
      await handleUpload(file);
    }
  };

  // Separate upload function to handle file upload
  const handleUpload = async (file: File) => {
    setUploading(true);
    setUploadError(null);
    setUploadedFileName(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      // Include the resumeName if it's already set
      if (resumeName && resumeName.trim() !== '') {
        formData.append('resumeName', resumeName);
      }
      const res = await fetch('/api/resume/upload', {
        method: 'POST',
        body: formData,
      });
      const result = await res.json();
      if (!res.ok || result.error) {
        throw new Error(result.error || 'Upload failed.');
      }
      // Use the backend's storage file name (with timestamp) for all future metadata updates
      setUploadedFileName(result.fileName || result.storageName || file.name);
    } catch (err: any) {
      setUploadError(err.message || 'Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!uploadedFileName) {
      setUploadError('Please upload a resume file first.');
      return;
    }
    
    setUploading(true);
    setUploadError(null);
    
    console.log('Saving resume with:', {
      fileName: uploadedFileName,
      resumeName: resumeName,
      isTargeted: isTargeted
    });
    
    try {
      // Update metadata for the already uploaded file
      const formData = new FormData();
      formData.append('fileName', uploadedFileName);
      if (resumeName) formData.append('resumeName', resumeName);
      formData.append('isTargeted', isTargeted ? 'true' : 'false');
      
      console.log('Updating metadata with isTargeted:', isTargeted);
      
      // Call a new API endpoint to update resume metadata
      const res = await fetch('/api/resume/update-metadata', {
        method: 'POST',
        body: formData,
      });
      
      // If the endpoint doesn't exist yet, fall back to re-uploading
      if (res.status === 404 && selectedFile) {
        // Re-upload with metadata if update endpoint doesn't exist
        const reuploadFormData = new FormData();
        reuploadFormData.append('file', selectedFile);
        if (resumeName) reuploadFormData.append('resumeName', resumeName);
        reuploadFormData.append('isTargeted', isTargeted ? 'true' : 'false');
        
        const reuploadRes = await fetch('/api/resume/upload', {
          method: 'POST',
          body: reuploadFormData,
        });
        
        const reuploadResult = await reuploadRes.json();
        if (!reuploadRes.ok || reuploadResult.error) {
          throw new Error(reuploadResult.error || 'Failed to save resume metadata.');
        }
        // Save the resume ID for the contact form
        setSavedResumeId(reuploadResult.fileName || reuploadResult.storageName || uploadedFileName);
      } else {
        // Process normal response from metadata update endpoint
        const result = await res.json();
        if (!res.ok || result.error) {
          throw new Error(result.error || 'Failed to save resume metadata.');
        }
      }
      
      // Reset state
      setSelectedFile(null);
      setResumeName('');
      setIsTargeted(false);
      setUploadedFileName(null);
      
      // Notify parent component that resume was uploaded
      if (onResumeUploaded) {
        onResumeUploaded();
      }
      
      // Close the modal after saving, do not show contact form
      onClose();
    } catch (err: any) {
      setUploadError(err.message || 'Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  // Handle contact form close
  const handleContactFormClose = () => {
    setShowContactForm(false);
    onClose();
  };


  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-40 px-0.5">
      <div
        className="bg-[#111827] rounded-2xl shadow-lg w-full max-w-lg p-0 relative border border-gray-700 max-h-[90vh] overflow-y-auto mx-0.5"
        style={{ boxShadow: '0 0 16px 0 rgba(37, 99, 235, 0.2)' }}
      >
        <button
          className="absolute right-6 top-6 text-gray-300 hover:text-white text-2xl focus:outline-none"
          onClick={onClose}
          aria-label="Close"
        >
          &times;
        </button>
        <div className="px-8 pt-8 pb-6">
          <h2 className="text-2xl font-bold text-white mb-8">Create a resume</h2>
          <div className="mb-6">
            <label className="block text-gray-400 text-sm mb-2">RESUME NAME *</label>
            <input
              className="w-full rounded-md border border-gray-700 bg-[#1f2937] px-4 py-3 text-white placeholder-gray-400 outline-none focus:ring-1 focus:ring-[#2563eb] focus:border-[#2563eb] resume-modal-input"
              style={{ minHeight: '48px' }}
              placeholder="Enter here..."
              value={resumeName}
              onChange={e => setResumeName(e.target.value)}
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-400 text-sm mb-2">EXPERIENCE</label>
            <select 
              className="w-full rounded-md border border-gray-700 bg-[#1f2937] px-4 py-3 text-white outline-none focus:ring-1 focus:ring-[#2563eb] focus:border-[#2563eb] resume-modal-input"
              style={{ minHeight: '48px' }}
            >
              <option className="bg-[#1f2937] text-gray-400">Select...</option>
              <option className="bg-[#1f2937] text-gray-400">0-1 years</option>
              <option className="bg-[#1f2937] text-gray-400">1-3 years</option>
              <option className="bg-[#1f2937] text-gray-400">3-5 years</option>
              <option className="bg-[#1f2937] text-gray-400">5+ years</option>
            </select>
          </div>
          <div className="mb-6">
            <label className="block text-gray-400 text-sm mb-2">IMPORT YOUR EXISTING RESUME</label>
            <label 
              className="w-full flex justify-between items-center rounded-md border border-gray-700 bg-[#1f2937] px-4 py-3 text-gray-300 hover:bg-[#374151] hover:border-[#2563eb] cursor-pointer resume-modal-input"
              style={{ minHeight: '48px' }}
            >
              <span>Upload PDF, DOCx resume file</span>
              <span className="ml-2">&#8682;</span>
              <input type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={handleFileChange} />
            </label>
            <p className="text-gray-400 text-sm mt-2 resume-modal-text">This process may take up to 60 seconds. Please be patient and keep this page open.</p>
            {uploading && (
              <div className="text-xs text-yellow-300 mt-2 flex items-center gap-2">
                <svg className="animate-spin h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                </svg>
                Uploading...
              </div>
            )}
            {uploadedFileName && !uploading && (
              <div className="text-xs text-green-400 mt-2">Uploaded: {uploadedFileName}</div>
            )}
            {uploadError && !uploading && (
              <div className="text-xs text-red-400 mt-2">{uploadError}</div>
            )}
          </div>
          <hr className="my-6 border-gray-700 resume-modal-divider" />
          <div className="flex items-center mb-2 resume-modal-text">
            <span className="text-white font-semibold text-lg mr-3">Target your resume</span>
            <input type="checkbox" className="toggle toggle-sm" checked={isTargeted} onChange={e => setIsTargeted(e.target.checked)} />
          </div>
          <p className="text-xs text-gray-400 mb-6 resume-modal-text">A targeted resume is a resume tailored to a specific job opening. You have a significantly higher chance of getting an interview when you make it clear you have the experience required for the job.</p>
          <div className="flex justify-between gap-3 mt-8 resume-modal-button-container">
            <button
              className="min-w-[120px] px-6 py-2 rounded-md border border-gray-700 text-white bg-[#1f2937] font-medium hover:bg-[#374151] hover:border-[#2563eb] transition resume-modal-button"
              onClick={onClose}
            >
              CANCEL
            </button>
            <button
              className="min-w-[120px] px-6 py-2 rounded-md border border-gray-700 bg-[#1f2937] text-white font-bold hover:bg-[#374151] hover:border-[#2563eb] transition resume-modal-button"
              type="button"
              onClick={handleSave}
              disabled={uploading}
            >
              {uploading ? 'Saving...' : 'SAVE'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateResumeModal;
