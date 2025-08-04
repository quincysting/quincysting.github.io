import React from 'react';
import { LucideIcon } from 'lucide-react';

interface EducationCardProps {
  school: string;
  degree: string;
  field: string;
  icon?: LucideIcon;
  // period: string;
}

const EducationCard = ({ school, degree, field, icon: Icon }: EducationCardProps) => {
  return (
    <div className="aws-card rounded-lg p-6 hover:border-[var(--aws-orange)] transition-colors">
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          {Icon && (
            <div className="p-2 bg-[var(--aws-navy)] rounded-lg">
              <Icon className="w-5 h-5 text-[var(--aws-orange)]" />
            </div>
          )}
          <h3 className="text-xl font-semibold text-white">{school}</h3>
        </div>
        <div className="text-gray-300">
          <p>{degree} • {field}</p>
          {/*<p className="text-sm">{period}</p>*/}
        </div>
      </div>
    </div>
  );
};

export default EducationCard;