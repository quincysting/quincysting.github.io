import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import { Github, Linkedin, Mail, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Layout = () => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--aws-bg)]">
      <header className="bg-[var(--aws-navy)] shadow-lg sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-6">
            <Link to="/" className="text-xl font-bold text-[var(--aws-orange)]">
              Ian Qin
            </Link>
            <nav>
              <ul className="flex space-x-4">
                <li>
                  <Link to="/blog" className="text-gray-300 hover:text-[var(--aws-orange)] transition-colors">
                    Blog
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
          <div className="flex gap-4 items-center">
            <a href="https://github.com/quincysting119" className="text-gray-300 hover:text-[var(--aws-orange)]">
              <Github className="w-5 h-5" />
            </a>
            <a href="https://www.linkedin.com/in/ianqin/" className="text-gray-300 hover:text-[var(--aws-orange)]">
              <Linkedin className="w-5 h-5" />
            </a>
            <a href="mailto:ianqinmba@gmail.com" className="text-gray-300 hover:text-[var(--aws-orange)]">
              <Mail className="w-5 h-5" />
            </a>
            {user && (
              <button
                onClick={handleLogout}
                className="text-gray-300 hover:text-[var(--aws-orange)] flex items-center gap-1"
              >
                <LogOut className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </header>

      <Outlet />

      <footer className="bg-[var(--aws-navy)] border-t border-[#2c415c]">
        <div className="max-w-6xl mx-auto px-4 py-6 text-center text-gray-400">
          © {new Date().getFullYear()} Ian Qin. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default Layout;