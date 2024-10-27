import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Calendar, ChevronRight } from 'lucide-react';
import { getBlogPosts } from '../data/blogPosts';

function Blog() {
  const posts = getBlogPosts();

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-2">
        <BookOpen className="w-6 h-6 text-[var(--aws-orange)]" />
        <h1 className="text-2xl font-bold text-white">Blog Posts ({posts.length})</h1>
      </div>

      <div className="space-y-6">
        {posts.map((post) => (
          <Link
            key={post.slug}
            to={`/blog/${post.slug}`}
            className="aws-card block rounded-lg p-6 hover:border-[var(--aws-orange)] transition-colors"
          >
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <h2 className="text-xl font-semibold text-white">{post.title}</h2>
                <div className="flex items-center gap-2 text-gray-400">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(post.date).toLocaleDateString()}</span>
                </div>
                <p className="text-gray-300">{post.excerpt}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default Blog;