'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { WeatherEvent, FilterState, KPISummary } from '@/types/weather';
import { 
  INITIAL_WEATHER_EVENTS, 
  MOCK_KPI_SUMMARY, 
  filterWeatherEvents 
} from '@/lib/mockWeatherData';
import { 
  fetchEventsFromBackend, 
  fetchKPISummaryFromBackend, 
  submitCitizenReportToBackend 
} from '@/lib/api';
import KPICards from '@/components/KPICards';
import FilterBar from '@/components/FilterBar';
import IndiaMap from '@/components/IndiaMap';
import EventCard from '@/components/EventCard';
import EventDetailsModal from '@/components/EventDetailsModal';
import CitizenReportModal from '@/components/CitizenReportModal';
import { 
  Radio, 
  Map, 
  ListFilter, 
  PlusCircle, 
  AlertCircle, 
  Clock, 
  ShieldCheck, 
  Layers,
  Loader2,
  RefreshCw
} from 'lucide-react';

export default function DashboardPage() {
  const [events, setEvents] = useState<WeatherEvent[]>(INITIAL_WEATHER_EVENTS);
  const [kpi, setKpi] = useState<KPISummary>(MOCK_KPI_SUMMARY);
  const [selectedEvent, setSelectedEvent] = useState<WeatherEvent | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isBackendConnected, setIsBackendConnected] = useState(false);

  const [filters, setFilters] = useState<FilterState>({
    searchQuery: '',
    category: 'all',
    severity: 'all',
    status: 'all',
    state: 'all',
    dateRange: 'all',
  });

  // Load from backend on mount
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setIsLoading(true);
      try {
        const [backendEvents, backendKpi] = await Promise.all([
          fetchEventsFromBackend(),
          fetchKPISummaryFromBackend(),
        ]);
        if (isMounted) {
          if (backendEvents && backendEvents.length > 0) {
            setEvents(backendEvents);
            setIsBackendConnected(true);
          }
          if (backendKpi) {
            setKpi(backendKpi);
          }
        }
      } catch (e) {
        console.error('Failed to load initial data:', e);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    loadData();
    return () => { isMounted = false; };
  }, []);

  // Filtered events
  const filteredEvents = useMemo(() => {
    return filterWeatherEvents(events, filters);
  }, [events, filters]);

  // Handle marker click or card click
  const handleSelectEvent = (event: WeatherEvent) => {
    setSelectedEvent(event);
  };

  const handleOpenDetails = (event: WeatherEvent) => {
    setSelectedEvent(event);
    setIsDetailsOpen(true);
  };

  const handleReportSubmitted = async (newEvent: WeatherEvent) => {
    setEvents((prev) => [newEvent, ...prev]);
    setSelectedEvent(newEvent);
    // Refresh KPI
    const updatedKpi = await fetchKPISummaryFromBackend();
    setKpi(updatedKpi);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Dashboard Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-[#142848]">
        <div>
          <div className="flex items-center space-x-2 text-xs text-sky-400 font-bold uppercase tracking-wider mb-1">
            <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span>National Geospatial Weather Operations</span>
            {isBackendConnected && (
              <span className="px-2 py-0.5 bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 rounded text-[10px] lowercase font-mono">
                fastapi + sqlite (1,999 records)
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Live Weather Intelligence & Radar Console
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Pan-India geospatial visualization of verified Doppler data, satellite precipitation grids, and crowdsourced incident feeds.
          </p>
        </div>

        <div className="flex items-center space-x-3 self-stretch sm:self-auto">
          <button
            onClick={() => setIsReportOpen(true)}
            className="flex-1 sm:flex-initial flex items-center justify-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold text-xs rounded-xl shadow-lg border border-orange-400/40 transition-all hover:scale-105"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Submit Citizen Incident</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <KPICards summary={kpi} />

      {/* Filter Bar */}
      <FilterBar
        filters={filters}
        onFilterChange={setFilters}
        totalFilteredCount={filteredEvents.length}
      />

      {/* 2-Column Split: Interactive India Map + Live Events Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Interactive Map (7 cols on lg) */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
            <div className="flex items-center space-x-1.5">
              <Map className="w-4 h-4 text-sky-400" />
              <span>Interactive India Geospatial Layer</span>
            </div>
            <span className="text-[11px] text-slate-400">
              Click pins to inspect or fly to location
            </span>
          </div>

          <IndiaMap
            events={filteredEvents}
            selectedEvent={selectedEvent}
            onSelectEvent={handleSelectEvent}
            onOpenDetails={handleOpenDetails}
          />
        </div>

        {/* Right Column: Events Feed (5 cols on lg) */}
        <div className="lg:col-span-5 xl:col-span-4 flex flex-col space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
            <div className="flex items-center space-x-1.5">
              <ListFilter className="w-4 h-4 text-indigo-400" />
              <span>Active Reports Stream ({filteredEvents.length})</span>
            </div>
            {isLoading ? (
              <span className="text-[11px] text-sky-400 flex items-center space-x-1">
                <Loader2 className="w-3 h-3 animate-spin" />
                <span>Syncing...</span>
              </span>
            ) : (
              <span className="text-[11px] text-emerald-400">
                Live Ingest Active
              </span>
            )}
          </div>

          {/* Scrollable event cards list */}
          <div className="max-h-[580px] overflow-y-auto space-y-3 pr-1">
            {filteredEvents.length === 0 ? (
              <div className="p-8 text-center bg-[#071329] rounded-xl border border-slate-800 text-slate-400 space-y-2">
                <AlertCircle className="w-8 h-8 text-amber-400 mx-auto" />
                <h4 className="text-sm font-bold text-white">No Weather Events Match Current Filters</h4>
                <p className="text-xs text-slate-500">
                  Try adjusting the severity, category, or state filter to view active weather advisories.
                </p>
              </div>
            ) : (
              filteredEvents.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  isSelected={selectedEvent?.id === event.id}
                  onSelect={handleSelectEvent}
                  onOpenDetails={handleOpenDetails}
                />
              ))
            )}
          </div>
        </div>
      </div>

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
