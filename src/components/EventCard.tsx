import React from 'react';
import { WeatherEvent } from '@/types/weather';
import { 
  MapPin, 
  Clock, 
  ShieldCheck, 
  AlertTriangle, 
  Layers, 
  Cpu, 
  Radio, 
  Eye 
} from 'lucide-react';

interface EventCardProps {
  event: WeatherEvent;
  isSelected?: boolean;
  onSelect: (event: WeatherEvent) => void;
  onOpenDetails: (event: WeatherEvent) => void;
}

export default function EventCard({
  event,
  isSelected = false,
  onSelect,
  onOpenDetails,
}: EventCardProps) {
  // Severity styling
  const severityConfig = {
    critical: {
      border: 'border-red-500',
      badge: 'bg-red-500/10 text-red-700 dark:bg-red-500/20 dark:text-red-400 border-red-500/40',
      label: 'RED ALERT',
    },
    high: {
      border: 'border-orange-500',
      badge: 'bg-orange-500/10 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400 border-orange-500/40',
      label: 'ORANGE ALERT',
    },
    moderate: {
      border: 'border-amber-500',
      badge: 'bg-amber-500/10 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 border-amber-500/40',
      label: 'YELLOW ADVISORY',
    },
    low: {
      border: 'border-emerald-500',
      badge: 'bg-emerald-500/10 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 border-emerald-500/40',
      label: 'GREEN WATCH',
    },
  }[event.severity];

  // Verification badge
  const statusBadge = {
    verified: {
      bg: 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-500/50',
      text: 'Verified Corroborated',
      icon: ShieldCheck,
    },
    pending_review: {
      bg: 'bg-blue-50 text-blue-700 border-blue-300 dark:bg-blue-950/80 dark:text-sky-300 dark:border-blue-500/50',
      text: 'Pending AI Corroboration',
      icon: Clock,
    },
    unverified: {
      bg: 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-600',
      text: 'Single Source Report',
      icon: Radio,
    },
    flagged: {
      bg: 'bg-red-50 text-red-700 border-red-300 dark:bg-red-950/80 dark:text-red-300 dark:border-red-500/60',
      text: 'Flagged / Misleading Claim',
      icon: AlertTriangle,
    },
  }[event.status];

  const StatusIcon = statusBadge.icon;

  return (
    <div
      onClick={() => onSelect(event)}
      className={`p-4 rounded-xl border transition-all cursor-pointer ${
        isSelected
          ? 'bg-blue-50/90 border-blue-500 shadow-md dark:bg-[#102447] dark:border-sky-400 dark:shadow-[0_0_20px_rgba(56,189,248,0.25)] ring-1 ring-blue-500 dark:ring-sky-400'
          : 'bg-white border-slate-200 hover:border-blue-300 hover:shadow-md dark:bg-[#09172e] dark:border-[#182e4f] dark:hover:bg-[#0d1f3d] dark:hover:border-blue-500/40 shadow-sm'
      }`}
    >
      {/* Top Header: Category, Severity, and Status */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
        <div className="flex items-center space-x-2">
          <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wide border ${severityConfig.badge}`}>
            {severityConfig.label}
          </span>
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 capitalize">
            {event.category.replace('_', ' ')}
          </span>
        </div>

        <div className={`flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-semibold border ${statusBadge.bg}`}>
          <StatusIcon className="w-3 h-3" />
          <span>{statusBadge.text}</span>
        </div>
      </div>

      {/* Title */}
      <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1.5 leading-snug line-clamp-2 hover:text-blue-600 dark:hover:text-sky-300 transition-colors">
        {event.title}
      </h3>

      {/* Description */}
      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-2 mb-3">
        {event.description}
      </p>

      {/* Location & Time */}
      <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mb-3 gap-y-1">
        <div className="flex items-center space-x-1 truncate max-w-[240px]">
          <MapPin className="w-3.5 h-3.5 text-rose-500 dark:text-rose-400 flex-shrink-0" />
          <span className="truncate">{event.location.name}, {event.location.state}</span>
        </div>
        <div className="flex items-center space-x-1 flex-shrink-0">
          <Clock className="w-3 h-3 text-slate-400 dark:text-slate-500" />
          <span>{event.reportedAt}</span>
        </div>
      </div>

      {/* Confidence Bar & Corroborating sources */}
      <div className="bg-slate-50 dark:bg-[#051021] p-2.5 rounded-lg border border-slate-200 dark:border-[#142846] mb-3">
        <div className="flex items-center justify-between text-[11px] mb-1.5">
          <div className="flex items-center space-x-1.5 text-slate-700 dark:text-slate-300">
            <Cpu className="w-3.5 h-3.5 text-blue-600 dark:text-sky-400" />
            <span>AI Verification Confidence</span>
          </div>
          <span className={`font-black ${
            event.confidenceScore >= 80 ? 'text-emerald-600 dark:text-emerald-400' :
            event.confidenceScore >= 50 ? 'text-amber-600 dark:text-amber-400' : 'text-rose-600 dark:text-rose-400'
          }`}>
            {event.confidenceScore}%
          </span>
        </div>
        <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${
              event.confidenceScore >= 80 ? 'bg-gradient-to-r from-emerald-500 to-teal-400' :
              event.confidenceScore >= 50 ? 'bg-gradient-to-r from-amber-500 to-yellow-400' : 'bg-red-500'
            }`}
            style={{ width: `${Math.max(event.confidenceScore, 5)}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 mt-2">
          <span>Primary: <strong className="text-slate-700 dark:text-slate-300">{event.source.name}</strong></span>
          <span className="bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-sky-300 px-1.5 py-0.5 rounded border border-blue-300 dark:border-blue-700/40">
            {event.corroboratingSourcesCount} Corroborating Sources
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center space-x-2 pt-1">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onOpenDetails(event);
          }}
          className="flex-1 flex items-center justify-center space-x-1.5 py-1.5 px-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-sm transition-all"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Inspect Evidence</span>
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onSelect(event);
          }}
          className="flex items-center justify-center space-x-1 py-1.5 px-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-medium border border-slate-300 dark:border-slate-700 transition-colors"
          title="Zoom to location on India map"
        >
          <MapPin className="w-3.5 h-3.5 text-blue-600 dark:text-sky-400" />
          <span className="hidden sm:inline">Map</span>
        </button>
      </div>
    </div>
  );
}
