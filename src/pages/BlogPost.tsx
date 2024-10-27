import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ArrowLeft, Calendar } from 'lucide-react';

interface BlogPostData {
  content: string;
  title: string;
  date: string;
}

function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPostData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await fetch(
          `https://api.github.com/repos/qinxiaoguang/personal-website/contents/content/blog/${slug}.md`,
          {
            headers: {
              'Accept': 'application/vnd.github.v3.raw'
            }
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch blog post');
        }

        const content = await response.text();
        
        // Parse frontmatter
        const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
        const frontmatter = frontmatterMatch ? frontmatterMatch[1] : '';
        
        const titleMatch = frontmatter.match(/^title:\s*(.+)$/m);
        const dateMatch = frontmatter.match(/^date:\s*(.+)$/m);
        
        // Remove frontmatter from content
        const mainContent = content.replace(/^---\n[\s\S]*?\n---\n/, '');

        setPost({
          content: mainContent,
          title: titleMatch ? titleMatch[1] : slug || '',
          date: dateMatch ? dateMatch[1] : 'No date'
        });
        setLoading(false);
      } catch (err) {
        console.error('Error fetching blog post:', err);
        setError('Failed to load blog post. Please try again later.');
        setLoading(false);
      }
    };

    if (slug) {
      fetchPost();
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--aws-orange)]"></div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="text-center py-12">
        <p className="text-red-400">{error || 'Post not found'}</p>
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