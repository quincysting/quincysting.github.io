import React from 'react';
import ProfileSection from '../components/ProfileSection';
import SummarySection from '../components/SummarySection';
import ExperienceCard from '../components/ExperienceCard';
import EducationCard from '../components/EducationCard';
import CertificateCard from '../components/CertificateCard';
import SkillsSection from '../components/SkillsSection';
import { Building2, GraduationCap, Award, School, Building, BookOpen, Globe } from 'lucide-react';

function Home() {
  return (
    <div className="space-y-8">
      <ProfileSection />

      {/* Personal Sites Section */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Globe className="w-6 h-6 text-[var(--aws-orange)]" />
          <h2 className="text-2xl font-bold text-white">Personal Sites</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <a
            href="https://amazonquick.netlify.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="aws-card rounded-lg p-6 hover:border-[var(--aws-orange)] transition-colors block"
          >
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-white">Amazon Quick</h3>
              <p className="text-gray-300 text-sm">amazonquick.netlify.app</p>
              <span className="inline-block mt-2 text-[var(--aws-orange)] hover:text-[#ffb84d]">
                Visit Site →
              </span>
            </div>
          </a>
          <a
            href="https://cloudformationstack.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="aws-card rounded-lg p-6 hover:border-[var(--aws-orange)] transition-colors block"
          >
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-white">CloudFormation Stack</h3>
              <p className="text-gray-300 text-sm">cloudformationstack.com</p>
              <span className="inline-block mt-2 text-[var(--aws-orange)] hover:text-[#ffb84d]">
                Visit Site →
              </span>
            </div>
          </a>
        </div>
      </section>

      <SummarySection />
      <SkillsSection />

      {/* Experience Section */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Building2 className="w-6 h-6 text-[var(--aws-orange)]" />
          <h2 className="text-2xl font-bold text-white">Experience</h2>
        </div>
        <div className="space-y-6">
          <ExperienceCard
            title="Senior Manager - Senior Engineering Lead"
            company="Deloitte Australia"
            period="01/2026 - Present"
            location="Sydney, Australia"
            description="Senior Engineering Lead on the Macquarie Bank account, driving the Data Platform Uplift program across analytics modernization, data governance, and platform engineering in a regulated financial services environment. Architecting enterprise analytics integrating Amazon Quick Suite (QuickSight) with an open data lake built on Amazon S3, Apache Iceberg, AWS Lake Formation, and Redshift Serverless, with multi-region, APRA-aligned (CPS 230/234) data sovereignty and governance controls. Technology stack: Amazon Quick Suite (QuickSight), Amazon Redshift Serverless, AWS Glue, AWS Lake Formation, Amazon S3, Apache Iceberg, IAM Identity Center, Terraform, Python."
          />
          <ExperienceCard
            title="Principal Cloud Architect"
            company="NCS Group Australia"
            period="01/2023 - 01/2026"
            location="Sydney, Australia"
            description="Spearhead cloud engineering efforts, designing cutting-edge cloud solutions customized for telecommunications and government sectors, driving innovation and delivering tailored architectures to meet complex client requirements. Technology stack: AWS, Azure, GCP, Kubernetes, service mesh, Docker, Hashicorp stack, Jenkins, Azure DevOps, Gitlab, Prisma Cloud, MS Defender, Nexus, SonarQube, Camunda, Shell, Python."
          />
          <ExperienceCard
            title="Cloud Architect/Senior Manager, Cloud First"
            company="Accenture"
            period="01/2022 - 12/2022"
            location="Sydney, Australia"
            description="SRE/Cloud Solutions Architect at Coles Group account, focused on Azure infrastructure build, optimization and operational excellence. Technology stack: Azure iPaaS, APIM, Boomi iPaaS, AKS, Azure DevOps, ArgoCD, Terraform, Spring Boot, ServiceNow, Shell, Python."
          />
          <ExperienceCard
            title="Cloud Architect/DevOps SME"
            company="Wipro Limited"
            period="11/2019 - 01/2022"
            location="Sydney, Australia"
            description="Led Cloud automation, site reliability engineering, and DevSecOps initiatives for the Woolworths Group account, focusing on Azure/GCP hybrid cloud implementation. Technology stack: Azure/GCP, Azure DevOps, Ansible Tower, Terraform Enterprise, Jfrog, ArgoCD, Docker, HashiCorp Vault/Consul, Cloudability, Shell, Python, ServiceNow."
          />
          <ExperienceCard
            title="Enterprise Solutions Architect"
            company="Mobility Asia - Volkswagen Group"
            period="02/2017 - 09/2019"
            location="Beijing/Wolfsburg"
            description="Automotive Cloud (parking, charging, navigation, voice, payment) product design, Cloud engineering and end-to-end delivery. Led 20-member engineering team to design and implement cloud-native platform for Volkswagen's connected car services."
          />
          <ExperienceCard
            title="Senior Solutions Architect"
            company="Intel"
            period="11/2015 - 02/2017"
            location="Beijing/Santa Clara"
            description="Technical Architect at Industry Sales Group, driving Intel services-oriented Cloud solutions adoption in finance, government and automotive sectors. Led technical team in designing and implementing proof-of-concept deployments for SDS/SDN solutions across 4 enterprise clients."
          />
          <ExperienceCard
            title="IT Engineer → IT Ops Manager"
            company="Boeing"
            period="05/2008 - 09/2013"
            location="Melbourne/Singapore/Beijing"
            description="Boeing Commercial Airplanes (BCA) IT infrastructure modernization and integration in the APAC region. Led virtual technical teams across 5 APAC countries, delivering 3 multi-million dollar IT initiatives 15% under budget."
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
            school="New York University Stern School of Business"
            degree="Master of Business Administration (joint degree with MBS)"
            field="Financial management, quantitative analytics, decision science, professional consulting and analytics conducted by McKinsey and Bain & Company"
            icon={School}
            // period="2014 - 2018"
          />
          <EducationCard
            school="University of Melbourne, Melbourne Business School"
            degree="Master of Business Administration"
            field="First class honours, focusing on strategy, finance, operation and business analytics"
            icon={Building}
            // period="2014 - 2018"
          />
          <EducationCard
            school="Monash University"
            degree="B.Sc. of Computer Science"
            field="Mathematics, Algorithms and Object-Oriented Programming with C and Pascal"
            icon={BookOpen}
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
            title="AWS Certified Generative AI Developer – Professional"
            issuer="Amazon Web Services (AWS)"
            date="April 18, 2026"
            credlyLink="https://www.credly.com/badges/80b66a68-14fc-4aae-b7bd-619e327df473/public_url"
          />
          <CertificateCard
            title="AWS Certified Machine Learning Engineer – Associate"
            issuer="Amazon Web Services (AWS)"
            date="January 05, 2025"
            credlyLink="https://www.credly.com/badges/8e35b88f-dac2-46a7-841c-df60a500c24c"
          />
          <CertificateCard
            title="AWS Certified Developer – Associate"
            issuer="Amazon Web Services (AWS)"
            date="December 12, 2024"
            credlyLink="https://www.credly.com/badges/c290b6a9-1136-41f7-9012-8231ecea8fd4"
          />
          <CertificateCard
            title="AWS Certified AI Practitioner"
            issuer="Amazon Web Services (AWS)"
            date="November 09, 2024"
            credlyLink="https://www.credly.com/badges/1fc6867e-c00c-4cb5-9603-92cbc0b7b715"
          />
          <CertificateCard
            title="AWS Certified Cloud Practitioner"
            issuer="Amazon Web Services (AWS)"
            date="October 14, 2024"
            credlyLink="https://www.credly.com/badges/8f46aba7-a95e-4f77-9884-9dd632c42149"
          />
          <CertificateCard
            title="AWS Certified Data Engineer – Associate"
            issuer="Amazon Web Services (AWS)"
            date="September 29, 2024"
            credlyLink="https://www.credly.com/badges/77c713f6-c937-4485-9667-81ab244e9374"
          />
          <CertificateCard
            title="AWS Certified Machine Learning – Specialty"
            issuer="Amazon Web Services (AWS)"
            date="August 04, 2024"
            credlyLink="https://www.credly.com/badges/a28f052f-0b53-4347-818d-6f7890c4f9a9"
          />
          <CertificateCard
            title="AWS Certified Database – Specialty"
            issuer="Amazon Web Services (AWS)"
            date="April 14, 2024"
            credlyLink="https://www.credly.com/badges/1b0520c1-1119-4403-87e6-f991f1f463e4"
          />
          <CertificateCard
            title="AWS Certified: SAP on AWS – Specialty"
            issuer="Amazon Web Services (AWS)"
            date="March 09, 2024"
            credlyLink="https://www.credly.com/badges/51efb076-c394-45e5-86ed-7d7342009e35"
          />
          <CertificateCard
            title="AWS Certified Advanced Networking – Specialty"
            issuer="Amazon Web Services (AWS)"
            date="August 05, 2023"
            credlyLink="https://www.credly.com/badges/584e6486-e355-4151-be38-3ba792a3eeef"
          />
          <CertificateCard
            title="AWS Certified DevOps Engineer – Professional"
            issuer="Amazon Web Services (AWS)"
            date="October 17, 2020"
            credlyLink="https://www.credly.com/badges/6f80427b-cbfd-44aa-ac0c-3d965caa81d2"
          />
          <CertificateCard
            title="AWS Certified SysOps Administrator – Associate"
            issuer="Amazon Web Services (AWS)"
            date="September 29, 2020"
            credlyLink="https://www.credly.com/badges/94926819-6f87-4584-9f11-73d947e7ca93"
          />
          <CertificateCard
            title="AWS Certified Data Analytics – Specialty"
            issuer="Amazon Web Services (AWS)"
            date="September 19, 2020"
            credlyLink="https://www.credly.com/badges/f0da10f4-189c-44f5-bdb0-aa2ffa3be42b"
          />
          <CertificateCard
            title="AWS Certified Security – Specialty"
            issuer="Amazon Web Services (AWS)"
            date="September 12, 2020"
            credlyLink="https://www.credly.com/badges/a0928d03-33b6-4543-b61c-32e852f56a31"
          />
          <CertificateCard
            title="AWS Certified Solutions Architect – Professional"
            issuer="Amazon Web Services (AWS)"
            date="July 02, 2020"
            credlyLink="https://www.credly.com/badges/2247d42b-9c09-4d2f-bc42-f4dd30867654"
          />
          <CertificateCard
            title="AWS Certified Solutions Architect – Associate"
            issuer="Amazon Web Services (AWS)"
            date="May 27, 2020"
            credlyLink="https://www.credly.com/badges/2398dc68-86b1-4eb5-b45f-447cd84f2e0f"
          />
        </div>
      </section>
    </div>
  );
}

export default Home;