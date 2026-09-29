'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { WeatherEvent, FilterState } from '@/types/weather';
import { 
  INITIAL_WEATHER_EVENTS, 
  filterWeatherEvents 
} from '@/lib/mockWeatherData';
import { fetchEventsFromBackend } from '@/lib/api';
import FilterBar from '@/components/FilterBar';
import EventCard from '@/components/EventCard';
import EventDetailsModal from '@/components/EventDetailsModal';
import { 
  Search, 
  ArrowUpDown, 
  Table, 
  Grid, 
  ShieldCheck, 
  AlertTriangle, 
  Clock, 
  Radio, 
  Eye, 
  Loader2 
} from 'lucide-react';

export default function ExplorerPage() {
  const [events, setEvents] = useState<WeatherEvent[]>(INITIAL_WEATHER_EVENTS);
  const [selectedEvent, setSelectedEvent] = useState<WeatherEvent | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [sortBy, setSortBy] = useState<'confidence' | 'time' | 'severity'>('confidence');
  const [isLoading, setIsLoading] = useState(false);

  const [filters, setFilters] = useState<FilterState>({
    searchQuery: '',
    category: 'all',
    severity: 'all',
    status: 'all',
    state: 'all',
    dateRange: 'all',
  });

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setIsLoading(true);
      try {
        const backendEvents = await fetchEventsFromBackend(filters);
        if (isMounted && backendEvents && backendEvents.length > 0) {
          setEvents(backendEvents);
        }
      } catch (err) {
        console.error('Failed to load explorer events:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    loadData();
    return () => { isMounted = false; };
  }, [filters]);

  const filteredEvents = useMemo(() => {
    const list = filterWeatherEvents(events, filters);
    return [...list].sort((a, b) => {
      if (sortBy === 'confidence') {
        return b.confidenceScore - a.confidenceScore;
      }
      if (sortBy === 'severity') {
        const order = { critical: 4, high: 3, moderate: 2, low: 1 };
        return order[b.severity] - order[a.severity];
      }
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });
  }, [events, filters, sortBy]);

  const handleOpenDetails = (ev: WeatherEvent) => {
    setSelectedEvent(ev);
    setIsDetailsOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-[#142848]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            National Weather Event Explorer
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Browse, filter, and audit verified historical and real-time weather incidents across Indian territories.
          </p>
        </div>

        {/* View mode toggle & sort */}
        <div className="flex items-center space-x-2 text-xs">
          <div className="flex items-center space-x-1 bg-[#061226] border border-[#1a355e] p-1 rounded-lg">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded flex items-center space-x-1 ${
                viewMode === 'table' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
              title="Table View"
            >
              <Table className="w-4 h-4" />
              <span className="hidden sm:inline">Table</span>
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded flex items-center space-x-1 ${
                viewMode === 'cards' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
              title="Cards View"
            >
              <Grid className="w-4 h-4" />
              <span className="hidden sm:inline">Cards</span>
            </button>
          </div>

          <div className="flex items-center space-x-1 bg-[#061226] border border-[#1a355e] px-2.5 py-1.5 rounded-lg text-slate-300">
            <ArrowUpDown className="w-3.5 h-3.5 text-sky-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent text-xs text-white focus:outline-none"
            >
              <option value="confidence" className="bg-[#061226]">Sort by Confidence</option>
              <option value="severity" className="bg-[#061226]">Sort by Severity</option>
              <option value="time" className="bg-[#061226]">Sort by Recency</option>
            </select>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <FilterBar
        filters={filters}
        onFilterChange={setFilters}
        totalFilteredCount={filteredEvents.length}
      />

      {/* Main Content Area */}
      {isLoading ? (
        <div className="py-20 text-center space-y-3">
          <Loader2 className="w-8 h-8 text-sky-400 animate-spin mx-auto" />
          <p className="text-xs text-slate-400">Loading weather intelligence database...</p>
        </div>
      ) : viewMode === 'table' ? (
        <div className="bg-[#07142b] border border-[#162c52] rounded-xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-[#040e1f] text-[10px] uppercase font-bold text-slate-400 border-b border-[#183157] tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Event ID & Title</th>
                  <th className="py-3.5 px-3">Category</th>
                  <th className="py-3.5 px-3">Severity</th>
                  <th className="py-3.5 px-3">Location</th>
                  <th className="py-3.5 px-3">Confidence</th>
                  <th className="py-3.5 px-3">Sources</th>
                  <th className="py-3.5 px-3">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#122442]">
                {filteredEvents.map((event) => (
                  <tr
                    key={event.id}
                    onClick={() => handleOpenDetails(event)}
                    className="hover:bg-[#0c1f3d] transition-colors cursor-pointer group"
                  >
                    <td className="py-3 px-4">
                      <div className="font-bold text-white group-hover:text-sky-300 transition-colors">
                        {event.title}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                        {event.id} • {event.reportedAt}
                      </div>
                    </td>

                    <td className="py-3 px-3 capitalize">
                      {event.category.replace('_', ' ')}
                    </td>

                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase border ${
                        event.severity === 'critical' ? 'bg-red-500/20 text-red-400 border-red-500/40' :
                        event.severity === 'high' ? 'bg-orange-500/20 text-orange-400 border-orange-500/40' :
                        event.severity === 'moderate' ? 'bg-amber-500/20 text-amber-400 border-amber-500/40' :
                        'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                      }`}>
                        {event.severity}
                      </span>
                    </td>

                    <td className="py-3 px-3">
                      <div className="font-medium text-slate-200">{event.location.name}</div>
                      <div className="text-[10px] text-slate-400">{event.location.state}</div>
                    </td>

                    <td className="py-3 px-3">
                      <div className="flex items-center space-x-1.5">
                        <span className={`font-black ${
                          event.confidenceScore >= 80 ? 'text-emerald-400' :
                          event.confidenceScore >= 50 ? 'text-amber-400' : 'text-rose-400'
                        }`}>
                          {event.confidenceScore}%
                        </span>
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <span className="bg-blue-900/30 text-sky-300 border border-blue-700/40 px-2 py-0.5 rounded text-[10px]">
                        {event.corroboratingSourcesCount} Feeds
                      </span>
                    </td>

                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                        event.status === 'verified' ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40' :
                        event.status === 'pending_review' ? 'bg-blue-950/80 text-sky-300 border-blue-500/40' :
                        event.status === 'flagged' ? 'bg-red-950/80 text-red-300 border-red-500/40' :
                        'bg-slate-800 text-slate-300 border-slate-600'
                      }`}>
                        {event.status.replace('_', ' ')}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenDetails(event);
                        }}
                        className="px-2.5 py-1 bg-blue-600/80 hover:bg-blue-600 text-white rounded text-[11px] font-semibold shadow transition-all border border-blue-400/40 inline-flex items-center space-x-1"
                      >
                        <Eye className="w-3 h-3" />
                        <span>Inspect</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEvents.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              isSelected={selectedEvent?.id === event.id}
              onSelect={handleOpenDetails}
              onOpenDetails={handleOpenDetails}
            />
          ))}
        </div>
      )}

      {/* Details Modal */}
      <EventDetailsModal
        event={selectedEvent}
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
      />
    </div>
  );
}
