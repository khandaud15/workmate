import React from 'react';

interface ScoreIndicatorProps {
  score: number;
  maxScore?: number;
  size?: number;
  strokeWidth?: number;
  primaryColor?: string;
  backgroundColor?: string;
  label?: string;
  description?: string;
}

const ScoreIndicator: React.FC<ScoreIndicatorProps> = ({
  score,
  maxScore = 100,
  size = 60, // Reduced from 80 to 60
  strokeWidth = 6, // Reduced from 8 to 6
  primaryColor = '#FFC107', // Amber color like in the screenshot
  backgroundColor = '#1e2d3d',
  label = 'Your Rezi Score',
  description = 'Needs improvement'
}) => {
  // Calculate the percentage and the SVG parameters
  const percentage = Math.min(100, Math.max(0, (score / maxScore) * 100));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  
  // Center position
  const center = size / 2;

  return (
    <div className="flex items-center">
      <div className="relative" style={{ width: size, height: size }}>
        {/* Background circle */}
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="rotate-[-90deg]">
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="transparent"
            stroke={backgroundColor}
            strokeWidth={strokeWidth}
          />
          {/* Progress circle */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="transparent"
            stroke={primaryColor}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </svg>
        {/* Score text in the center */}
        <div 
          className="absolute inset-0 flex items-center justify-center text-white font-bold"
          style={{ fontSize: size * 0.35 }}
        >
          {score}
        </div>
      </div>
      
      {/* Label and description */}
      <div className="ml-4">
        <h3 className="text-white text-xl font-medium">{label}</h3>
        <p className="text-gray-300">{description}</p>
      </div>
    </div>
  );
};

export default ScoreIndicator;
