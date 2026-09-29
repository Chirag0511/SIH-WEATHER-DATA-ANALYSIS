import React from 'react';
import { KPISummary } from '@/types/weather';
import { 
  AlertTriangle, 
  ShieldCheck, 
  Layers, 
  MapPin, 
  Cpu, 
  Users 
} from 'lucide-react';

interface KPICardsProps {
  summary: KPISummary;
}

export default function KPICards({ summary }: KPICardsProps) {
  const cards = [
    {
      label: 'Total Monitored Events',
      value: summary.totalEvents,
      subtext: 'Across 28 States & 8 UTs',
      icon: Layers,
      color: 'text-sky-400',
      border: 'border-sky-500/30',
      bg: 'bg-sky-950/20',
    },
    {
      label: 'Verified Weather Events',
      value: summary.verifiedEvents,
      subtext: `${Math.round((summary.verifiedEvents / summary.totalEvents) * 100)}% verification rate`,
      icon: ShieldCheck,
      color: 'text-emerald-400',
      border: 'border-emerald-500/30',
      bg: 'bg-emerald-950/20',
    },
    {
      label: 'Critical / Red Alerts',
      value: summary.criticalAlerts,
      subtext: 'Immediate action advised',
      icon: AlertTriangle,
      color: 'text-rose-400',
      border: 'border-rose-500/40',
      bg: 'bg-rose-950/30',
      pulse: true,
    },
    {
      label: 'Active Impacted States',
      value: summary.activeStatesCount,
      subtext: 'Regional warning zones',
      icon: MapPin,
      color: 'text-amber-400',
      border: 'border-amber-500/30',
      bg: 'bg-amber-950/20',
    },
    {
      label: 'AI Corroboration Score',
      value: `${summary.averageConfidence}%`,
      subtext: 'Multi-source confidence',
      icon: Cpu,
      color: 'text-indigo-400',
      border: 'border-indigo-500/30',
      bg: 'bg-indigo-950/20',
    },
    {
      label: 'Citizen Ground Truth',
      value: summary.citizenReportsCount,
      subtext: 'Crowdsourced geotags',
      icon: Users,
      color: 'text-cyan-400',
      border: 'border-cyan-500/30',
      bg: 'bg-cyan-950/20',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className={`p-3.5 sm:p-4 rounded-xl border ${card.border} ${card.bg} backdrop-blur-md shadow-lg transition-all hover:scale-[1.02] flex flex-col justify-between`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold text-slate-300 line-clamp-1">
                {card.label}
              </span>
              <Icon className={`w-4 h-4 ${card.color} ${card.pulse ? 'animate-bounce' : ''}`} />
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-black text-white tracking-tight">
                {card.value}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5 truncate">
                {card.subtext}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
