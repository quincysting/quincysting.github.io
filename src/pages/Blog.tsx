import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Calendar, ChevronRight } from 'lucide-react';

interface BlogPost {
  title: string;
  date: string;
  slug: string;
  excerpt: string;
}

function Blog() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch(
          'https://api.github.com/repos/qinxiaoguang/personal-website/contents/content/blog',
          {
            headers: {
              'Accept': 'application/vnd.github.v3+json'
            }
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch blog posts');
        }

        const files = await response.json();
        const markdownFiles = files.filter((file: any) => file.name.endsWith('.md'));

        const postsData = await Promise.all(
          markdownFiles.map(async (file: any) => {
            const contentResponse = await fetch(file.download_url);
            const content = await contentResponse.text();
            
            // Parse frontmatter
            const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
            const frontmatter = frontmatterMatch ? frontmatterMatch[1] : '';
            
            const titleMatch = frontmatter.match(/^title:\s*(.+)$/m);
            const dateMatch = frontmatter.match(/^date:\s*(.+)$/m);
            const excerptMatch = content.split('\n').find(line => line.length > 0 && !line.startsWith('---') && !line.startsWith('title:') && !line.startsWith('date:'));

            return {
              title: titleMatch ? titleMatch[1] : file.name.replace('.md', ''),
              date: dateMatch ? dateMatch[1] : 'No date',
              slug: file.name.replace('.md', ''),
              excerpt: excerptMatch ? excerptMatch.replace(/^#+\s*/, '').slice(0, 150) + '...' : 'No excerpt available'
            };
          })
        );

        setPosts(postsData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        setLoading(false);
      } catch (err) {
        console.error('Error fetching blog posts:', err);
        setError('Failed to load blog posts. Please try again later.');
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--aws-orange)]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-2">
        <BookOpen className="w-6 h-6 text-[var(--aws-orange)]" />
        <h1 className="text-2xl font-bold text-white">Blog Posts</h1>
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