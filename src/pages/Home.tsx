import React from 'react';
import ProfileSection from '../components/ProfileSection';
import SummarySection from '../components/SummarySection';
import ExperienceCard from '../components/ExperienceCard';
import EducationCard from '../components/EducationCard';
import CertificateCard from '../components/CertificateCard';
import { Building2, GraduationCap, Award } from 'lucide-react';

function Home() {
  return (
    <div className="space-y-8">
      <ProfileSection />
      <SummarySection />

      {/* Experience Section */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Building2 className="w-6 h-6 text-[var(--aws-orange)]" />
          <h2 className="text-2xl font-bold text-white">Experience</h2>
        </div>
        <div className="space-y-6">
          <ExperienceCard
            title="Principal Cloud Solutions Architect"
            company="NCS Group Australia"
            period="2023 - Present"
            location="Sydney, Australia"
            description="Working on multi-cloud projects delivery for a large telco."
          />
          <ExperienceCard
            title="Cloud Solutions Architect"
            company="Accenture Australia"
            period="2021 - 2023"
            location="Sydney Australia"
            description="Solutions Architect at Coles Group account, developing cloud solutions for a large fulfilment automation project, solving APIs integration puzzle, driving microservices architecture design, managing nonfunctional requirements and operation observability."
          />
          <ExperienceCard
            title="Cloud Solutions Architect"
            company="Wipro Australia"
            period="2019 - 2021"
            location="Sydney Australia"
            description="Multi-Cloud Automation/DevSecOps Lead at Woolworths Group account, SME for automation toolchain including HashiCorp Terraform, Vault and Consul, Ansible Tower, Azure DevOps, JFrog, Github, Kubernetes/Docker/Helm."
          />
        </div>
      </section>

      {/* Education Section */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <GraduationCap className="w-6 h-6 text-[var(--aws-orange)]" />
          <h2 className="text-2xl font-bold text-white">Education</h2>
        </div>
        <div className="space-y-6">
          <EducationCard
            school="Monash University"
            degree="Bachelor of Computer Science"
            field="Software Engineering"
            // period="2014 - 2018"
          />
        </div>
      </section>

      {/* Certificates Section */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Award className="w-6 h-6 text-[var(--aws-orange)]" />
          <h2 className="text-2xl font-bold text-white">Certifications</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <CertificateCard
            title="AWS Certified Solutions Architect – Professional"
            issuer="Amazon Web Services (AWS)"
            date="Feb 2024"
            credlyLink="https://www.credly.com/badges/c0c0c5c4-2c7c-4f7c-9c7c-c1c9c1c9c1c9"
          />
          <CertificateCard
            title="AWS Certified DevOps Engineer – Professional"
            issuer="Amazon Web Services (AWS)"
            date="Jan 2024"
            credlyLink="https://www.credly.com/badges/7c7c7c7c-7c7c-7c7c-7c7c-7c7c7c7c7c7c"
          />
          <CertificateCard
            title="AWS Certified Solutions Architect – Associate"
            issuer="Amazon Web Services (AWS)"
            date="Aug 2023"
            credlyLink="https://www.credly.com/badges/4c4c4c4c-4c4c-4c4c-4c4c-4c4c4c4c4c4c"
          />
          <CertificateCard
            title="AWS Certified Developer – Associate"
            issuer="Amazon Web Services (AWS)"
            date="Sep 2023"
            credlyLink="https://www.credly.com/badges/5c5c5c5c-5c5c-5c5c-5c5c-5c5c5c5c5c5c"
          />
        </div>
      </section>
    </div>
  );
}

export default Home;