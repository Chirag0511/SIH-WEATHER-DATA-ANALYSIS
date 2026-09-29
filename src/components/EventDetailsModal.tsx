'use client';

import React, { useState, useEffect } from 'react';
import { WeatherEvent } from '@/types/weather';
import { 
  X, 
  MapPin, 
  Clock, 
  ShieldCheck, 
  AlertTriangle, 
  Cpu, 
  Thermometer, 
  Wind, 
  Droplets, 
  Activity,
  Layers,
  FileCheck2,
  ExternalLink,
  Sparkles,
  UserCheck,
  CheckCircle,
  HelpCircle,
  Users,
  Loader2
} from 'lucide-react';
import { fetchAIAnalysisFromBackend, submitVerificationDecision } from '@/lib/api';

interface EventDetailsModalProps {
  event: WeatherEvent | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusUpdated?: (eventId: string, newStatus: string) => void;
}

export default function EventDetailsModal({
  event,
  isOpen,
  onClose,
  onStatusUpdated,
}: EventDetailsModalProps) {
  const [aiData, setAiData] = useState<any>(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<string>('pending_review');
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (event) {
      setCurrentStatus(event.status);
      setActionSuccess(null);
      setLoadingAi(true);

      fetchAIAnalysisFromBackend(event.id).then((data) => {
        setAiData(data);
        setLoadingAi(false);
      });
    }
  }, [event]);

  if (!isOpen || !event) return null;

  const handleReviewerAction = async (newStatus: string) => {
    setActionSuccess(`Updating to ${newStatus.replace('_', ' ')}...`);
    const res = await submitVerificationDecision(event.id, newStatus);
    setCurrentStatus(newStatus);
    setActionSuccess(`Status transitioned to ${newStatus.toUpperCase()}`);
    if (onStatusUpdated) {
      onStatusUpdated(event.id, newStatus);
    }
    setTimeout(() => setActionSuccess(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-3xl max-h-[92vh] overflow-y-auto bg-[#09172e] border border-[#1e3c6d] rounded-2xl shadow-2xl text-slate-200 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-20 flex items-center justify-between p-4 sm:p-5 bg-[#061226]/95 border-b border-[#183157] backdrop-blur-md">
          <div className="flex items-center space-x-2.5">
            <span className={`px-2.5 py-1 rounded text-xs font-black uppercase tracking-wider border ${
              event.severity === 'critical' ? 'bg-red-500/20 text-red-400 border-red-500/40' :
              event.severity === 'high' ? 'bg-orange-500/20 text-orange-400 border-orange-500/40' :
              event.severity === 'moderate' ? 'bg-amber-500/20 text-amber-400 border-amber-500/40' :
              'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
            }`}>
              {event.severity.toUpperCase()} ALERT
            </span>
            <span className="text-xs font-bold text-slate-300 capitalize">
              {event.category.replace('_', ' ')}
            </span>
            <span className="text-xs text-slate-500 font-mono">[{event.id}]</span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 space-y-6">
          {/* Main Title & Description */}
          <div>
            <h2 className="text-lg sm:text-xl font-black text-white leading-snug mb-2">
              {event.title}
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              {event.description}
            </p>
          </div>

          {/* HUMAN DECISION vs AI PREDICTION BANNER */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-[#040e1f] rounded-xl border border-[#162e54] text-xs">
            {/* Left: Official Human Verification Status */}
            <div className="p-3 bg-[#06142c] rounded-lg border border-[#1c3968]">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1 flex items-center space-x-1">
                <UserCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>Human Verification Status (Official)</span>
              </span>
              <div className="flex items-center space-x-2 mt-1">
                <span className={`px-2.5 py-0.5 rounded text-xs font-extrabold uppercase border ${
                  currentStatus === 'verified' ? 'bg-emerald-950 text-emerald-300 border-emerald-500/60' :
                  currentStatus === 'under_review' ? 'bg-blue-950 text-sky-300 border-blue-500/60' :
                  currentStatus === 'flagged' ? 'bg-red-950 text-red-300 border-red-500/60' :
                  'bg-slate-800 text-slate-300 border-slate-600'
                }`}>
                  {currentStatus.replace('_', ' ')}
                </span>
                <span className="text-[11px] text-slate-400">
                  {currentStatus === 'verified' ? 'Officially Corroborated' : 'Pending Reviewer Sign-off'}
                </span>
              </div>
            </div>

            {/* Right: AI Prediction Model Status */}
            <div className="p-3 bg-[#06142c] rounded-lg border border-[#1c3968]">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1 flex items-center space-x-1">
                <Cpu className="w-3.5 h-3.5 text-indigo-400" />
                <span>AI Machine Prediction (Assistance Only)</span>
              </span>
              <div className="flex items-center space-x-2 mt-1">
                <span className="text-xs font-bold text-indigo-300">
                  {aiData?.classification?.predicted_category || event.category.replace('_', ' ').toUpperCase()}
                </span>
                <span className="text-xs font-mono font-bold text-emerald-400">
                  {Math.round((aiData?.classification?.confidence || (event.confidenceScore / 100)) * 100)}% Conf
                </span>
              </div>
            </div>
          </div>

          {/* AI NER Extracted Entities & Location */}
          <div className="p-4 bg-[#051126] rounded-xl border border-[#173059] space-y-2.5 text-xs">
            <h4 className="text-xs font-bold uppercase tracking-wider text-sky-400 flex items-center space-x-1.5">
              <MapPin className="w-4 h-4 text-rose-400" />
              <span>Extracted Geographic Entities & Geocoding</span>
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
              <div>
                <span className="text-slate-400 block text-[10px]">PLACE / LOCALITY</span>
                <strong className="text-white">{aiData?.location_extraction?.place_name || event.location.name}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">DISTRICT</span>
                <strong className="text-white">{aiData?.location_extraction?.district || event.location.district}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">STATE / UT</span>
                <strong className="text-white">{aiData?.location_extraction?.state || event.location.state}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">GPS COORDINATES</span>
                <strong className="text-sky-300 font-mono">
                  {event.location.lat.toFixed(4)}°N, {event.location.lng.toFixed(4)}°E
                </strong>
              </div>
            </div>
            <div className="pt-1 text-[10px] text-slate-500 border-t border-slate-800">
              Extraction Source: <span className="text-slate-400">{aiData?.location_extraction?.geocoding_source || "National Gazetteer NER Engine"}</span>
            </div>
          </div>

          {/* Duplicate / Event Group Cluster Information */}
          <div className="p-3.5 bg-[#061226] rounded-xl border border-[#162c52] space-y-1.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200 flex items-center space-x-1.5">
                <Users className="w-4 h-4 text-cyan-400" />
                <span>Event Grouping & Duplicate Analysis</span>
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                aiData?.deduplication?.duplicate_status === 'possible_duplicate' ? 'bg-amber-950 text-amber-300 border border-amber-500/40' :
                aiData?.deduplication?.duplicate_status === 'related' ? 'bg-blue-950 text-sky-300 border border-blue-500/40' :
                'bg-slate-800 text-slate-300'
              }`}>
                {aiData?.deduplication?.duplicate_status || "independent"}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              {aiData?.deduplication?.duplicate_rationale || "Evaluated with Haversine distance and TF-IDF cosine semantic similarity against regional database reports."}
            </p>
            {aiData?.deduplication?.event_group_id && (
              <div className="text-[10px] font-mono text-cyan-300 pt-0.5">
                Cluster ID: {aiData.deduplication.event_group_id}
              </div>
            )}
          </div>

          {/* AI Evidence Assistance: Supporting vs Conflicting Signals */}
          <div className="p-4 bg-gradient-to-br from-indigo-950/30 via-slate-900 to-blue-950/30 rounded-xl border border-indigo-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-200 flex items-center space-x-1.5">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <span>AI Evidence Evaluation Breakdown</span>
              </h4>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                aiData?.evidence_assistance?.evidence_status === 'supporting' ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40' :
                aiData?.evidence_assistance?.evidence_status === 'conflicting' ? 'bg-red-950 text-red-300 border border-red-500/40' :
                'bg-amber-950 text-amber-300 border border-amber-500/40'
              }`}>
                {aiData?.evidence_assistance?.evidence_status || "supporting"} evidence
              </span>
            </div>

            {/* Signals list */}
            <div className="space-y-1.5 text-xs">
              {aiData?.evidence_assistance?.supporting_signals?.map((sig: string, i: number) => (
                <div key={i} className="flex items-start space-x-2 text-emerald-300/90 text-[11px]">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span>{sig}</span>
                </div>
              ))}
              {aiData?.evidence_assistance?.conflicting_signals?.map((sig: string, i: number) => (
                <div key={i} className="flex items-start space-x-2 text-rose-300/90 text-[11px]">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-400 flex-shrink-0 mt-0.5" />
                  <span>{sig}</span>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-indigo-900/40 text-[11px] text-slate-300">
              <strong className="text-indigo-300">Advisory: </strong>
              {aiData?.evidence_assistance?.ai_reviewer_advisory || "Evidence aligns with regional meteorological synoptic baseline."}
            </div>
          </div>

          {/* Meteorological Instrumental Sensors */}
          {event.metrics && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-2 flex items-center space-x-1.5">
                <Activity className="w-4 h-4 text-sky-400" />
                <span>Station Telemetry Readings</span>
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {event.metrics.precipitationMm !== undefined && (
                  <div className="p-3 bg-[#061124] rounded-lg border border-[#183157] text-center">
                    <Droplets className="w-4 h-4 text-sky-400 mx-auto mb-1" />
                    <span className="text-[10px] text-slate-400 block">Rainfall</span>
                    <span className="text-base font-extrabold text-white">
                      {event.metrics.precipitationMm} mm
                    </span>
                  </div>
                )}
                {event.metrics.windSpeedKmh !== undefined && (
                  <div className="p-3 bg-[#061124] rounded-lg border border-[#183157] text-center">
                    <Wind className="w-4 h-4 text-teal-400 mx-auto mb-1" />
                    <span className="text-[10px] text-slate-400 block">Wind Speed</span>
                    <span className="text-base font-extrabold text-white">
                      {event.metrics.windSpeedKmh} km/h
                    </span>
                  </div>
                )}
                {event.metrics.temperatureC !== undefined && (
                  <div className="p-3 bg-[#061124] rounded-lg border border-[#183157] text-center">
                    <Thermometer className="w-4 h-4 text-amber-400 mx-auto mb-1" />
                    <span className="text-[10px] text-slate-400 block">Temperature</span>
                    <span className="text-base font-extrabold text-white">
                      {event.metrics.temperatureC}°C
                    </span>
                  </div>
                )}
                {event.metrics.humidityPercent !== undefined && (
                  <div className="p-3 bg-[#061124] rounded-lg border border-[#183157] text-center">
                    <Droplets className="w-4 h-4 text-indigo-400 mx-auto mb-1" />
                    <span className="text-[10px] text-slate-400 block">Humidity</span>
                    <span className="text-base font-extrabold text-white">
                      {event.metrics.humidityPercent}%
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* HUMAN REVIEWER ACTION CONTROLS */}
          <div className="p-4 bg-[#040e1f] rounded-xl border border-amber-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-300 flex items-center space-x-1.5 uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4" />
                <span>Authorized Reviewer Decision Console</span>
              </span>
              {actionSuccess && (
                <span className="text-[11px] text-emerald-400 font-semibold">{actionSuccess}</span>
              )}
            </div>
            <p className="text-[11px] text-slate-400">
              AI provides confidence and evidence assistance. The human reviewer makes the final verification decision.
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                onClick={() => handleReviewerAction('verified')}
                className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg text-xs font-bold transition-all shadow"
              >
                Mark Verified (Confirmed)
              </button>
              <button
                onClick={() => handleReviewerAction('under_review')}
                className="px-3.5 py-1.5 bg-blue-700 hover:bg-blue-600 text-white rounded-lg text-xs font-bold transition-all shadow"
              >
                Mark Under Review
              </button>
              <button
                onClick={() => handleReviewerAction('flagged')}
                className="px-3.5 py-1.5 bg-red-800 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition-all shadow"
              >
                Flag as Misleading
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="sticky bottom-0 z-20 p-4 bg-[#061226]/95 border-t border-[#183157] backdrop-blur-md flex items-center justify-between">
          <div className="text-[11px] text-slate-400">
            Audit Log ID: <span className="font-mono text-slate-300">{event.id}</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold transition-colors"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
}
