import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Github } from 'lucide-react';

const Login = () => {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await login(username);
    if (success) {
      navigate('/blog');
    } else {
      setError('Access denied. Only the blog owner can log in.');
    }
  };

  return (
    <main className="max-w-md mx-auto px-4 py-16">
      <div className="aws-card rounded-lg p-8">
        <div className="flex justify-center mb-6">
          <div className="p-3 bg-[var(--aws-navy)] rounded-full">
            <Github className="w-8 h-8 text-[var(--aws-orange)]" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-white text-center mb-8">Blog Admin Login</h1>
        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-500 rounded-lg p-3 mb-4">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-1">
              GitHub Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-[var(--aws-card)] border border-[#2c415c] text-white placeholder-gray-400 focus:outline-none focus:border-[var(--aws-orange)]"
              placeholder="Enter your GitHub username"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 px-4 bg-[var(--aws-orange)] text-[var(--aws-navy)] font-medium rounded-lg hover:bg-[#ffb84d] transition-colors"
          >
            Login
          </button>
        </form>
      </div>
    </main>
  );
};

export default Login;