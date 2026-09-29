import React from 'react';
import { FilterState } from '@/types/weather';
import { INDIAN_STATES } from '@/lib/mockWeatherData';
import { Search, RotateCcw, Filter, SlidersHorizontal } from 'lucide-react';

interface FilterBarProps {
  filters: FilterState;
  onFilterChange: (newFilters: FilterState) => void;
  totalFilteredCount: number;
}

export default function FilterBar({ filters, onFilterChange, totalFilteredCount }: FilterBarProps) {
  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ ...filters, searchQuery: e.target.value });
  };

  const handleSelectChange = (key: keyof FilterState, value: string) => {
    onFilterChange({ ...filters, [key]: value });
  };

  const handleReset = () => {
    onFilterChange({
      searchQuery: '',
      category: 'all',
      severity: 'all',
      status: 'all',
      state: 'all',
      dateRange: 'all',
    });
  };

  const isFiltered =
    filters.searchQuery !== '' ||
    filters.category !== 'all' ||
    filters.severity !== 'all' ||
    filters.status !== 'all' ||
    filters.state !== 'all' ||
    filters.dateRange !== 'all';

  return (
    <div className="bg-white dark:bg-[#0b1b36] border border-slate-200 dark:border-[#1d3557] rounded-xl p-3 sm:p-4 shadow-sm dark:shadow-lg mb-4 transition-colors duration-200">
      <div className="flex flex-col gap-3">
        {/* Search bar row */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by location, district, state, or weather keywords (e.g. Mumbai, Cyclone, Landslide)..."
              value={filters.searchQuery}
              onChange={handleTextChange}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-[#061124] border border-slate-300 dark:border-[#1e3a64] rounded-lg text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          <div className="flex items-center space-x-2 self-end sm:self-auto">
            <span className="text-xs text-slate-700 dark:text-slate-300 bg-blue-50 dark:bg-blue-950/80 border border-blue-200 dark:border-blue-800/60 px-3 py-1.5 rounded-lg font-medium whitespace-nowrap">
              <span className="text-blue-700 dark:text-sky-300 font-bold">{totalFilteredCount}</span> Events Active
            </span>
            {isFiltered && (
              <button
                onClick={handleReset}
                className="flex items-center space-x-1 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs transition-colors border border-slate-300 dark:border-slate-700"
                title="Reset all filters"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Dropdown Filters row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 pt-1 text-xs">
          {/* Category */}
          <div>
            <label className="block text-[10px] uppercase font-semibold text-slate-500 dark:text-slate-400 mb-1">
              Weather Event
            </label>
            <select
              value={filters.category}
              onChange={(e) => handleSelectChange('category', e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-[#061124] border border-slate-300 dark:border-[#1e3a64] rounded-md text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Categories</option>
              <option value="cyclone">Cyclone / Storm</option>
              <option value="flood">Flood / Inundation</option>
              <option value="heavy_rainfall">Heavy Rainfall</option>
              <option value="heatwave">Severe Heatwave</option>
              <option value="thunderstorm">Thunderstorm & Lightning</option>
              <option value="landslide">Landslide / Debris</option>
              <option value="cold_wave">Cold Wave</option>
            </select>
          </div>

          {/* Severity */}
          <div>
            <label className="block text-[10px] uppercase font-semibold text-slate-500 dark:text-slate-400 mb-1">
              Severity Level
            </label>
            <select
              value={filters.severity}
              onChange={(e) => handleSelectChange('severity', e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-[#061124] border border-slate-300 dark:border-[#1e3a64] rounded-md text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical (Red Alert)</option>
              <option value="high">High (Orange Alert)</option>
              <option value="moderate">Moderate (Yellow)</option>
              <option value="low">Low Advisory</option>
            </select>
          </div>

          {/* Verification Status */}
          <div>
            <label className="block text-[10px] uppercase font-semibold text-slate-500 dark:text-slate-400 mb-1">
              Verification Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => handleSelectChange('status', e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-[#061124] border border-slate-300 dark:border-[#1e3a64] rounded-md text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Verification</option>
              <option value="verified">Verified (Corroborated)</option>
              <option value="pending_review">Pending Review</option>
              <option value="unverified">Unverified Single Source</option>
              <option value="flagged">Flagged / Misinformation</option>
            </select>
          </div>

          {/* State / UT */}
          <div>
            <label className="block text-[10px] uppercase font-semibold text-slate-500 dark:text-slate-400 mb-1">
              State / Union Territory
            </label>
            <select
              value={filters.state}
              onChange={(e) => handleSelectChange('state', e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-[#061124] border border-slate-300 dark:border-[#1e3a64] rounded-md text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500"
            >
              <option value="all">Pan-India (All States)</option>
              {INDIAN_STATES.map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>
          </div>

          {/* Timeframe */}
          <div className="col-span-2 sm:col-span-1">
            <label className="block text-[10px] uppercase font-semibold text-slate-500 dark:text-slate-400 mb-1">
              Time Window
            </label>
            <select
              value={filters.dateRange}
              onChange={(e) => handleSelectChange('dateRange', e.target.value as any)}
              className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-[#061124] border border-slate-300 dark:border-[#1e3a64] rounded-md text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500"
            >
              <option value="all">Live Active (All)</option>
              <option value="24h">Past 24 Hours</option>
              <option value="7d">Past 7 Days</option>
              <option value="30d">Past 30 Days</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
