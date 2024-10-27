import React from 'react';

interface ExperienceCardProps {
  title: string;
  company: string;
  period: string;
  location: string;
  description: string;
}

const ExperienceCard = ({ title, company, period, location, description }: ExperienceCardProps) => {
  return (
    <div className="aws-card rounded-lg p-6 hover:border-[var(--aws-orange)] transition-colors">
      <div className="space-y-2">
        <h3 className="text-xl font-semibold text-white">{title}</h3>
        <div className="text-gray-300">
          <p className="font-medium">{company}</p>
          <p className="text-sm">{period} • {location}</p>
        </div>
        <p className="text-gray-300 mt-2">{description}</p>
      </div>
    </div>
  );
};

export default ExperienceCard;