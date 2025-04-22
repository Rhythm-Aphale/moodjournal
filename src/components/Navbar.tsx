// components/Navbar.tsx
'use client';

import { useState, useEffect } from 'react';
import { Sun, Moon, Menu, X } from 'lucide-react';
import Link from 'next/link';

const Navbar = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Toggle dark mode
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    if (!isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.theme = 'dark';
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.theme = 'light';
    }
  };

  // Check user's preferred theme on component mount
  useEffect(() => {
    const userPrefersDark = localStorage.theme === 'dark' || 
      (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
    
    setIsDarkMode(userPrefersDark);
    
    if (userPrefersDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  return (
    <nav className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 dark:from-indigo-900 dark:via-purple-900 dark:to-pink-900 p-4 shadow-lg rounded-b-xl">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Logo */}
        <div className="flex items-center">
          <Link href="/" className="text-white font-bold text-2xl flex items-center">
            <div className="transform -rotate-12 bg-white text-pink-500 dark:bg-slate-800 dark:text-pink-300 p-2 rounded-lg shadow-lg mr-2">
              <span className="text-2xl">😊</span>
            </div>
            <span className="ml-2 font-extrabold tracking-tight">MoodTrack</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-8">
          <Link href="/" className="text-white hover:text-pink-200 transition-all font-medium">
            Home
          </Link>
          <Link href="/journal" className="text-white hover:text-pink-200 transition-all font-medium">
            Journal
          </Link>
          <Link href="/statistics" className="text-white hover:text-pink-200 transition-all font-medium">
            Statistics
          </Link>
          <button 
            onClick={toggleDarkMode}
            className="p-2 bg-white/20 dark:bg-slate-700/40 rounded-full hover:bg-white/30 dark:hover:bg-slate-700/60 transition-all"
            aria-label="Toggle dark mode"
          >
            {isDarkMode ? <Sun size={20} className="text-yellow-300" /> : <Moon size={20} className="text-white" />}
          </button>
        </div>

        {/* Mobile menu button */}
        <div className="md:hidden">
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-white hover:text-pink-200 transition-colors"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden mt-4 flex flex-col space-y-4 pb-4">
          <Link href="/" className="text-white hover:text-pink-200 transition-all font-medium">
            Home
          </Link>
          <Link href="/journal" className="text-white hover:text-pink-200 transition-all font-medium">
            Journal
          </Link>
          <Link href="/statistics" className="text-white hover:text-pink-200 transition-all font-medium">
            Statistics
          </Link>
          <div className="flex items-center">
            <button 
              onClick={toggleDarkMode}
              className="flex items-center p-2 bg-white/20 dark:bg-slate-700/40 rounded-full hover:bg-white/30 dark:hover:bg-slate-700/60 transition-all"
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? <Sun size={20} className="text-yellow-300 mr-2" /> : <Moon size={20} className="text-white mr-2" />}
              <span className="text-white">{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;