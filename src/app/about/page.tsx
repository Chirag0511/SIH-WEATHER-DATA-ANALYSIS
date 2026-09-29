import React from 'react';
import { 
  CloudRain, 
  Cpu, 
  Database, 
  Layers, 
  Radio, 
  ShieldCheck, 
  Sparkles, 
  Users,
  CheckCircle2,
  Workflow
} from 'lucide-react';

export default function AboutPage() {
  const parts = [
    {
      part: 'Part 1',
      title: 'Frontend Foundation & Geospatial Dashboard UI',
      status: 'Completed',
      desc: 'Next.js App Router, Tailwind CSS design system, Leaflet interactive India map, KPI cards, multi-factor filtering, event details evidence modal, and citizen reporting interface.',
      statusClass: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
    },
    {
      part: 'Part 2',
      title: 'Backend, Database, Datasets & Ingestion Pipeline',
      status: 'Upcoming',
      desc: 'Python FastAPI services, PostgreSQL & PostGIS spatial database schemas, Open-Meteo & IMD radar data connectors, and citizen report ingestion endpoints.',
      statusClass: 'bg-amber-500/20 text-amber-400 border-amber-500/40',
    },
    {
      part: 'Part 3',
      title: 'AI Classification, Deduplication & Verification Logic',
      status: 'Upcoming',
      desc: 'HuggingFace/Sentence-Transformers for semantic deduplication clustering, perceptual image hashing, confidence scoring algorithm, and hallucination guardrails.',
      statusClass: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/40',
    },
    {
      part: 'Part 4',
      title: 'Admin Panel, Analytics, Auditing & Deployment',
      status: 'Upcoming',
      desc: 'Disaster manager moderation console, manual corroboration overrides, system health telemetry, Dockerized container deployment, and stress testing.',
      statusClass: 'bg-purple-500/20 text-purple-400 border-purple-500/40',
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Title */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-blue-900/40 border border-blue-500/40 text-sky-300 text-xs font-bold">
          <Sparkles className="w-4 h-4 text-sky-400" />
          <span>Smart India Hackathon (SIH) 2026 Initiative</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
          System Architecture & Blueprint
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mx-auto leading-relaxed">
          National Weather Intelligence Platform for India: An end-to-end AI-assisted situational awareness system designed for disaster administrators, meteorologists, and citizens.
        </p>
      </div>

      {/* Four Part Roadmap */}
      <div className="space-y-4">
        <h2 className="text-lg sm:text-xl font-black text-white flex items-center space-x-2">
          <Workflow className="w-5 h-5 text-sky-400" />
          <span>Planned Development Progression</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {parts.map((p, i) => (
            <div
              key={i}
              className="p-5 bg-[#061226] border border-[#162c52] rounded-2xl shadow-lg space-y-2.5"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-sky-400 uppercase tracking-widest">{p.part}</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${p.statusClass}`}>
                  {p.status}
                </span>
              </div>
              <h3 className="text-base font-bold text-white">{p.title}</h3>
              <p className="text-xs text-slate-300 leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Architecture Pipeline Diagram */}
      <div className="p-6 sm:p-8 bg-[#061226] border border-[#162c52] rounded-2xl shadow-xl space-y-6">
        <h2 className="text-lg sm:text-xl font-black text-white flex items-center space-x-2">
          <Layers className="w-5 h-5 text-indigo-400" />
          <span>End-to-End Data Pipeline Architecture</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-xs">
          {/* Box 1 */}
          <div className="p-4 bg-[#030914] rounded-xl border border-blue-900/40 text-center space-y-2">
            <Radio className="w-6 h-6 text-sky-400 mx-auto" />
            <div className="font-bold text-white text-xs">1. Data Ingestion</div>
            <p className="text-[11px] text-slate-400">
              IMD Doppler Radar, Open-Meteo, INCOIS Buoys, Citizen uploads, SDMA alerts.
            </p>
          </div>

          {/* Box 2 */}
          <div className="p-4 bg-[#030914] rounded-xl border border-indigo-900/40 text-center space-y-2">
            <Cpu className="w-6 h-6 text-indigo-400 mx-auto" />
            <div className="font-bold text-white text-xs">2. AI & NLP Processing</div>
            <p className="text-[11px] text-slate-400">
              Entity recognition, weather event categorization, sentiment, and geotag extraction.
            </p>
          </div>

          {/* Box 3 */}
          <div className="p-4 bg-[#030914] rounded-xl border border-amber-900/40 text-center space-y-2">
            <ShieldCheck className="w-6 h-6 text-amber-400 mx-auto" />
            <div className="font-bold text-white text-xs">3. Corroboration Matrix</div>
            <p className="text-[11px] text-slate-400">
              Multi-source cross verification, duplicate clustering, and confidence scoring.
            </p>
          </div>

          {/* Box 4 */}
          <div className="p-4 bg-[#030914] rounded-xl border border-emerald-900/40 text-center space-y-2">
            <Database className="w-6 h-6 text-emerald-400 mx-auto" />
            <div className="font-bold text-white text-xs">4. Spatial Database</div>
            <p className="text-[11px] text-slate-400">
              PostgreSQL + PostGIS spatial indexing, event clusters, and audit log tables.
            </p>
          </div>

          {/* Box 5 */}
          <div className="p-4 bg-[#030914] rounded-xl border border-rose-900/40 text-center space-y-2">
            <CloudRain className="w-6 h-6 text-rose-400 mx-auto" />
            <div className="font-bold text-white text-xs">5. Intelligence UI</div>
            <p className="text-[11px] text-slate-400">
              Interactive Leaflet India map, admin moderation panel, and public warning feeds.
            </p>
          </div>
        </div>
      </div>

      {/* Technology Specifications */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
        <div className="p-5 bg-[#061226] border border-[#162c52] rounded-2xl space-y-3">
          <h3 className="text-sm font-bold text-white">Frontend Stack</h3>
          <ul className="space-y-1.5 text-slate-300">
            <li className="flex items-center space-x-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Next.js 14 App Router</span>
            </li>
            <li className="flex items-center space-x-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>TypeScript strict typing</span>
            </li>
            <li className="flex items-center space-x-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Tailwind CSS design system</span>
            </li>
            <li className="flex items-center space-x-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Leaflet geospatial India mapping</span>
            </li>
            <li className="flex items-center space-x-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Lucide-React iconography</span>
            </li>
          </ul>
        </div>

        <div className="p-5 bg-[#061226] border border-[#162c52] rounded-2xl space-y-3">
          <h3 className="text-sm font-bold text-white">Backend & Database</h3>
          <ul className="space-y-1.5 text-slate-300">
            <li className="flex items-center space-x-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-sky-400" />
              <span>Python 3.12 + FastAPI</span>
            </li>
            <li className="flex items-center space-x-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-sky-400" />
              <span>PostgreSQL + PostGIS spatial extension</span>
            </li>
            <li className="flex items-center space-x-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-sky-400" />
              <span>Open-Meteo & IMD radar connectors</span>
            </li>
            <li className="flex items-center space-x-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-sky-400" />
              <span>WebSocket / SSE real-time push</span>
            </li>
          </ul>
        </div>

        <div className="p-5 bg-[#061226] border border-[#162c52] rounded-2xl space-y-3">
          <h3 className="text-sm font-bold text-white">AI / Verification Pipeline</h3>
          <ul className="space-y-1.5 text-slate-300">
            <li className="flex items-center space-x-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
              <span>Sentence-Transformers semantic embeddings</span>
            </li>
            <li className="flex items-center space-x-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
              <span>Perceptual image hashing for duplicate media</span>
            </li>
            <li className="flex items-center space-x-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
              <span>Multi-source Bayesian confidence scoring</span>
            </li>
            <li className="flex items-center space-x-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
              <span>Rumor & misinformation suppression</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
