'use client';

import React, { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem('nwip_theme') as 'dark' | 'light' | null;
    if (savedTheme) {
      setTheme(savedTheme);
      if (savedTheme === 'light') {
        document.documentElement.classList.remove('dark');
      } else {
        document.documentElement.classList.add('dark');
      }
    } else {
      // Default to dark mode for meteorological radar visual clarity
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('nwip_theme', nextTheme);

    if (nextTheme === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
    }
  };

  if (!mounted) {
    return (
      <div className="w-8 h-8 rounded-lg bg-slate-800/40 border border-slate-700/50" />
    );
  }

  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle theme"
      title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
      className="p-2 rounded-lg transition-all duration-200 flex items-center justify-center
        bg-slate-200/80 hover:bg-slate-300 text-slate-700 border border-slate-300
        dark:bg-slate-800/80 dark:hover:bg-slate-700 dark:text-amber-300 dark:border-slate-700
        shadow-sm hover:scale-105 active:scale-95"
    >
      {theme === 'dark' ? (
        <Sun className="w-4 h-4 text-amber-400 transition-transform duration-300 rotate-0 hover:rotate-45" />
      ) : (
        <Moon className="w-4 h-4 text-indigo-600 transition-transform duration-300 -rotate-12 hover:rotate-0" />
      )}
    </button>
  );
}
