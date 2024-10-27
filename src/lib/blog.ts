const GITHUB_USERNAME = 'quincysting';
const REPO_NAME = 'quincysting.github.io';
const BLOG_PATH = 'content/blog';

export interface BlogPost {
  title: string;
  date: string;
  slug: string;
  content: string;
}

export const fetchBlogPosts = async (): Promise<BlogPost[]> => {
  try {
    const response = await fetch(
      `https://api.github.com/repos/${GITHUB_USERNAME}/${REPO_NAME}/contents/${BLOG_PATH}`
    );
    const files = await response.json();
    
    const posts = await Promise.all(
      files
        .filter((file: any) => file.name.endsWith('.md'))
        .map(async (file: any) => {
          const content = await fetch(file.download_url).then(res => res.text());
          const [, frontMatter, markdown] = content.split('---');
          const metadata = parseFrontMatter(frontMatter);
          
          return {
            title: metadata.title,
            date: metadata.date,
            slug: file.name.replace('.md', ''),
            content: markdown.trim()
          };
        })
    );

    return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    return [];
  }
};

export const fetchBlogPost = async (slug: string): Promise<BlogPost | null> => {
  try {
    const response = await fetch(
      `https://api.github.com/repos/${GITHUB_USERNAME}/${REPO_NAME}/contents/${BLOG_PATH}/${slug}.md`
    );
    const file = await response.json();
    const content = await fetch(file.download_url).then(res => res.text());
    
    const [, frontMatter, markdown] = content.split('---');
    const metadata = parseFrontMatter(frontMatter);
    
    return {
      title: metadata.title,
      date: metadata.date,
      slug,
      content: markdown.trim()
    };
  } catch (error) {
    console.error('Error fetching blog post:', error);
    return null;
  }
};

const parseFrontMatter = (frontMatter: string) => {
  const metadata: Record<string, string> = {};
  frontMatter.split('\n').forEach(line => {
    const [key, value] = line.split(':').map(str => str.trim());
    if (key && value) {
      metadata[key] = value;
    }
  });
  return metadata;
};