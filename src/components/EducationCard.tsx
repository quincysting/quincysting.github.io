import React from 'react';

interface EducationCardProps {
  school: string;
  degree: string;
  field: string;
  // period: string;
}

const EducationCard = ({ school, degree, field }: EducationCardProps) => {
  return (
    <div className="aws-card rounded-lg p-6 hover:border-[var(--aws-orange)] transition-colors">
      <div className="space-y-2">
        <h3 className="text-xl font-semibold text-white">{school}</h3>
        <div className="text-gray-300">
          <p>{degree} • {field}</p>
          {/*<p className="text-sm">{period}</p>*/}
        </div>
      </div>
    </div>
  );
};

export default EducationCard;