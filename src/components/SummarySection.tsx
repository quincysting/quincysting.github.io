import React from 'react';
import { Code2, Server, Users, Brain } from 'lucide-react';

const SummaryCard = ({ icon: Icon, title, description }: { icon: any, title: string, description: string }) => (
  <div className="aws-card rounded-lg p-6 hover:border-[var(--aws-orange)] transition-all duration-300 hover:scale-105">
    <div className="space-y-3">
      <div className="inline-block p-2 bg-[var(--aws-navy)] rounded-lg">
        <Icon className="w-6 h-6 text-[var(--aws-orange)]" />
      </div>
      <h3 className="font-semibold text-white">{title}</h3>
      <p className="text-gray-300 text-sm">{description}</p>
    </div>
  </div>
);

const SummarySection = () => {
  return (
    <section className="space-y-4 fade-in" style={{ animationDelay: '0.4s' }}>
      <div className="flex items-center gap-2">
        <Brain className="w-6 h-6 text-[var(--aws-orange)]" />
        <h2 className="text-2xl font-bold text-white">Summary</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
        <SummaryCard
          icon={Code2}
          title="Full Stack Development"
          description="Expertise in modern web technologies, cloud-native applications, and distributed systems"
        />
        <SummaryCard
          icon={Server}
          title="Cloud Architecture"
          description="AWS certified professional with extensive experience in cloud infrastructure and DevOps"
        />
        <SummaryCard
          icon={Users}
          title="Team Leadership"
          description="Proven track record in mentoring teams and implementing agile methodologies"
        />
        <SummaryCard
          icon={Brain}
          title="Problem Solving"
          description="Strong analytical skills with focus on scalable and efficient solutions"
        />
      </div>
    </section>
  );
};

export default SummarySection;