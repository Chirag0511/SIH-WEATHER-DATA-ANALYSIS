'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  CloudRain, 
  Map, 
  Search, 
  FileText, 
  Info, 
  Menu, 
  X, 
  PlusCircle,
  BarChart3,
  ShieldCheck,
  LogOut,
  User
} from 'lucide-react';
import { getAuthUser, clearAuthSession } from '@/lib/api';
import ThemeToggle from '@/components/ThemeToggle';

interface NavbarProps {
  onOpenReportModal?: () => void;
}

export default function Navbar({ onOpenReportModal }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    setCurrentUser(getAuthUser());
  }, [pathname]);

  const handleLogout = () => {
    clearAuthSession();
    setCurrentUser(null);
    router.push('/');
  };

  const navLinks = [
    { href: '/', label: 'Home', icon: CloudRain },
    { href: '/dashboard', label: 'Live Map', icon: Map },
    { href: '/explorer', label: 'Explorer', icon: Search },
    { href: '/analytics', label: 'Analytics', icon: BarChart3 },
    { href: '/report', label: 'Citizen Portal', icon: FileText },
    { href: '/admin', label: 'Admin Console', icon: ShieldCheck },
    { href: '/about', label: 'Blueprint', icon: Info },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/90 dark:bg-[#071329]/95 backdrop-blur-md border-b border-slate-200 dark:border-[#1b2e4b] shadow-sm dark:shadow-xl transition-colors duration-200">
      {/* Tricolor accent bar */}
      <div className="h-1 w-full bg-gradient-to-r from-[#FF6F00] via-white to-[#138808]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Name */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 via-indigo-700 to-slate-900 border border-blue-400/40 flex items-center justify-center shadow-md group-hover:scale-105 transition-all">
              <CloudRain className="w-6 h-6 text-sky-300 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-slate-900 dark:text-white text-base sm:text-lg tracking-wide group-hover:text-blue-600 dark:group-hover:text-sky-300 transition-colors">
                  NWIP INDIA
                </span>
                <span className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-semibold tracking-wider uppercase bg-amber-500/10 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 rounded">
                  SIH 2026
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium tracking-tight truncate max-w-[180px] sm:max-w-none">
                National Weather Intelligence & Verification Platform
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-1.5">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href || (link.href !== '/' && pathname?.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center space-x-1.5 px-2.5 py-2 rounded-md text-xs lg:text-[13px] font-medium transition-all ${
                    isActive
                      ? 'bg-blue-100/70 text-blue-700 border border-blue-300 dark:bg-blue-600/30 dark:text-sky-300 dark:border-blue-500/50 shadow-sm'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Action buttons & Theme Switcher */}
          <div className="hidden sm:flex items-center space-x-2">
            {/* Dark / Light Theme Toggle */}
            <ThemeToggle />

            {currentUser ? (
              <div className="flex items-center space-x-2 bg-slate-100 dark:bg-[#091a38] border border-slate-300 dark:border-[#1b3664] py-1 px-2.5 rounded-lg text-xs">
                <div className="flex items-center space-x-1 text-slate-800 dark:text-amber-300">
                  <User className="w-3.5 h-3.5" />
                  <span className="font-bold truncate max-w-[100px]">{currentUser.name}</span>
                </div>
                <button
                  onClick={handleLogout}
                  title="Logout"
                  className="text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 p-0.5"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <Link
                href="/admin/login"
                className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-700 transition-colors"
              >
                Admin Login
              </Link>
            )}

            {onOpenReportModal ? (
              <button
                onClick={onOpenReportModal}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-semibold text-xs rounded-lg shadow-md border border-orange-400/40 transition-all hover:scale-105 active:scale-95"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Report</span>
              </button>
            ) : (
              <Link
                href="/report"
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-semibold text-xs rounded-lg shadow-md border border-orange-400/40 transition-all hover:scale-105 active:scale-95"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Report</span>
              </Link>
            )}
          </div>

          {/* Mobile hamburger menu toggle */}
          <div className="flex md:hidden items-center space-x-2">
            <ThemeToggle />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Toggle navigation"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white/95 dark:bg-[#071329]/95 border-b border-slate-200 dark:border-slate-800 px-4 pt-2 pb-4 space-y-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs font-semibold ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-600/30 dark:text-sky-300'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{link.label}</span>
              </Link>
            );
          })}

          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
            {currentUser ? (
              <button
                onClick={handleLogout}
                className="w-full text-left py-2 px-3 text-xs text-rose-600 dark:text-rose-400 font-semibold"
              >
                Sign Out ({currentUser.name})
              </button>
            ) : (
              <Link
                href="/admin/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2 px-3 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300"
              >
                Admin / Verifier Login
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
