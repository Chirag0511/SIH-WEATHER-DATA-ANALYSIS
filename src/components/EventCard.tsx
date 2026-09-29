import React from 'react';
import { WeatherEvent } from '@/types/weather';
import { 
  MapPin, 
  Clock, 
  ShieldCheck, 
  AlertTriangle, 
  ExternalLink, 
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
      border: 'border-red-500/60',
      badge: 'bg-red-500/20 text-red-400 border-red-500/40',
      label: 'RED ALERT',
    },
    high: {
      border: 'border-orange-500/50',
      badge: 'bg-orange-500/20 text-orange-400 border-orange-500/40',
      label: 'ORANGE ALERT',
    },
    moderate: {
      border: 'border-amber-500/40',
      badge: 'bg-amber-500/20 text-amber-400 border-amber-500/40',
      label: 'YELLOW ADVISORY',
    },
    low: {
      border: 'border-emerald-500/30',
      badge: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
      label: 'GREEN WATCH',
    },
  }[event.severity];

  // Verification badge
  const statusBadge = {
    verified: {
      bg: 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50',
      text: 'Verified Corroborated',
      icon: ShieldCheck,
    },
    pending_review: {
      bg: 'bg-blue-950/80 text-sky-300 border-blue-500/50',
      text: 'Pending AI Corroboration',
      icon: Clock,
    },
    unverified: {
      bg: 'bg-slate-800 text-slate-300 border-slate-600',
      text: 'Single Source Report',
      icon: Radio,
    },
    flagged: {
      bg: 'bg-red-950/80 text-red-300 border-red-500/60',
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
          ? 'bg-[#102447] border-sky-400 shadow-[0_0_20px_rgba(56,189,248,0.25)] ring-1 ring-sky-400'
          : 'bg-[#09172e] border-[#182e4f] hover:bg-[#0d1f3d] hover:border-blue-500/40 shadow-md'
      }`}
    >
      {/* Top Header: Category, Severity, and Status */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
        <div className="flex items-center space-x-2">
          <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wide border ${severityConfig.badge}`}>
            {severityConfig.label}
          </span>
          <span className="text-xs font-bold text-slate-300 capitalize">
            {event.category.replace('_', ' ')}
          </span>
        </div>

        <div className={`flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-semibold border ${statusBadge.bg}`}>
          <StatusIcon className="w-3 h-3" />
          <span>{statusBadge.text}</span>
        </div>
      </div>

      {/* Title */}
      <h3 className="text-sm font-bold text-white mb-1.5 leading-snug line-clamp-2 hover:text-sky-300 transition-colors">
        {event.title}
      </h3>

      {/* Description */}
      <p className="text-xs text-slate-300 leading-relaxed line-clamp-2 mb-3">
        {event.description}
      </p>

      {/* Location & Time */}
      <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-400 mb-3 gap-y-1">
        <div className="flex items-center space-x-1 truncate max-w-[240px]">
          <MapPin className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />
          <span className="truncate">{event.location.name}, {event.location.state}</span>
        </div>
        <div className="flex items-center space-x-1 flex-shrink-0">
          <Clock className="w-3 h-3 text-slate-500" />
          <span>{event.reportedAt}</span>
        </div>
      </div>

      {/* Confidence Bar & Corroborating sources */}
      <div className="bg-[#051021] p-2.5 rounded-lg border border-[#142846] mb-3">
        <div className="flex items-center justify-between text-[11px] mb-1.5">
          <div className="flex items-center space-x-1.5 text-slate-300">
            <Cpu className="w-3.5 h-3.5 text-sky-400" />
            <span>AI Verification Confidence</span>
          </div>
          <span className={`font-black ${
            event.confidenceScore >= 80 ? 'text-emerald-400' :
            event.confidenceScore >= 50 ? 'text-amber-400' : 'text-rose-400'
          }`}>
            {event.confidenceScore}%
          </span>
        </div>
        <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${
              event.confidenceScore >= 80 ? 'bg-gradient-to-r from-emerald-500 to-teal-400' :
              event.confidenceScore >= 50 ? 'bg-gradient-to-r from-amber-500 to-yellow-400' : 'bg-red-500'
            }`}
            style={{ width: `${Math.max(event.confidenceScore, 5)}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2">
          <span>Primary: <strong className="text-slate-300">{event.source.name}</strong></span>
          <span className="bg-blue-900/40 text-sky-300 px-1.5 py-0.5 rounded border border-blue-700/40">
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
          className="flex-1 flex items-center justify-center space-x-1.5 py-1.5 px-3 bg-blue-600/80 hover:bg-blue-600 text-white rounded-lg text-xs font-semibold shadow transition-all border border-blue-400/40"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Inspect Evidence</span>
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onSelect(event);
          }}
          className="flex items-center justify-center space-x-1 py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium border border-slate-700 transition-colors"
          title="Zoom to location on India map"
        >
          <MapPin className="w-3.5 h-3.5 text-sky-400" />
          <span className="hidden sm:inline">Map</span>
        </button>
      </div>
    </div>
  );
}
