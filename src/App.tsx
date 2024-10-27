import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Github, Linkedin, Mail, BookOpen } from 'lucide-react';
import Home from './pages/Home';
import Blog from './pages/Blog';
import BlogPost from './pages/BlogPost';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-[var(--aws-bg)]">
        {/* Header */}
        <header className="bg-[var(--aws-navy)] shadow-lg sticky top-0 z-10">
          <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
            <div className="flex items-center space-x-6">
              <h1 className="text-xl font-bold text-[var(--aws-orange)]">
                <Link to="/">Ian Qin</Link>
              </h1>
              <Link to="/blog" className="text-gray-300 hover:text-[var(--aws-orange)] flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                <span>Blog</span>
              </Link>
            </div>
            <div className="flex gap-4">
              <a href="https://github.com/qinxiaoguang" className="text-gray-300 hover:text-[var(--aws-orange)]">
                <Github className="w-5 h-5" />
              </a>
              <a href="https://www.linkedin.com/in/ianqin/" className="text-gray-300 hover:text-[var(--aws-orange)]">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="mailto:qinxiaoguang01@gmail.com" className="text-gray-300 hover:text-[var(--aws-orange)]">
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
          </Routes>
        </main>

        {/* Footer */}
        <footer className="bg-[var(--aws-navy)] border-t border-[#2c415c]">
          <div className="max-w-6xl mx-auto px-4 py-6 text-center text-gray-400">
            © {new Date().getFullYear()} Ian Qin. All rights reserved.
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;