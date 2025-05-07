'use client';

import { useState } from 'react';
import { useDropzone } from 'react-dropzone';

export default function CoverLetterGenerator() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [resumeText, setResumeText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [generatedLetter, setGeneratedLetter] = useState('');
  const [parsedResume, setParsedResume] = useState<any>(null);

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    maxFiles: 1,
    onDrop: async (acceptedFiles: File[]) => {
      try {
        const file = acceptedFiles[0];
        const text = await file.text();
        setResumeText(text);
        
        // Parse resume with AI
        const parseResponse = await fetch('/api/parse-resume', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ resumeText: text })
        });

        const parseData = await parseResponse.json();
        if (parseData.status === 'success') {
          setParsedResume(parseData.data);
        }
      } catch (err) {
        setError('Failed to parse resume');
      }
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resumeText || !jobDescription) {
      setError('Please upload your resume and provide the job description');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/generate-cover-letter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resumeText,
          jobDescription,
          parsedResume
        }),
      });

      const data = await response.json();
      if (data.status === 'error') {
        throw new Error(data.error);
      }

      setGeneratedLetter(data.coverLetter);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to generate cover letter');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8 text-[#4292FF]">Cover Letter Generator</h1>
      
      <div className="grid md:grid-cols-2 gap-8">
        {/* Input Form */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Upload Resume & Job Description</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Resume Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Upload Your Resume</label>
              <div 
                {...getRootProps()} 
                className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#4292FF] transition-colors cursor-pointer"
              >
                <input {...getInputProps()} />
                <p className="text-gray-600">
                  {resumeText ? 'Resume uploaded!' : 'Drag & drop your resume here, or click to select'}
                </p>
                <p className="text-sm text-gray-500 mt-2">Supported formats: PDF, DOC, DOCX</p>
              </div>
            </div>

            {parsedResume && (
              <div className="bg-gray-50 p-4 rounded-md">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Extracted Information:</h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <p><span className="font-medium">Name:</span> {parsedResume.name}</p>
                  <p><span className="font-medium">Email:</span> {parsedResume.email}</p>
                  <p><span className="font-medium">Phone:</span> {parsedResume.phone}</p>
                  <p><span className="font-medium">Skills:</span> {parsedResume.skills.join(', ')}</p>
                </div>
              </div>
            )}

            {/* Job Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Job Description</label>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4292FF] h-48"
                placeholder="Paste the job description here..."
                required
              />
            </div>

            {error && (
              <div className="text-red-500 text-sm">{error}</div>
            )}

            <button
              type="submit"
              disabled={isLoading || !resumeText || !jobDescription}
              className="w-full bg-[#4292FF] text-white py-3 px-4 rounded-md hover:bg-[#237DFF] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating...
                </>
              ) : (
                'Generate Cover Letter'
              )}
            </button>
          </form>
        </div>

        {/* Generated Letter Preview */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Generated Cover Letter</h2>
          {generatedLetter ? (
            <div className="space-y-4">
              <div className="whitespace-pre-wrap font-serif text-gray-700 p-4 bg-gray-50 rounded-md min-h-[300px]">
                {generatedLetter}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => navigator.clipboard.writeText(generatedLetter)}
                  className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 transition-colors font-medium flex items-center justify-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                    <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                  </svg>
                  Copy
                </button>
                <button
                  onClick={() => {
                    const element = document.createElement('a');
                    const file = new Blob([generatedLetter], {type: 'text/plain'});
                    element.href = URL.createObjectURL(file);
                    element.download = 'cover-letter.txt';
                    document.body.appendChild(element);
                    element.click();
                    document.body.removeChild(element);
                  }}
                  className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 transition-colors font-medium flex items-center justify-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  Download
                </button>
              </div>
            </div>
          ) : (
            <div className="text-gray-500 text-center p-4 bg-gray-50 rounded-md min-h-[300px] flex items-center justify-center">
              Your generated cover letter will appear here
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
