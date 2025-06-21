import React from 'react';
import { FaTimes, FaExclamationCircle, FaCheckCircle } from 'react-icons/fa';

interface ScoreCategory {
  name: string;
  score: number;
  color: string;
}

interface ScoreIssue {
  type: 'warning' | 'error' | 'info';
  message: string;
  detail: string;
  relatedExperiences?: string[];
}

interface ResumeScoreInsightsProps {
  isOpen: boolean;
  onClose: () => void;
  resumeName: string;
  overallScore: number;
  categories: ScoreCategory[];
  issues: ScoreIssue[];
  summary?: string;
}

const ResumeScoreInsights: React.FC<ResumeScoreInsightsProps> = ({
  isOpen,
  onClose,
  resumeName,
  overallScore,
  summary,
  categories,
  issues
}) => {
  if (!isOpen) return null;

  // Calculate the position for the score marker on the distribution chart
  const scorePosition = `${Math.min(100, Math.max(0, overallScore))}%`;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
      <div className="bg-[#0d1b2a] border border-[#1e2d3d] rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center border-b border-[#1e2d3d] p-4">
          <h2 className="text-xl font-bold text-white">Talexus Score</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <FaTimes size={20} />
          </button>
        </div>
        
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4 [&>div]:h-[240px] md:[&>div]:h-auto">
          {/* Left column - Score and gauge */}
          <div className="border border-[#1e2d3d] rounded-lg p-3 w-full">
            <p className="text-gray-400 mb-2">[Targeted] {resumeName}</p>
            
            {/* Circular gauge */}
            <div className="flex flex-col items-center justify-center">
              <div className="relative w-28 h-28">
                {/* Semi-circle background */}
                <div className="absolute inset-0">
                  <svg viewBox="0 0 100 50" className="w-full">
                    {/* Red section (0-30) */}
                    <path 
                      d="M 10,50 A 40,40 0 0,1 35,15" 
                      fill="none" 
                      stroke="#f44336" 
                      strokeWidth="8"
                    />
                    {/* Yellow section (30-70) */}
                    <path 
                      d="M 35,15 A 40,40 0 0,1 65,15" 
                      fill="none" 
                      stroke="#FFC107" 
                      strokeWidth="8"
                    />
                    {/* Green section (70-100) */}
                    <path 
                      d="M 65,15 A 40,40 0 0,1 90,50" 
                      fill="none" 
                      stroke="#4caf50" 
                      strokeWidth="8"
                    />
                    
                    {/* Score marker */}
                    <circle 
                      cx={10 + (80 * (overallScore / 100))} 
                      cy={50 - Math.sin(Math.PI * (overallScore / 100)) * 40} 
                      r="4" 
                      fill="#fff" 
                    />
                  </svg>
                </div>
                
                {/* Score text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-5xl font-bold text-white">{overallScore}</span>
                  <span className="text-gray-400 text-sm">Needs improvement</span>
                </div>
              </div>
              
              {/* Scale labels */}
              <div className="flex justify-between w-full mt-2">
                <span className="text-gray-400">0</span>
                <span className="text-gray-400">100</span>
              </div>
              
              {/* Summary text in fixed container */}
              <div className="mt-2 max-w-[300px] mx-auto text-center h-[50px] overflow-hidden">
                <p className="text-sm text-gray-300 line-clamp-2">{summary || "Strong resume with relevant skills highlighted."}</p>
              </div>
            </div>
          </div>
          
          {/* Right column - Distribution chart */}
          <div className="border border-[#1e2d3d] rounded-lg p-3">
            <h3 className="text-white text-lg mb-2">How You Compare</h3>
            <p className="text-gray-400 text-sm mb-2">See how your resume compares to others.</p>
            
            {/* Distribution chart */}
            <div className="h-24 relative mb-3">
              {/* Bar chart background */}
              <div className="absolute inset-0 flex items-end">
                {[...Array(40)].map((_, i) => {
                  // Create a bell curve-like distribution
                  const height = 30 + Math.sin(Math.PI * (i / 40)) * 70;
                  const barColor = i < 12 ? 'bg-gray-600' : 
                                  i < 36 ? 'bg-gray-500' : 'bg-gray-400';
                  return (
                    <div 
                      key={i} 
                      className={`w-1 mx-[1px] ${barColor}`} 
                      style={{ height: `${height}%` }}
                    ></div>
                  );
                })}
              </div>
              
              {/* Score marker */}
              <div 
                className="absolute bottom-0 w-0.5 bg-amber-500 h-full"
                style={{ left: scorePosition }}
              ></div>
            </div>
            
            {/* Scale labels */}
            <div className="flex justify-between">
              <span className="text-gray-400">0</span>
              <span className="text-gray-400">30</span>
              <span className="text-gray-400">60</span>
              <span className="text-gray-400">90</span>
              <span className="text-gray-400">100</span>
            </div>
          </div>
        </div>
        
        {/* Improvements section */}
        <div className="p-4 border-t border-[#1e2d3d]">
          <h3 className="text-xl font-bold text-white mb-2">Improvements</h3>
          <p className="text-gray-400 mb-3">Improve your Talexus Score by making the suggested adjustments in each category.</p>
          
          {/* Category scores */}
          <div className="flex flex-row overflow-x-auto pb-2 mb-4 hide-scrollbar justify-between w-full">
            {categories.map((category) => (
              <div key={category.name} className="flex flex-col items-center flex-shrink-0">
                <div className="relative w-14 h-14 mb-1">
                  <svg viewBox="0 0 36 36" className="w-full">
                    {/* Background circle */}
                    <circle 
                      cx="18" 
                      cy="18" 
                      r="15" 
                      fill="none" 
                      stroke="#1e2d3d" 
                      strokeWidth="3"
                    />
                    {/* Progress circle */}
                    <circle 
                      cx="18" 
                      cy="18" 
                      r="15" 
                      fill="none" 
                      stroke={category.color} 
                      strokeWidth="3"
                      strokeDasharray={`${category.score * 0.94} 100`}
                      strokeDashoffset="0"
                      transform="rotate(-90 18 18)"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-white font-bold">{category.score}</span>
                  </div>
                </div>
                <span className="text-white text-center text-sm">{category.name}</span>
              </div>
            ))}
          </div>
          
          {/* Issues list */}
          <div className="space-y-3">
            {issues.map((issue, index) => (
              <div key={index} className="border-b border-[#1e2d3d] pb-3 last:border-b-0">
                <div className="flex items-start gap-3">
                  <div className={`mt-1 ${issue.type === 'error' ? 'text-red-500' : issue.type === 'warning' ? 'text-amber-500' : 'text-blue-500'}`}>
                    {issue.type === 'error' ? <FaExclamationCircle size={18} /> : 
                     issue.type === 'warning' ? <FaExclamationCircle size={18} /> : 
                     <FaCheckCircle size={18} />}
                  </div>
                  <div>
                    <p className="text-white font-medium">{issue.message}</p>
                    <p className="text-gray-400 text-sm mt-1">{issue.detail}</p>
                    
                    {issue.relatedExperiences && issue.relatedExperiences.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {issue.relatedExperiences.map((exp, i) => (
                          <div key={i} className="text-blue-400 text-sm">{exp}</div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeScoreInsights;
