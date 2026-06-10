import React from 'react';
import { Code2, Cloud, Database, Shield, Terminal, Briefcase, LucideIcon } from 'lucide-react';

interface SkillCategoryProps {
  icon: LucideIcon;
  title: string;
  skills: string[];
}

const SkillCategory = ({ icon: Icon, title, skills }: SkillCategoryProps) => (
  <div className="aws-card rounded-lg p-6">
    <div className="flex items-center gap-3 mb-4">
      <div className="p-2 bg-[var(--aws-navy)] rounded-lg">
        <Icon className="w-5 h-5 text-[var(--aws-orange)]" />
      </div>
      <h3 className="text-lg font-semibold text-white">{title}</h3>
    </div>
    <div className="flex flex-wrap gap-2">
      {skills.map((skill, index) => (
        <span
          key={index}
          className="px-3 py-1 bg-[var(--aws-navy)] text-gray-300 rounded-full text-sm hover:bg-[var(--aws-orange)] hover:text-white transition-colors"
        >
          {skill}
        </span>
      ))}
    </div>
  </div>
);

const SkillsSection = () => {
  const skillCategories = [
    {
      icon: Cloud,
      title: 'Cloud Platforms',
      skills: ['AWS (16 Certs)', 'Azure (9 Certs)', 'GCP (6 Certs)', 'Multi-Cloud Architecture', 'Cloud Adoption Framework', 'Well-Architected Framework']
    },
    {
      icon: Terminal,
      title: 'DevOps & Infrastructure',
      skills: ['Kubernetes', 'Docker', 'Terraform', 'Vault', 'Consul', 'Jenkins', 'Azure DevOps', 'GitLab', 'ArgoCD', 'Ansible', 'Service Mesh', 'Helm']
    },
    {
      icon: Code2,
      title: 'Programming & Scripting',
      skills: ['Python', 'Shell/Bash', 'YAML', 'JSON', 'HCL', 'Go', 'Java', 'C/C++', 'Pascal', 'SQL']
    },
    {
      icon: Database,
      title: 'Data & Analytics',
      skills: ['BigQuery', 'Data Lake', 'ETL/ELT', 'REST APIs', 'Camunda BPM', 'SAP R/3', 'Business Analytics', 'Data Engineering']
    },
    {
      icon: Shield,
      title: 'Security & Compliance',
      skills: ['DevSecOps', 'MS Defender', 'Prisma Cloud', 'HashiCorp Vault', 'RBAC', 'Security as Code', 'Baseline Clearance', 'Cloud Security']
    },
    {
      icon: Briefcase,
      title: 'Business & Leadership',
      skills: ['Solutions Architecture', 'Enterprise Architecture', 'Agile/Scrum', 'Technical Leadership', 'Stakeholder Management', 'Business Development', 'Pre-sales', 'Project Management']
    }
  ];

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2">
        <Code2 className="w-6 h-6 text-[var(--aws-orange)]" />
        <h2 className="text-2xl font-bold text-white">Skills & Technologies</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {skillCategories.map((category, index) => (
          <SkillCategory
            key={index}
            icon={category.icon}
            title={category.title}
            skills={category.skills}
          />
        ))}
      </div>
    </section>
  );
};

export default SkillsSection;