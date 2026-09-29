import React from 'react';
import Link from 'next/link';
import { CloudLightning, ShieldCheck, PhoneCall, Activity } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-100 dark:bg-[#030914] border-t border-slate-200 dark:border-[#112240] text-slate-600 dark:text-slate-400 text-xs mt-auto transition-colors duration-200">
      {/* Emergency Helpline Banner */}
      <div className="bg-blue-50 dark:bg-gradient-to-r dark:from-blue-950/60 dark:via-slate-900 dark:to-indigo-950/60 border-b border-blue-200 dark:border-blue-900/30 py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-2 text-slate-800 dark:text-slate-300">
            <PhoneCall className="w-4 h-4 text-amber-600 dark:text-amber-400 animate-pulse" />
            <span className="font-semibold text-slate-900 dark:text-white">Emergency Disaster & Weather Helplines:</span>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-slate-700 dark:text-slate-300">
            <span className="flex items-center space-x-1.5 bg-white dark:bg-slate-800/60 px-2.5 py-1 rounded border border-slate-300 dark:border-slate-700/60 shadow-xs">
              <span className="text-amber-600 dark:text-amber-400 font-bold">112</span>
              <span className="text-slate-500 dark:text-slate-400 text-[11px]">(National All-Emergency)</span>
            </span>
            <span className="flex items-center space-x-1.5 bg-white dark:bg-slate-800/60 px-2.5 py-1 rounded border border-slate-300 dark:border-slate-700/60 shadow-xs">
              <span className="text-sky-600 dark:text-sky-400 font-bold">1078</span>
              <span className="text-slate-500 dark:text-slate-400 text-[11px]">(NDMA Disaster Helpline)</span>
            </span>
            <span className="flex items-center space-x-1.5 bg-white dark:bg-slate-800/60 px-2.5 py-1 rounded border border-slate-300 dark:border-slate-700/60 shadow-xs">
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">1800-180-1717</span>
              <span className="text-slate-500 dark:text-slate-400 text-[11px]">(IMD Weather Toll-free)</span>
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Column 1: Platform Overview */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <CloudLightning className="w-5 h-5 text-blue-600 dark:text-sky-400" />
              <span className="font-bold text-slate-900 dark:text-white text-sm">NWIP INDIA</span>
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed">
              India&apos;s next-generation weather intelligence & verification platform. Aggregating telemetry from Doppler radars, satellite reanalysis, social signals, and geotagged citizen ground truth.
            </p>
            <div className="flex items-center space-x-2 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
              <Activity className="w-3.5 h-3.5" />
              <span>Multi-Source AI Corroboration Engine Active</span>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200">Navigation</h4>
            <ul className="space-y-1.5 text-xs">
              <li><Link href="/" className="hover:text-blue-600 dark:hover:text-sky-300 transition-colors">National Overview</Link></li>
              <li><Link href="/dashboard" className="hover:text-blue-600 dark:hover:text-sky-300 transition-colors">Live Interactive Map</Link></li>
              <li><Link href="/explorer" className="hover:text-blue-600 dark:hover:text-sky-300 transition-colors">Event Explorer & Database</Link></li>
              <li><Link href="/report" className="hover:text-blue-600 dark:hover:text-sky-300 transition-colors">Submit Citizen Incident</Link></li>
              <li><Link href="/about" className="hover:text-blue-600 dark:hover:text-sky-300 transition-colors">System Architecture & Pipeline</Link></li>
            </ul>
          </div>

          {/* Column 3: Data Sources Integrated */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200">Data Feeds & Integrations</h4>
            <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
              <li className="flex items-center space-x-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>IMD Synoptic & Doppler Radar</span>
              </li>
              <li className="flex items-center space-x-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>Open-Meteo High-Res Grid</span>
              </li>
              <li className="flex items-center space-x-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>INCOIS Ocean Buoy Telemetry</span>
              </li>
              <li className="flex items-center space-x-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>NDMA & SDMA Alerts</span>
              </li>
              <li className="flex items-center space-x-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                <span>Citizen Crowdsourced Feeds</span>
              </li>
            </ul>
          </div>

          {/* Column 4: SIH Disclaimer & Trust */}
          <div className="space-y-3">
            <div className="flex items-center space-x-1.5 text-amber-600 dark:text-amber-400 text-xs font-bold">
              <ShieldCheck className="w-4 h-4" />
              <span>Smart India Hackathon 2026</span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-normal">
              Built for SIH problem statement: National Weather Intelligence Platform for India. All citizen reports pass through multi-point AI NLP classification, duplicate suppression, and spatial geofence validation.
            </p>
            <div className="pt-2 text-[10px] text-slate-500">
              Demonstration environment. Production build links to live IMD and Open-Meteo APIs.
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-300 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500">
          <p>© 2026 National Weather Intelligence Platform (India). SIH Prototype.</p>
          <div className="flex space-x-4 mt-2 sm:mt-0">
            <span>Security Policy</span>
            <span>API Documentation</span>
            <span>Terms of Service</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
