import React from 'react';
import { Award, Cloud, Database, Boxes, Workflow, GraduationCap, BadgeCheck } from 'lucide-react';

const CertBadge = ({ icon: Icon, count, label }: { icon: any, count?: number, label: string }) => (
  <div className="flex items-center gap-2 bg-[var(--aws-navy)] rounded-lg px-3 py-2 hover-lift">
    <Icon className="w-4 h-4 text-[var(--aws-orange)]" />
    <span className="font-medium text-gray-300">
      {label}{count ? ` (${count})` : ''}
    </span>
  </div>
);

const ProfileSection = () => {
  return (
    <section className="aws-card rounded-lg overflow-hidden fade-in">
      <div className="aws-gradient h-32"></div>
      <div className="px-6 py-6 -mt-16">
        <div className="flex flex-col md:flex-row gap-6">
          <img
            src="/content/images/profile.JPG"
            alt="Profile"
            className="w-32 h-32 rounded-full border-4 border-[var(--aws-card)] shadow-lg hover-lift object-cover"
          />
          <div className="space-y-4">
            <div className="slide-in">
              <h1 className="text-3xl font-bold text-white">Ian Qin</h1>
              <p className="text-lg text-gray-300">Senior Software Engineer at Atlassian</p>
            </div>
            <p className="text-gray-300 max-w-2xl slide-in" style={{ animationDelay: '0.2s' }}>
              Passionate software engineer with expertise in cloud technologies and distributed systems.
              Focused on building scalable solutions and mentoring teams for success.
            </p>
            <div className="slide-in" style={{ animationDelay: '0.3s' }}>
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-[var(--aws-orange)]" />
                <h3 className="text-lg font-semibold text-white">Certifications</h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 mt-3 stagger-children">
                <CertBadge icon={Cloud} count={15} label="AWS" />
                <CertBadge icon={Cloud} count={9} label="Azure" />
                <CertBadge icon={Cloud} count={6} label="GCP" />
                <CertBadge icon={Boxes} count={3} label="Kubernetes" />
                <CertBadge icon={Database} count={3} label="HashiCorp" />
                <CertBadge icon={GraduationCap} label="MBA" />
                <CertBadge icon={Workflow} label="PMI-PMP/ACP" />
                <CertBadge icon={BadgeCheck} label="CSM/CSPO" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProfileSection;