import React from 'react';
import { useParams, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ArrowLeft, Calendar } from 'lucide-react';
import { getBlogPost } from '../data/blogPosts';

function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const post = getBlogPost(slug || '');

  if (!post) {
    return (
      <div className="text-center py-12">
        <p className="text-red-400">Post not found</p>
        <Link to="/blog" className="text-[var(--aws-orange)] hover:text-[#ffb84d] mt-4 inline-block">
          ← Back to Blog
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <Link
          to="/blog"
          className="inline-flex items-center text-[var(--aws-orange)] hover:text-[#ffb84d] mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Blog
        </Link>

        <h1 className="text-3xl font-bold text-white mb-4">{post.title}</h1>

        <div className="flex items-center gap-2 text-gray-400 mb-8">
          <Calendar className="w-4 h-4" />
          <span>{new Date(post.date).toLocaleDateString()}</span>
        </div>
      </div>

      <div className="aws-card rounded-lg p-8">
        <article className="prose prose-invert max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.content}</ReactMarkdown>
        </article>
      </div>
    </div>
  );
}

export default BlogPost;