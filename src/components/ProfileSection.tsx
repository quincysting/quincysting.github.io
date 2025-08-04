import React from 'react';
import { Award, Cloud, Database, Boxes, Workflow, GraduationCap, BadgeCheck, MapPin, LucideIcon } from 'lucide-react';

const CertBadge = ({ icon: Icon, count, label }: { icon: LucideIcon, count?: number, label: string }) => (
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
            src="/content/images/profile.jpg"
            alt="Profile"
            className="w-32 h-32 rounded-full border-4 border-[var(--aws-card)] shadow-lg hover-lift object-cover"
          />
          <div className="space-y-4">
            <div className="slide-in">
              <h1 className="text-3xl font-bold text-white">Ian Qin | Australian/Baseline Cleared</h1>
              <p className="text-lg text-gray-300">Multi-Cloud Solutions Architect | DevSecOps | Kubernetes | Terraform, Vault, Consul | Cloud/AI Engineering</p>
              <div className="flex flex-wrap items-center gap-4 mt-2">
                <div className="flex items-center gap-2 text-gray-400">
                  <MapPin className="w-4 h-4" />
                  <span>Sydney, Australia</span>
                </div>
              </div>
            </div>
            <p className="text-gray-300 max-w-2xl slide-in" style={{ animationDelay: '0.2s' }}>
              Energetic, driven, and accomplished Multi-Cloud Solutions Architect with over 20 years of experience delivering complex IT modernization projects across
              Microsoft Azure, AWS, and Google Cloud Platform. Extensive expertise in designing and implementing cloud infrastructure solutions utilizing Cloud Adoption Framework (CAF) and Well-Architected Framework
              (WAF) principles alongside best practices for leading cloud platforms.
            </p>
            <p className="text-gray-300 max-w-2xl slide-in" style={{ animationDelay: '0.25s' }}>
              Certified Professional Solutions Architect across all major cloud providers (Microsoft Azure, AWS, GCP) with deep specialty in cloud architecture,
              DevSecOps, data engineering, and security. Hands-on experience in Cloud [infra, policy, security] as code, DevSecOps, and containerized workloads
              optimized for high-performance computing.
            </p>
            <p className="text-gray-300 max-w-2xl slide-in" style={{ animationDelay: '0.3s' }}>
              Proven track record of leading virtual technical teams, developing relationships with C-level stakeholders, and driving cloud adoption through strategic
              initiatives that bridge business needs with innovative technology solutions. Australian citizen with Baseline Security Clearance, committed to delivering exceptional customer experiences through innovative cloud solutions that drive
              business value.
            </p>
            <div className="slide-in" style={{ animationDelay: '0.35s' }}>
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
                <CertBadge icon={Award} label="TOGAF" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProfileSection;