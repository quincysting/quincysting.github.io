import React, { useState } from 'react';
import { Save } from 'lucide-react';

const BlogEditor = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically save the blog post to your backend
    console.log({ title, content });
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter your blog title..."
            className="w-full px-4 py-3 rounded-lg bg-[var(--aws-card)] border border-[#2c415c] text-white placeholder-gray-400 focus:outline-none focus:border-[var(--aws-orange)]"
          />
        </div>
        <div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your blog content here..."
            rows={20}
            className="w-full px-4 py-3 rounded-lg bg-[var(--aws-card)] border border-[#2c415c] text-white placeholder-gray-400 focus:outline-none focus:border-[var(--aws-orange)] resize-none"
          />
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-3 bg-[var(--aws-orange)] text-[var(--aws-navy)] font-medium rounded-lg hover:bg-[#ffb84d] transition-colors"
          >
            <Save className="w-5 h-5" />
            Save Post
          </button>
        </div>
      </form>
    </div>
  );
};

export default BlogEditor;