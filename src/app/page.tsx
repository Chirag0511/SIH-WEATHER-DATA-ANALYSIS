'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  CloudRain, 
  MapPin, 
  ShieldCheck, 
  Radio, 
  ArrowRight, 
  AlertTriangle, 
  Cpu, 
  Layers, 
  FileText, 
  Sparkles, 
  Compass, 
  Users 
} from 'lucide-react';
import { INITIAL_WEATHER_EVENTS, MOCK_KPI_SUMMARY } from '@/lib/mockWeatherData';
import KPICards from '@/components/KPICards';
import EventCard from '@/components/EventCard';
import EventDetailsModal from '@/components/EventDetailsModal';
import CitizenReportModal from '@/components/CitizenReportModal';
import { WeatherEvent } from '@/types/weather';

export default function HomePage() {
  const [events, setEvents] = useState<WeatherEvent[]>(INITIAL_WEATHER_EVENTS);
  const [selectedEvent, setSelectedEvent] = useState<WeatherEvent | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);

  const criticalEvents = events.filter((e) => e.severity === 'critical' || e.severity === 'high');

  const handleOpenDetails = (ev: WeatherEvent) => {
    setSelectedEvent(ev);
    setIsDetailsOpen(true);
  };

  const handleReportSubmitted = (newEv: WeatherEvent) => {
    setEvents((prev) => [newEv, ...prev]);
  };

  return (
    <div className="flex flex-col min-h-screen transition-colors duration-200">
      {/* Live Warning Ticker */}
      <div className="bg-red-50 dark:bg-red-950/70 border-b border-red-200 dark:border-red-800/50 py-2 px-4 text-xs transition-colors">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center space-x-2 text-rose-700 dark:text-rose-300 font-bold flex-shrink-0">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
            </span>
            <span>NATIONAL CRITICAL WEATHER ADVISORY:</span>
          </div>
          <div className="text-slate-700 dark:text-slate-200 overflow-hidden whitespace-nowrap text-ellipsis">
            Cyclone alert along Odisha &amp; West Bengal coasts (Wind gusts 115 km/h) &bull; Flash floods in Mumbai Suburban (224mm rainfall) &bull; Severe Heatwave in Churu, Rajasthan (47.8°C).
          </div>
          <Link
            href="/dashboard"
            className="flex-shrink-0 text-blue-600 dark:text-sky-400 hover:underline font-semibold flex items-center space-x-1"
          >
            <span>Track Live</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-blue-50/70 via-slate-50 to-white dark:from-[#071329] dark:via-[#050e1d] dark:to-[#020c1b] overflow-hidden transition-colors">
        {/* Background Radar Grid Pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] dark:bg-[radial-gradient(#1e3a8a_1px,transparent_1px)] [background-size:24px_24px] opacity-20 pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10 text-center space-y-6">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-blue-100 dark:bg-blue-900/40 border border-blue-300 dark:border-blue-500/40 text-blue-800 dark:text-sky-300 text-xs font-semibold backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-sky-400" />
            <span>Smart India Hackathon 2026 • AI-Powered Geospatial Intelligence</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-tight max-w-4xl mx-auto">
            National Weather Intelligence Platform for <span className="bg-gradient-to-r from-orange-500 via-amber-500 to-emerald-600 bg-clip-text text-transparent">India</span>
          </h1>

          <p className="text-sm sm:text-lg text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed font-normal">
            A unified national radar integrating IMD Doppler feeds, open satellite models, social media signals, and geotagged citizen ground truth. Armed with AI multi-source corroboration and duplicate suppression.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 pt-4">
            <Link
              href="/dashboard"
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-blue-600/25 flex items-center space-x-2 transition-all border border-blue-400/40 hover:scale-105"
            >
              <Compass className="w-5 h-5 text-sky-200" />
              <span>Launch Live Dashboard</span>
            </Link>

            <button
              onClick={() => setIsReportOpen(true)}
              className="px-6 py-3 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold rounded-xl shadow-lg shadow-orange-600/25 flex items-center space-x-2 transition-all border border-orange-400/40 hover:scale-105"
            >
              <FileText className="w-5 h-5" />
              <span>Submit Citizen Ground Report</span>
            </button>
          </div>

          {/* Core metrics strip */}
          <div className="pt-10 max-w-6xl mx-auto">
            <KPICards summary={MOCK_KPI_SUMMARY} />
          </div>
        </div>
      </section>

      {/* Featured Critical Weather Events Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-slate-100/70 dark:bg-[#040c1a] border-t border-slate-200 dark:border-[#10223d] transition-colors">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center space-x-2 text-rose-600 dark:text-rose-400 text-xs font-bold uppercase tracking-wider mb-1">
                <AlertTriangle className="w-4 h-4" />
                <span>Live Priority Stream</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                Critical &amp; High Severity Alerts Across India
              </h2>
            </div>
            <Link
              href="/dashboard"
              className="text-xs font-semibold text-blue-600 dark:text-sky-400 hover:underline flex items-center space-x-1"
            >
              <span>View All Monitored Events on Map</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {criticalEvents.slice(0, 6).map((event) => (
              <EventCard
                key={event.id}
                event={event}
                isSelected={selectedEvent?.id === event.id}
                onSelect={(ev) => {
                  setSelectedEvent(ev);
                  handleOpenDetails(ev);
                }}
                onOpenDetails={handleOpenDetails}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 4 Pillars Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white dark:bg-[#020914] border-t border-slate-200 dark:border-[#0d1d36] transition-colors">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <h3 className="text-xs font-bold uppercase tracking-widest text-blue-600 dark:text-sky-400">
              Platform Architecture
            </h3>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              How National Weather Intelligence Works
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              Eliminating weather misinformation and delayed crisis communication through an automated multi-stage pipeline.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Step 1 */}
            <div className="p-6 bg-slate-50 dark:bg-[#061226] border border-slate-200 dark:border-[#162a4b] rounded-2xl shadow-sm dark:shadow-lg space-y-3 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-sky-950/80 border border-blue-300 dark:border-sky-500/40 flex items-center justify-center text-blue-600 dark:text-sky-400">
                <Radio className="w-6 h-6 animate-pulse" />
              </div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">1. Multi-Stream Ingestion</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Connectors ingest gridded forecasts from Open-Meteo, IMD Doppler radars, NDMA bulletins, and verified crowdsourced reports.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-6 bg-slate-50 dark:bg-[#061226] border border-slate-200 dark:border-[#162a4b] rounded-2xl shadow-sm dark:shadow-lg space-y-3 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-950/80 border border-indigo-300 dark:border-indigo-500/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                <Cpu className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">2. AI Classification &amp; NLP</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Language models extract spatial coordinates, categorize severe weather types, and detect duplicate claims using sentence embeddings.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-6 bg-slate-50 dark:bg-[#061226] border border-slate-200 dark:border-[#162a4b] rounded-2xl shadow-sm dark:shadow-lg space-y-3 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-500/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">3. Multi-Source Corroboration</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Cross-references citizen geotags against satellite rain grids and barometric sensor feeds, assigning confidence scores (0-100%).
              </p>
            </div>

            {/* Step 4 */}
            <div className="p-6 bg-slate-50 dark:bg-[#061226] border border-slate-200 dark:border-[#162a4b] rounded-2xl shadow-sm dark:shadow-lg space-y-3 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-950/80 border border-amber-300 dark:border-amber-500/40 flex items-center justify-center text-amber-600 dark:text-amber-400">
                <Layers className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">4. Interactive India Map</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Displays live alerts on Leaflet-powered geospatial map with district-level boundary overlays, filters, and verified evidence audit logs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Citizen Call to Action Banner */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-blue-50 dark:bg-gradient-to-r dark:from-blue-950/50 dark:via-[#061733] dark:to-indigo-950/50 border-t border-b border-blue-200 dark:border-[#142848] transition-colors">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div className="space-y-2">
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              Witnessing severe weather in your locality?
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-xl">
              Help your community and disaster responders. Submit ground observations, water levels, or road blockages directly into the National Verification Network.
            </p>
          </div>
          <button
            onClick={() => setIsReportOpen(true)}
            className="px-6 py-3 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold rounded-xl shadow-lg shadow-orange-600/30 flex items-center space-x-2 transition-all border border-orange-400/40 flex-shrink-0 hover:scale-105 active:scale-95"
          >
            <Users className="w-5 h-5" />
            <span>Submit Citizen Report</span>
          </button>
        </div>
      </section>

      {/* Modals */}
      <EventDetailsModal
        event={selectedEvent}
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
      />

      <CitizenReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        onReportSubmitted={handleReportSubmitted}
      />
    </div>
  );
}
