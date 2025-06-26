"use client";
import React from "react";

interface Category {
  name: string;
  score: number;
  color: string;
}

interface Issue {
  type: string;
  message: string;
  detail?: string;
  relatedExperiences?: string[];
}

interface ScoreAnalysis {
  summary: string;
  overallScore: number;
  categories: Category[];
  issues: Issue[];
}

interface ResumeScoreInsightsModalProps {
  open: boolean;
  onClose: () => void;
  isLoading: boolean;
  error?: string | null;
  scoreAnalysis?: ScoreAnalysis | null;
  resumeName?: string;
  experiences?: any[];
  handleSelectExperience?: (exp: any) => void;
  resumeId?: string;
}

const ResumeScoreInsightsModal: React.FC<ResumeScoreInsightsModalProps> = ({
  open,
  onClose,
  isLoading,
  error,
  scoreAnalysis,
  resumeName,
  experiences = [],
  handleSelectExperience,
  resumeId,
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-1 sm:p-6">
      <div className="px-2 sm:px-11 py-6 bg-[#0d1b2a] border border-[#1e2d3d] rounded-lg shadow-lg max-w-5xl w-full text-white relative overflow-y-auto max-h-[90vh]">
        <div className="flex justify-between items-center relative mb-4">
          <div className="absolute left-0" />
          <h2 className="text-2xl font-bold mx-auto">Talexus Score</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl absolute right-0"
            aria-label="Close"
          >
            &times;
          </button>
        </div>
        {isLoading ? (
          <div className="text-center py-8">
            <p className="text-lg">Analyzing your resume against the job description...</p>
            <p className="text-sm text-gray-400 mt-2">This may take a moment. We're providing real-time, GPT-powered feedback.</p>
          </div>
        ) : error ? (
          <div className="text-center py-8 text-red-400">
            <p className="font-bold text-lg">Analysis Failed</p>
            <p className="mt-2">{error}</p>
          </div>
        ) : scoreAnalysis ? (
          <div>
            {/* Summary */}
            <div className="mb-4 p-3 bg-[#0d1b2a] border border-[#1e2d3d] rounded-lg">
              <p className="text-center text-sm">{scoreAnalysis.summary}</p>
            </div>
            {/* Score & Comparison */}
            <div className="flex flex-col md:flex-row gap-6 mb-6 [&>div]:h-[220px] md:[&>div]:h-auto">
              {/* Score gauge */}
              <div className="flex-1 border border-[#1e2d3d] rounded-lg p-5">
                <p className="text-sm text-gray-400 mb-1">{resumeName || "Your Resume"}</p>
                <div className="flex justify-center items-center h-32 relative">
                  <div className="relative w-28 h-28">
                    <svg viewBox="0 0 70 70" className="w-full h-full">
                      <path d="M 35,35 m 0,-30 a 30,30 0 1 1 0,60 a 30,30 0 1 1 0,-60" stroke="#333" strokeWidth={10} fill="none" />
                      <path
                        d="M 35,35 m 0,-30 a 30,30 0 1 1 0,60 a 30,30 0 1 1 0,-60"
                        stroke={scoreAnalysis.overallScore < 40 ? "#f44336" : scoreAnalysis.overallScore < 70 ? "#ffa726" : "#4caf50"}
                        strokeWidth={10}
                        strokeDasharray={`${scoreAnalysis.overallScore * 2.1}, 210`}
                        fill="none"
                      />
                      <circle
                        cx={35 + 30 * Math.cos(((scoreAnalysis.overallScore || 0) / 100 * 360 - 90) * Math.PI / 180)}
                        cy={35 + 30 * Math.sin(((scoreAnalysis.overallScore || 0) / 100 * 360 - 90) * Math.PI / 180)}
                        r="2"
                        fill="#fff"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-3xl font-bold">{scoreAnalysis.overallScore}</span>
                    </div>
                  </div>
                </div>
                <div className="flex justify-between text-xs text-gray-400 mt-2">
                  <span>0</span>
                  <span>100</span>
                </div>
              </div>
              {/* Comparison chart */}
              <div className="flex-1 border border-[#1e2d3d] rounded-lg p-3 h-[240px] md:h-auto">
                <h3 className="text-lg font-bold mb-1">How You Compare</h3>
                <p className="text-sm text-gray-400 mb-2">See how your resume compares to others.</p>
                <div className="h-32 flex items-end">
                  <div className="w-full h-28 flex items-end">
                    {Array.from({ length: 20 }).map((_, i) => {
                      const midPoint = 10;
                      const distance = Math.abs(i - midPoint);
                      let height = 80 - distance * 4;
                      height = Math.max(20, height);
                      const score = scoreAnalysis.overallScore || 0;
                      const barMinValue = i * 5;
                      const barMaxValue = barMinValue + 4;
                      const isUserScore = (score >= barMinValue && score <= barMaxValue) || (score === 100 && i === 19);
                      let barColor = "bg-gray-600";
                      if (isUserScore) barColor = "bg-[#ffa726]";
                      return (
                        <div key={i} className={`flex-1 mx-px ${barColor}`} style={{ height: `${height}%` }} />
                      );
                    })}
                  </div>
                </div>
                <div className="flex text-xs text-gray-400 mt-4 relative w-full h-6 border-t border-[#1e2d3d] pt-2">
                  <span className="absolute left-0 bg-[#0d1b2a] px-1">0</span>
                  <span className="absolute bg-[#0d1b2a] px-1" style={{ left: "20%", transform: "translateX(-50%)" }}>20</span>
                  <span className="absolute bg-[#0d1b2a] px-1" style={{ left: "40%", transform: "translateX(-50%)" }}>40</span>
                  <span className="absolute bg-[#0d1b2a] px-1" style={{ left: "60%", transform: "translateX(-50%)" }}>60</span>
                  <span className="absolute bg-[#0d1b2a] px-1" style={{ left: "80%", transform: "translateX(-50%)" }}>80</span>
                  <span className="absolute right-0 bg-[#0d1b2a] px-1">100</span>
                </div>
              </div>
            </div>
            {/* Improvements */}
            <div className="mt-8">
              <h3 className="text-2xl font-bold mb-4">Improvements</h3>
              <p className="text-base text-gray-400 mb-5">Improve your Talexus Score by making the suggested adjustments in each category.</p>
              <div className="flex flex-row overflow-x-auto sm:overflow-x-visible pb-4 mb-8 justify-between w-full gap-4 sm:gap-2 px-1 sm:px-0 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
                {scoreAnalysis.categories.map(cat => (
                  <div key={cat.name} className="flex flex-col items-center flex-shrink-0">
                    <div className="relative w-12 h-12 mb-1">
                      <svg viewBox="0 0 100 100" className="w-full h-full">
                        <circle cx="50" cy="50" r="45" fill="none" stroke="#333" strokeWidth={10} />
                        <circle
                          cx="50"
                          cy="50"
                          r="45"
                          fill="none"
                          stroke={cat.color}
                          strokeWidth={10}
                          strokeDasharray={`${cat.score * 2.83}, 283`}
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xs font-bold">{cat.score}</span>
                      </div>
                    </div>
                    <span className="text-xs text-center">{cat.name}</span>
                  </div>
                ))}
              </div>
              {/* Issues */}
              {scoreAnalysis.issues && scoreAnalysis.issues.length > 0 && (
                <div className="space-y-8">
                  {scoreAnalysis.issues.map((issue, index) => (
                    <div key={index} className="border-b border-[#1e2d3d] pb-6 last:border-0">
                      <div className="flex items-start gap-2">
                        <div className={`mt-1 flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${issue.type === 'error' ? 'bg-red-500' : issue.type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'}`}>{issue.type === 'error' ? '!' : issue.type === 'warning' ? '!' : 'i'}</div>
                        <div>
                          <p
                            className="font-semibold cursor-pointer hover:text-blue-400 transition-colors"
                            onClick={() => {
                              if (issue.relatedExperiences && issue.relatedExperiences.length > 0 && handleSelectExperience) {
                                const targetExp = experiences.find(exp =>
                                  issue.relatedExperiences?.includes(exp.employer) ||
                                  issue.relatedExperiences?.includes(exp.role)
                                );
                                if (targetExp) {
                                  handleSelectExperience(targetExp);
                                  document.getElementById('experience-section')?.scrollIntoView({ behavior: 'smooth' });
                                }
                              } else if (issue.message.toLowerCase().includes('education') && resumeId) {
                                window.location.href = `/dashboard/resume/${resumeId}/education`;
                              } else if (issue.message.toLowerCase().includes('skill') && resumeId) {
                                window.location.href = `/dashboard/resume/${resumeId}/skills`;
                              }
                            }}
                          >
                            {issue.message}
                          </p>
                          {issue.detail && <p className="text-sm text-gray-400 mt-1">{issue.detail}</p>}
                          {issue.relatedExperiences && issue.relatedExperiences.length > 0 && (
                            <div className="mt-2 text-sm">
                              {issue.relatedExperiences.map((exp, i) => {
                                const matchingExp = experiences.find(experience =>
                                  experience.employer === exp ||
                                  experience.role === exp
                                );
                                return (
                                  <p
                                    key={i}
                                    className="text-blue-400 cursor-pointer hover:underline"
                                    onClick={() => {
                                      if (matchingExp && handleSelectExperience) {
                                        handleSelectExperience(matchingExp);
                                      }
                                    }}
                                  >
                                    {exp}
                                  </p>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p>No analysis available. Click the score indicator to fetch analysis.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResumeScoreInsightsModal;
