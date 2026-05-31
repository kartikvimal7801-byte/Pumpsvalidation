import React from 'react';

interface HavellsLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const HavellsLogo: React.FC<HavellsLogoProps> = ({ 
  className = '', 
  size = 'md' 
}) => {
  const sizeClasses = {
    sm: 'w-20 h-16',
    md: 'w-24 h-20',
    lg: 'w-32 h-24',
  };

  return (
    <div className={`flex justify-center ${className}`}>
      <div className={`${sizeClasses[size]} flex flex-col items-center justify-center`}>
        {/* Havells H Symbol */}
        <div className="mb-2">
          <svg
            viewBox="0 0 120 120"
            className="w-16 h-16"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Main H shape with curves */}
            <path
              d="M60 10 C85 10, 105 30, 105 55 C105 70, 95 80, 85 85 L85 95 C95 100, 105 110, 105 125 L75 125 C75 115, 70 110, 60 110 C50 110, 45 115, 45 125 L15 125 C15 110, 25 100, 35 95 L35 85 C25 80, 15 70, 15 55 C15 30, 35 10, 60 10 Z"
              fill="#E53E3E"
            />
            
            {/* Inner white curves for the H */}
            <ellipse cx="35" cy="40" rx="8" ry="12" fill="white" transform="rotate(-20 35 40)" />
            <ellipse cx="85" cy="40" rx="8" ry="12" fill="white" transform="rotate(20 85 40)" />
            <ellipse cx="35" cy="95" rx="6" ry="8" fill="white" transform="rotate(-15 35 95)" />
            <ellipse cx="85" cy="95" rx="6" ry="8" fill="white" transform="rotate(15 85 95)" />
          </svg>
        </div>
        
        {/* HAVELLS Text */}
        <div className="text-center">
          <svg
            viewBox="0 0 200 40"
            className="w-full h-6"
            xmlns="http://www.w3.org/2000/svg"
          >
            <text
              x="100"
              y="30"
              textAnchor="middle"
              className="fill-red-600 font-bold text-lg"
              style={{ fontFamily: 'Arial Black, sans-serif', fontSize: '24px', fontWeight: 'bold' }}
            >
              HAVELLS
            </text>
          </svg>
        </div>
      </div>
    </div>
  );
};