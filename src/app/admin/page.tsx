'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Filter, 
  Search, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Clock, 
  Eye, 
  GitMerge, 
  FileText, 
  MapPin, 
  Layers, 
  User, 
  LogOut, 
  ExternalLink,
  ChevronRight,
  Sparkles,
  Database,
  ArrowUpRight,
  SlidersHorizontal,
  Info
} from 'lucide-react';
import { 
  getAuthUser, 
  clearAuthSession, 
  fetchAdminStats, 
  fetchReviewQueue, 
  submitAdminAction, 
  mergeDuplicateReports 
} from '@/lib/api';

export default function AdminPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [queueItems, setQueueItems] = useState<any[]>([]);
  const [totalMatched, setTotalMatched] = useState(0);
  const [recentActions, setRecentActions] = useState<any[]>([]);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('pending_review');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSource, setSelectedSource] = useState('all');

  // Selected report for review modal
  const [activeReport, setActiveReport] = useState<any | null>(null);
  const [reviewerNotes, setReviewerNotes] = useState('');
  const [actionInProgress, setActionInProgress] = useState(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  // Merge modal state
  const [mergeModalOpen, setMergeModalOpen] = useState(false);
  const [mergePrimaryReport, setMergePrimaryReport] = useState<any | null>(null);
  const [mergeTargetIds, setMergeTargetIds] = useState<string>('');
  const [mergeTitle, setMergeTitle] = useState('');

  // Load auth user
  useEffect(() => {
    const user = getAuthUser();
    if (!user) {
      router.push('/admin/login');
      return;
    }
    setCurrentUser(user);
  }, [router]);

  // Load Admin Stats & Review Queue
  const loadDashboardData = useCallback(async () => {
    if (!getAuthUser()) return;
    setRefreshing(true);
    try {
      const [statsData, queueData] = await Promise.all([
        fetchAdminStats().catch(() => null),
        fetchReviewQueue({
          status: selectedStatus,
          category: selectedCategory,
          priority: selectedPriority,
          source_type: selectedSource,
          search: search,
          limit: '50'
        }).catch(() => ({ total_matched: 0, items: [] }))
      ]);

      if (statsData) {
        setStats(statsData.stats);
        if (statsData.recent_actions) {
          setRecentActions(statsData.recent_actions);
        }
      }
      if (queueData) {
        setQueueItems(queueData.items || []);
        setTotalMatched(queueData.total_matched || 0);
      }
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedStatus, selectedCategory, selectedPriority, selectedSource, search]);

  useEffect(() => {
    if (currentUser) {
      loadDashboardData();
    }
  }, [currentUser, loadDashboardData]);

  const handleLogout = () => {
    clearAuthSession();
    router.push('/admin/login');
  };

  const handleDecision = async (action: string) => {
    if (!activeReport) return;
    setActionInProgress(true);
    try {
      await submitAdminAction(
        activeReport.id,
        action,
        reviewerNotes || `Action '${action}' recorded by ${currentUser?.name || 'Authorized Officer'}`
      );
      setActionSuccessMsg(`Successfully updated report #${activeReport.id} to status: ${action}`);
      setTimeout(() => {
        setActionSuccessMsg(null);
        setActiveReport(null);
        setReviewerNotes('');
      }, 1400);
      loadDashboardData();
    } catch (err: any) {
      alert(`Action failed: ${err.message || 'Error updating report'}`);
    } finally {
      setActionInProgress(false);
    }
  };

  const handleMergeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mergePrimaryReport || !mergeTargetIds.trim()) return;
    setActionInProgress(true);
    try {
      const targets = mergeTargetIds
        .split(',')
        .map(t => t.trim())
        .filter(Boolean);
      await mergeDuplicateReports(
        mergePrimaryReport.id,
        targets,
        mergeTitle || `Consolidated Weather Event: ${mergePrimaryReport.title}`
      );
      alert(`Successfully consolidated ${targets.length} report(s) into primary event #${mergePrimaryReport.id}`);
      setMergeModalOpen(false);
      setMergePrimaryReport(null);
      setMergeTargetIds('');
      setMergeTitle('');
      loadDashboardData();
    } catch (err: any) {
      alert(`Merge failed: ${err.message || 'Error consolidating reports'}`);
    } finally {
      setActionInProgress(false);
    }
  };

  if (!currentUser && loading) {
    return (
      <div className="min-h-screen bg-[#071329] flex items-center justify-center text-white">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-400 mx-auto mb-3" />
          <p className="text-sm text-slate-300">Checking verification authorizations...</p>
        </div>
      </div>
    );
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return <span className="px-2 py-0.5 text-[11px] font-bold rounded bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse">URGENT</span>;
      case 'high':
        return <span className="px-2 py-0.5 text-[11px] font-semibold rounded bg-orange-500/20 text-orange-400 border border-orange-500/30">HIGH</span>;
      case 'normal':
        return <span className="px-2 py-0.5 text-[11px] font-medium rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">NORMAL</span>;
      default:
        return <span className="px-2 py-0.5 text-[11px] font-medium rounded bg-slate-700 text-slate-400">LOW</span>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return <span className="px-2 py-0.5 text-[11px] font-semibold rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1 w-fit"><CheckCircle2 className="w-3 h-3" /> Verified</span>;
      case 'under_review':
        return <span className="px-2 py-0.5 text-[11px] font-semibold rounded bg-sky-500/20 text-sky-300 border border-sky-500/30 flex items-center gap-1 w-fit"><Clock className="w-3 h-3" /> Investigating</span>;
      case 'flagged':
        return <span className="px-2 py-0.5 text-[11px] font-semibold rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1 w-fit"><AlertTriangle className="w-3 h-3" /> Flagged</span>;
      case 'rejected':
        return <span className="px-2 py-0.5 text-[11px] font-semibold rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1 w-fit"><XCircle className="w-3 h-3" /> Rejected</span>;
      case 'duplicate':
        return <span className="px-2 py-0.5 text-[11px] font-semibold rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1 w-fit"><GitMerge className="w-3 h-3" /> Duplicate</span>;
      default:
        return <span className="px-2 py-0.5 text-[11px] font-semibold rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1 w-fit"><Clock className="w-3 h-3" /> Pending</span>;
    }
  };

  return (
    <div className="min-h-screen bg-[#071329] text-white">
      {/* Top Banner & Header */}
      <div className="border-b border-slate-800 bg-[#091838]/80 backdrop-blur-md sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-blue-600/30 border border-blue-500/50 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-sky-400" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-base sm:text-lg font-bold text-white tracking-wide">
                  Weather Intelligence Operations Console
                </h1>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-blue-500/20 text-sky-300 border border-blue-500/30">
                  SIH 2026 Admin
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Human-in-the-Loop Verification, Review Queue, and Deduplication Control
              </p>
            </div>
          </div>

          {/* User profile & actions */}
          <div className="flex items-center space-x-3">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-semibold text-white flex items-center justify-end space-x-1">
                <span>{currentUser?.name || 'Officer'}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono uppercase ${currentUser?.role === 'admin' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'}`}>
                  {currentUser?.role || 'reviewer'}
                </span>
              </div>
              <div className="text-[11px] text-slate-400 font-mono">{currentUser?.email}</div>
            </div>

            <button
              onClick={loadDashboardData}
              disabled={refreshing}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-all flex items-center text-xs"
              title="Refresh queue"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-sky-400' : ''}`} />
            </button>

            <button
              onClick={handleLogout}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-800/40 text-xs font-medium transition-all"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          <div className="bg-[#0b1c3d] p-3.5 rounded-xl border border-slate-800/80">
            <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Total Reports</div>
            <div className="text-xl font-bold text-white mt-1">{stats?.total_reports ?? '...'}</div>
            <div className="text-[10px] text-sky-400 mt-0.5">Ingested Database</div>
          </div>

          <div className="bg-[#0b1c3d] p-3.5 rounded-xl border border-amber-500/30">
            <div className="text-[11px] font-medium text-amber-400 uppercase tracking-wider">Pending Review</div>
            <div className="text-xl font-bold text-amber-300 mt-1">{stats?.pending_reports ?? '...'}</div>
            <div className="text-[10px] text-amber-400/80 mt-0.5">Awaiting Decision</div>
          </div>

          <div className="bg-[#0b1c3d] p-3.5 rounded-xl border border-red-500/30">
            <div className="text-[11px] font-medium text-red-400 uppercase tracking-wider">Urgent Priority</div>
            <div className="text-xl font-bold text-red-400 mt-1">{stats?.urgent_priority ?? '0'}</div>
            <div className="text-[10px] text-red-400/80 mt-0.5">Critical Severity</div>
          </div>

          <div className="bg-[#0b1c3d] p-3.5 rounded-xl border border-sky-500/30">
            <div className="text-[11px] font-medium text-sky-400 uppercase tracking-wider">Under Review</div>
            <div className="text-xl font-bold text-sky-300 mt-1">{stats?.under_review ?? '...'}</div>
            <div className="text-[10px] text-sky-400/80 mt-0.5">Telemetry In Query</div>
          </div>

          <div className="bg-[#0b1c3d] p-3.5 rounded-xl border border-emerald-500/30">
            <div className="text-[11px] font-medium text-emerald-400 uppercase tracking-wider">Verified</div>
            <div className="text-xl font-bold text-emerald-300 mt-1">{stats?.verified_reports ?? '...'}</div>
            <div className="text-[10px] text-emerald-400/80 mt-0.5">Ground Truth Pubs</div>
          </div>

          <div className="bg-[#0b1c3d] p-3.5 rounded-xl border border-purple-500/30">
            <div className="text-[11px] font-medium text-purple-400 uppercase tracking-wider">Duplicates</div>
            <div className="text-xl font-bold text-purple-300 mt-1">{stats?.duplicate_reports ?? '...'}</div>
            <div className="text-[10px] text-purple-400/80 mt-0.5">Merged Clusters</div>
          </div>

          <div className="bg-[#0b1c3d] p-3.5 rounded-xl border border-rose-500/30">
            <div className="text-[11px] font-medium text-rose-400 uppercase tracking-wider">Rejected / Flags</div>
            <div className="text-xl font-bold text-rose-300 mt-1">{(stats?.rejected_reports || 0) + (stats?.flagged_reports || 0)}</div>
            <div className="text-[10px] text-rose-400/80 mt-0.5">Spam / Anomalies</div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-[#0b1c3d] p-4 rounded-xl border border-slate-800 space-y-3">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by Report ID, Title, City, District, State..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="bg-slate-900 border border-slate-700 text-xs text-white rounded-lg px-2.5 py-2 focus:outline-none"
              >
                <option value="all">All Verification Statuses</option>
                <option value="pending_review">Pending Review</option>
                <option value="under_review">Under Review</option>
                <option value="verified">Verified</option>
                <option value="flagged">Flagged</option>
                <option value="rejected">Rejected</option>
                <option value="duplicate">Duplicate</option>
              </select>

              <select
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value)}
                className="bg-slate-900 border border-slate-700 text-xs text-white rounded-lg px-2.5 py-2 focus:outline-none"
              >
                <option value="all">All AI Priorities</option>
                <option value="urgent">Urgent Priority</option>
                <option value="high">High Priority</option>
                <option value="normal">Normal Priority</option>
                <option value="low">Low Priority</option>
              </select>

              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-slate-900 border border-slate-700 text-xs text-white rounded-lg px-2.5 py-2 focus:outline-none"
              >
                <option value="all">All Weather Categories</option>
                <option value="Rainfall">Rainfall</option>
                <option value="Flooding">Flooding</option>
                <option value="Thunderstorm">Thunderstorm</option>
                <option value="Heatwave">Heatwave</option>
                <option value="Fog">Fog</option>
                <option value="Dust storm">Dust storm</option>
                <option value="Strong winds">Strong winds</option>
              </select>

              <select
                value={selectedSource}
                onChange={(e) => setSelectedSource(e.target.value)}
                className="bg-slate-900 border border-slate-700 text-xs text-white rounded-lg px-2.5 py-2 focus:outline-none"
              >
                <option value="all">All Source Types</option>
                <option value="citizen">Citizen Submissions</option>
                <option value="synoptic_dataset">Synoptic Datasets</option>
                <option value="openmeteo">Open-Meteo Feeds</option>
                <option value="social">Social Radar</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 pt-1 border-t border-slate-800/60">
            <div>
              Showing <span className="text-white font-semibold">{queueItems.length}</span> reports 
              (Total matched: <span className="text-sky-300 font-semibold">{totalMatched}</span>)
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Live Triage Sync</span>
            </div>
          </div>
        </div>

        {/* Review Queue Table */}
        <div className="bg-[#0b1c3d] rounded-xl border border-slate-800 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/90 text-slate-300 uppercase tracking-wider text-[11px] border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Report ID</th>
                  <th className="py-3 px-4">Hazard / Title</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Source</th>
                  <th className="py-3 px-4">AI Corroboration</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {queueItems.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400">
                      <div className="max-w-xs mx-auto">
                        <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2 opacity-80" />
                        <p className="font-semibold text-slate-200">No reports matching filter</p>
                        <p className="text-[11px] text-slate-500 mt-1">Review queue is clean or filters are too restrictive.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  queueItems.map((item) => (
                    <tr 
                      key={item.id}
                      className="hover:bg-slate-800/50 transition-colors group cursor-pointer"
                      onClick={() => setActiveReport(item)}
                    >
                      <td className="py-3 px-4 font-mono font-bold text-sky-400">
                        {item.id}
                      </td>
                      <td className="py-3 px-4 max-w-xs">
                        <div className="font-medium text-white truncate">{item.title}</div>
                        <div className="flex items-center space-x-1.5 mt-0.5">
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 border border-slate-700">
                            {item.category}
                          </span>
                          <span className={`text-[10px] uppercase font-semibold ${item.severity === 'critical' ? 'text-red-400' : item.severity === 'severe' ? 'text-orange-400' : 'text-slate-400'}`}>
                            • {item.severity}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-white font-medium">{item.district || item.location_name}</div>
                        <div className="text-[11px] text-slate-400">{item.state}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-slate-200">{item.source_name}</div>
                        <div className="text-[10px] text-slate-400 uppercase font-mono">{item.source_type}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-1 text-slate-200">
                          <Sparkles className="w-3 h-3 text-sky-400" />
                          <span>{item.ai?.predicted_category}</span>
                          <span className="text-[10px] text-slate-400 font-mono">({Math.round((item.ai?.confidence || 0) * 100)}%)</span>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          Evidence: <span className="font-semibold text-slate-300">{item.ai?.evidence_status}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {getPriorityBadge(item.ai?.risk_priority || 'normal')}
                      </td>
                      <td className="py-3 px-4">
                        {getStatusBadge(item.status)}
                      </td>
                      <td className="py-3 px-4 text-right space-x-2" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => setActiveReport(item)}
                          className="px-2.5 py-1 rounded bg-blue-600/30 hover:bg-blue-600/50 text-sky-300 border border-blue-500/40 text-[11px] font-semibold transition-all inline-flex items-center space-x-1"
                        >
                          <Eye className="w-3 h-3" />
                          <span>Triage</span>
                        </button>
                        {currentUser?.role === 'admin' && (
                          <button
                            onClick={() => {
                              setMergePrimaryReport(item);
                              setMergeTitle(`Consolidated Event: ${item.title}`);
                              setMergeModalOpen(true);
                            }}
                            className="px-2 py-1 rounded bg-purple-600/20 hover:bg-purple-600/40 text-purple-300 border border-purple-500/30 text-[11px] transition-all inline-flex items-center"
                            title="Merge duplicates"
                          >
                            <GitMerge className="w-3 h-3" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Audit Trail & Verification History */}
        <div className="bg-[#0b1c3d] p-5 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <FileText className="w-4 h-4 text-sky-400" />
              <h2 className="text-sm font-bold text-white tracking-wide">
                Recent Human Verification Decisions & Audit Log
              </h2>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">Immutable Compliance Trail</span>
          </div>

          <div className="space-y-2">
            {recentActions.length === 0 ? (
              <p className="text-xs text-slate-500 py-3 text-center">No verification decisions logged yet in this session.</p>
            ) : (
              recentActions.map((log) => (
                <div 
                  key={log.id}
                  className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs gap-2"
                >
                  <div className="flex items-center space-x-3">
                    <span className="font-mono font-bold text-sky-400">{log.report_id}</span>
                    <span className="text-slate-400">&bull;</span>
                    <span className="text-slate-300">{log.reviewer}</span>
                    <span className="text-slate-400">&bull;</span>
                    <div className="flex items-center space-x-1.5">
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 line-through">
                        {log.previous_status}
                      </span>
                      <span className="text-slate-500">&rarr;</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold">
                        {log.new_status}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 text-slate-400 text-[11px]">
                    <span className="italic truncate max-w-xs">{log.notes}</span>
                    <span className="font-mono text-slate-500">{log.timestamp}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Human Decision Modal / Drawer */}
      {activeReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#0b1c3d] border border-slate-700 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 relative">
            <button
              onClick={() => setActiveReport(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg bg-slate-800"
            >
              <XCircle className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-2 text-xs font-mono text-sky-400 mb-2">
              <ShieldCheck className="w-4 h-4" />
              <span>OFFICIAL TRIAGE WORKFLOW &bull; REPORT #{activeReport.id}</span>
            </div>

            <h2 className="text-lg font-bold text-white mb-1">{activeReport.title}</h2>
            <div className="flex flex-wrap items-center gap-2 mb-4 text-xs">
              <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                {activeReport.category}
              </span>
              <span className="text-slate-400 font-medium">
                {activeReport.district}, {activeReport.state} ({activeReport.location_name})
              </span>
              <span className="text-slate-500">&bull;</span>
              <span className="text-slate-400">{activeReport.reported_at || 'Recent'}</span>
            </div>

            {/* AI Assistant Telemetry Corroboration Card */}
            <div className="bg-slate-900/90 rounded-xl p-4 border border-blue-900/60 mb-5 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center space-x-1.5 text-xs font-semibold text-sky-300">
                  <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                  <span>AI Verification Assistance & Corroboration</span>
                </div>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-blue-500/10 text-sky-300 border border-blue-500/20">
                  Advisory Only
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <div className="text-slate-400 text-[11px]">NLP Category Match</div>
                  <div className="font-semibold text-white mt-0.5">
                    {activeReport.ai?.predicted_category}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    Confidence: {Math.round((activeReport.ai?.confidence || 0) * 100)}%
                  </div>
                </div>

                <div>
                  <div className="text-slate-400 text-[11px]">Physical Telemetry</div>
                  <div className="font-semibold text-emerald-400 mt-0.5 capitalize">
                    {activeReport.ai?.evidence_status || 'Supporting'}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    Matches synoptic pressure/rain
                  </div>
                </div>

                <div>
                  <div className="text-slate-400 text-[11px]">Cluster Deduplication</div>
                  <div className="font-semibold text-sky-400 mt-0.5 capitalize">
                    {activeReport.ai?.duplicate_status || 'Independent'}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    20 km geo-window check
                  </div>
                </div>
              </div>

              <div className="text-[11px] text-slate-300 bg-slate-800/60 p-2.5 rounded-lg border border-slate-700/50 flex items-start space-x-2">
                <Info className="w-4 h-4 text-sky-400 flex-shrink-0 mt-0.5" />
                <span>
                  <strong>SIH Verification Protocol:</strong> The AI model cross-referenced telemetry from local automatic weather stations (AWS) and Indian gazetteer entities. Human sign-off is required to publish or reject.
                </span>
              </div>
            </div>

            {/* Success Message Banner */}
            {actionSuccessMsg && (
              <div className="mb-4 p-3 rounded-lg bg-emerald-950/60 border border-emerald-500/50 text-emerald-200 text-xs flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>{actionSuccessMsg}</span>
              </div>
            )}

            {/* Reviewer Notes Field */}
            <div className="mb-5">
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Officer Verification Rationale & Audit Notes
              </label>
              <textarea
                rows={2}
                value={reviewerNotes}
                onChange={(e) => setReviewerNotes(e.target.value)}
                placeholder="e.g. Corroborated with district disaster management authority (DDMA) advisory..."
                className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Human Decision Action Buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <button
                type="button"
                disabled={actionInProgress}
                onClick={() => handleDecision('verify')}
                className="py-2.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-900/30 flex items-center justify-center space-x-1.5 transition-all disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Verify & Publish</span>
              </button>

              <button
                type="button"
                disabled={actionInProgress}
                onClick={() => handleDecision('under_review')}
                className="py-2.5 px-3 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow-lg shadow-sky-900/30 flex items-center justify-center space-x-1.5 transition-all disabled:opacity-50"
              >
                <Clock className="w-4 h-4" />
                <span>Under Review</span>
              </button>

              <button
                type="button"
                disabled={actionInProgress}
                onClick={() => handleDecision('flag')}
                className="py-2.5 px-3 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold shadow-lg shadow-amber-900/30 flex items-center justify-center space-x-1.5 transition-all disabled:opacity-50"
              >
                <AlertTriangle className="w-4 h-4" />
                <span>Flag Anomaly</span>
              </button>

              <button
                type="button"
                disabled={actionInProgress}
                onClick={() => handleDecision('reject')}
                className="py-2.5 px-3 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-lg shadow-rose-900/30 flex items-center justify-center space-x-1.5 transition-all disabled:opacity-50"
              >
                <XCircle className="w-4 h-4" />
                <span>Reject Report</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Duplicate Consolidation Merge Modal */}
      {mergeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#0b1c3d] border border-slate-700 rounded-2xl max-w-lg w-full p-6 relative">
            <button
              onClick={() => setMergeModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg bg-slate-800"
            >
              <XCircle className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-2 text-xs font-mono text-purple-400 mb-2">
              <GitMerge className="w-4 h-4" />
              <span>DUPLICATE INCIDENT MERGE WORKFLOW</span>
            </div>

            <h2 className="text-base font-bold text-white mb-2">
              Consolidate Duplicate Reports
            </h2>
            <p className="text-xs text-slate-400 mb-4">
              Group multiple nearby or redundant reports into a single canonical event. Target reports will be marked as <code className="text-purple-300">duplicate</code> while preserving their evidence.
            </p>

            <form onSubmit={handleMergeSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Primary Canonical Report ID
                </label>
                <input
                  type="text"
                  disabled
                  value={mergePrimaryReport?.id || ''}
                  className="w-full p-2 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono text-sky-300 opacity-80"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Target Duplicate Report IDs (comma-separated)
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CIT-49201, SYN-1004"
                  value={mergeTargetIds}
                  onChange={(e) => setMergeTargetIds(e.target.value)}
                  className="w-full p-2 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Unified Event Group Title
                </label>
                <input
                  type="text"
                  value={mergeTitle}
                  onChange={(e) => setMergeTitle(e.target.value)}
                  placeholder="e.g. Cyclone Asani Intense Coastal Inundation"
                  className="w-full p-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setMergeModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-xs text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionInProgress}
                  className="px-4 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-xs font-semibold text-white shadow-md transition-all flex items-center space-x-1"
                >
                  <GitMerge className="w-3.5 h-3.5 mr-1" />
                  <span>Consolidate Reports</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
