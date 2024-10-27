const GITHUB_USERNAME = 'quincysting';
const REPO_NAME = 'quincysting.github.io';
const BLOG_PATH = 'content/blog';

export interface BlogPost {
  title: string;
  date: string;
  slug: string;
  content: string;
  excerpt?: string;
}

export const fetchBlogPosts = async (): Promise<BlogPost[]> => {
  try {
    // First, try to fetch from the master branch
    const response = await fetch(
      `https://api.github.com/repos/${GITHUB_USERNAME}/${REPO_NAME}/contents/${BLOG_PATH}?ref=master`,
      {
        headers: {
          'Accept': 'application/vnd.github.v3+json'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.statusText}`);
    }

    const files = await response.json();

    if (!Array.isArray(files)) {
      console.error('Files is not an array:', files);
      return [];
    }

    const markdownFiles = files.filter((file: any) => file.name.endsWith('.md'));

    const posts = await Promise.all(
      markdownFiles.map(async (file: any) => {
        try {
          const contentResponse = await fetch(file.download_url);
          const content = await contentResponse.text();

          // Parse frontmatter
          const [frontmatter, ...contentParts] = content.split('---').filter(Boolean);
          const markdown = contentParts.join('---').trim();

          // Extract metadata
          const titleMatch = frontmatter.match(/title:\s*(.+)$/m);
          const dateMatch = frontmatter.match(/date:\s*(.+)$/m);

          // Get excerpt from first paragraph
          const excerpt = markdown
            .split('\n\n')
            .find(p => p.trim() && !p.startsWith('#'))
            ?.replace(/^[#\s]+/, '')
            ?.slice(0, 150) + '...';

          return {
            title: titleMatch ? titleMatch[1].trim() : file.name.replace('.md', ''),
            date: dateMatch ? dateMatch[1].trim() : new Date().toISOString(),
            slug: file.name.replace('.md', ''),
            content: markdown,
            excerpt: excerpt || 'No excerpt available'
          };
        } catch (error) {
          console.error(`Error processing ${file.name}:`, error);
          return null;
        }
      })
    );

    // Filter out failed posts and sort by date
    return posts
      .filter((post): post is BlogPost => post !== null)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  } catch (error) {
    console.error('Error fetching blog posts:', error);
    return [];
  }
};

export const fetchBlogPost = async (slug: string): Promise<BlogPost | null> => {
  try {
    const response = await fetch(
      `https://api.github.com/repos/${GITHUB_USERNAME}/${REPO_NAME}/contents/${BLOG_PATH}/${slug}.md?ref=master`,
      {
        headers: {
          'Accept': 'application/vnd.github.v3+json'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.statusText}`);
    }

    const file = await response.json();
    const contentResponse = await fetch(file.download_url);
    const content = await contentResponse.text();

    // Parse frontmatter
    const [frontmatter, ...contentParts] = content.split('---').filter(Boolean);
    const markdown = contentParts.join('---').trim();

    // Extract metadata
    const titleMatch = frontmatter.match(/title:\s*(.+)$/m);
    const dateMatch = frontmatter.match(/date:\s*(.+)$/m);

    return {
      title: titleMatch ? titleMatch[1].trim() : slug,
      date: dateMatch ? dateMatch[1].trim() : new Date().toISOString(),
      slug,
      content: markdown
    };
  } catch (error) {
    console.error('Error fetching blog post:', error);
    return null;
  }
};