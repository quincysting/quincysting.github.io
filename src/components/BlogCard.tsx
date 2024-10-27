import React from 'react';
import { Calendar, Clock } from 'lucide-react';

interface BlogCardProps {
  title: string;
  date: string;
  readTime: string;
  summary: string;
  slug: string;
}

const BlogCard = ({ title, date, readTime, summary, slug }: BlogCardProps) => {
  return (
    <div className="aws-card rounded-lg p-6 hover:border-[var(--aws-orange)] transition-colors group cursor-pointer">
      <article className="space-y-3">
        <h3 className="text-xl font-semibold text-white group-hover:text-[var(--aws-orange)] transition-colors">
          {title}
        </h3>
        <div className="flex items-center gap-4 text-sm text-gray-400">
          <span className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            {date}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {readTime}
          </span>
        </div>
        <p className="text-gray-300">{summary}</p>
        <a 
          href={`/blog/${slug}`} 
          className="inline-block text-[var(--aws-orange)] hover:text-[#ffb84d] font-medium"
        >
          Read more →
        </a>
      </article>
    </div>
  );
};

export default BlogCard;