import React from 'react';
import BlogEditor from '../components/BlogEditor';

const NewBlogPost = () => {
  return (
    <main className="max-w-6xl mx-auto px-4">
      <h1 className="text-3xl font-bold text-white mt-8 mb-6">Write New Blog Post</h1>
      <BlogEditor />
    </main>
  );
};

export default NewBlogPost;