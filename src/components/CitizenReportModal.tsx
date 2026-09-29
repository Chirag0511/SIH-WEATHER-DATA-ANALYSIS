'use client';

import React, { useState } from 'react';
import { WeatherCategory, SeverityLevel, WeatherEvent } from '@/types/weather';
import { INDIAN_STATES } from '@/lib/mockWeatherData';
import { 
  X, 
  MapPin, 
  Upload, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  Compass, 
  ShieldCheck,
  Camera
} from 'lucide-react';

interface CitizenReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReportSubmitted: (newEvent: WeatherEvent) => void;
}

export default function CitizenReportModal({
  isOpen,
  onClose,
  onReportSubmitted,
}: CitizenReportModalProps) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<WeatherCategory>('heavy_rainfall');
  const [severity, setSeverity] = useState<SeverityLevel>('moderate');
  const [description, setDescription] = useState('');
  const [state, setState] = useState(INDIAN_STATES[0]);
  const [district, setDistrict] = useState('');
  const [locationName, setLocationName] = useState('');
  const [lat, setLat] = useState<number | ''>('');
  const [lng, setLng] = useState<number | ''>('');
  const [reporterName, setReporterName] = useState('');
  const [reporterContact, setReporterContact] = useState('');
  const [locating, setLocating] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{ [k: string]: string }>({});

  if (!isOpen) return null;

  // Auto-detect browser location
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(Number(pos.coords.latitude.toFixed(4)));
        setLng(Number(pos.coords.longitude.toFixed(4)));
        setLocating(false);
      },
      (err) => {
        alert('Could not retrieve GPS coordinates: ' + err.message);
        setLocating(false);
      }
    );
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPhotoPreview(url);
    }
  };

  const validateForm = () => {
    const errors: { [k: string]: string } = {};
    if (!title.trim() || title.trim().length < 6) {
      errors.title = 'Title must be at least 6 characters long.';
    }
    if (!description.trim() || description.trim().length < 15) {
      errors.description = 'Please describe the incident in at least 15 characters.';
    }
    if (!district.trim()) {
      errors.district = 'District is required for administrative routing.';
    }
    if (!locationName.trim()) {
      errors.locationName = 'Specific landmark or village/town is required.';
    }
    if (lat === '' || lng === '' || isNaN(Number(lat)) || isNaN(Number(lng))) {
      errors.coords = 'Valid GPS coordinates (latitude & longitude) are required.';
    }
    if (!reporterName.trim()) {
      errors.reporterName = 'Reporter name is required for citizen accountability.';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const { submitCitizenReportToBackend } = await import('@/lib/api');
      const backendEvent = await submitCitizenReportToBackend({
        title: title.trim(),
        category,
        severity,
        description: description.trim(),
        state,
        district: district.trim(),
        locationName: locationName.trim(),
        latitude: Number(lat),
        longitude: Number(lng),
        reporterName: reporterName.trim(),
        reporterContact: reporterContact.trim(),
        mediaFileUrl: photoPreview || undefined,
        observedAt: new Date().toISOString()
      });
      onReportSubmitted(backendEvent);
    } catch (err) {
      console.warn('Backend submission error, generating client event:', err);
      // Fallback
      const newEvent: WeatherEvent = {
        id: `CIT-${Date.now().toString().slice(-5)}`,
        title: title.trim(),
        description: description.trim(),
        category,
        severity,
        status: 'pending_review',
        confidenceScore: 65,
        location: {
          name: locationName.trim(),
          district: district.trim(),
          state,
          lat: Number(lat),
          lng: Number(lng),
        },
        timestamp: new Date().toISOString(),
        reportedAt: 'Just now',
        source: {
          id: `src-cit-${Date.now()}`,
          name: `Citizen Report: ${reporterName.trim()}`,
          type: 'citizen',
          trustScore: 70,
        },
        corroboratingSourcesCount: 1,
        evidenceList: [
          {
            sourceName: `Citizen Geotagged Upload (${reporterName})`,
            sourceType: 'citizen',
            timestamp: 'Just now',
            excerpt: description.trim(),
            confidenceContribution: 65,
          },
        ],
        mediaUrls: photoPreview ? [photoPreview] : [],
      };
      onReportSubmitted(newEvent);
    }

    setSubmittedSuccess(true);

    setTimeout(() => {
      setSubmittedSuccess(false);
      onClose();
      // Reset form
      setTitle('');
      setDescription('');
      setDistrict('');
      setLocationName('');
      setLat('');
      setLng('');
      setReporterName('');
      setReporterContact('');
      setPhotoPreview(null);
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto bg-[#09172e] border border-[#1e3c6d] rounded-2xl shadow-2xl text-slate-200 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-20 flex items-center justify-between p-4 sm:p-5 bg-[#061226]/95 border-b border-[#183157] backdrop-blur-md">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-orange-600/20 border border-orange-500/40 flex items-center justify-center text-orange-400">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white leading-tight">
                Submit Citizen Weather Incident
              </h2>
              <p className="text-[11px] text-slate-400">
                Ground-truth reporting portal for National Weather Intelligence
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {submittedSuccess ? (
          <div className="p-10 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-500/20 border border-emerald-500 rounded-full flex items-center justify-center mx-auto text-emerald-400 animate-bounce">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-black text-white">Report Ingested Successfully!</h3>
            <p className="text-xs text-slate-300 max-w-md mx-auto">
              Your submission has been dispatched into the National AI Verification Pipeline. It will be corroborated against IMD radar feeds and satellite anomalies.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 text-xs">
            {/* Incident Title */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1">
                Incident Title *
              </label>
              <input
                type="text"
                placeholder="e.g. Flash flooding along Ring Road subway after heavy cloudburst"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 bg-[#061124] border border-[#1e3a64] rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-400"
              />
              {validationErrors.title && (
                <p className="text-rose-400 text-[10px] mt-1 flex items-center space-x-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>{validationErrors.title}</span>
                </p>
              )}
            </div>

            {/* Category and Severity Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1">
                  Weather Category *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as WeatherCategory)}
                  className="w-full px-3 py-2 bg-[#061124] border border-[#1e3a64] rounded-lg text-white focus:outline-none focus:border-blue-400"
                >
                  <option value="heavy_rainfall">Heavy Rainfall / Downpour</option>
                  <option value="flood">Flash Flood / Waterlogging</option>
                  <option value="cyclone">Cyclone / Storm Winds</option>
                  <option value="thunderstorm">Thunderstorm & Lightning</option>
                  <option value="heatwave">Extreme Heatwave</option>
                  <option value="landslide">Landslide / Mudflow</option>
                  <option value="cold_wave">Extreme Cold Wave</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1">
                  Estimated Severity *
                </label>
                <select
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value as SeverityLevel)}
                  className="w-full px-3 py-2 bg-[#061124] border border-[#1e3a64] rounded-lg text-white focus:outline-none focus:border-blue-400"
                >
                  <option value="low">Low (Localized advisory)</option>
                  <option value="moderate">Moderate (Disruption to traffic)</option>
                  <option value="high">High (Severe property impact)</option>
                  <option value="critical">Critical (Life-threatening emergency)</option>
                </select>
              </div>
            </div>

            {/* Incident Description */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1">
                Detailed Observation / Description *
              </label>
              <textarea
                rows={3}
                placeholder="Describe current weather conditions, water levels, road blockages, or tree falls in detail..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 bg-[#061124] border border-[#1e3a64] rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-400"
              />
              {validationErrors.description && (
                <p className="text-rose-400 text-[10px] mt-1 flex items-center space-x-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>{validationErrors.description}</span>
                </p>
              )}
            </div>

            {/* Location selector row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1">
                  State / UT *
                </label>
                <select
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full px-3 py-2 bg-[#061124] border border-[#1e3a64] rounded-lg text-white focus:outline-none focus:border-blue-400"
                >
                  {INDIAN_STATES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1">
                  District *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Sambalpur / Pune"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full px-3 py-2 bg-[#061124] border border-[#1e3a64] rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-400"
                />
                {validationErrors.district && (
                  <p className="text-rose-400 text-[10px] mt-1">{validationErrors.district}</p>
                )}
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1">
                  Locality / Landmark *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Shivaji Chowk"
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  className="w-full px-3 py-2 bg-[#061124] border border-[#1e3a64] rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-400"
                />
                {validationErrors.locationName && (
                  <p className="text-rose-400 text-[10px] mt-1">{validationErrors.locationName}</p>
                )}
              </div>
            </div>

            {/* Geolocation Pinning */}
            <div className="p-3 bg-[#050e1d] rounded-xl border border-[#142846] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-300 flex items-center space-x-1.5">
                  <Compass className="w-4 h-4 text-sky-400" />
                  <span>Geotag Coordinates (Lat / Lng) *</span>
                </span>
                <button
                  type="button"
                  onClick={handleDetectLocation}
                  disabled={locating}
                  className="px-2.5 py-1 bg-blue-600/30 hover:bg-blue-600/50 text-sky-300 rounded border border-blue-500/40 text-[11px] font-medium flex items-center space-x-1 transition-colors"
                >
                  <MapPin className="w-3 h-3 text-sky-400" />
                  <span>{locating ? 'Detecting GPS...' : 'Use My GPS Location'}</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  step="any"
                  placeholder="Latitude (e.g. 19.0760)"
                  value={lat}
                  onChange={(e) => setLat(e.target.value === '' ? '' : parseFloat(e.target.value))}
                  className="w-full px-3 py-1.5 bg-[#061124] border border-[#1e3a64] rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-400"
                />
                <input
                  type="number"
                  step="any"
                  placeholder="Longitude (e.g. 72.8777)"
                  value={lng}
                  onChange={(e) => setLng(e.target.value === '' ? '' : parseFloat(e.target.value))}
                  className="w-full px-3 py-1.5 bg-[#061124] border border-[#1e3a64] rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-400"
                />
              </div>
              {validationErrors.coords && (
                <p className="text-rose-400 text-[10px]">{validationErrors.coords}</p>
              )}
            </div>

            {/* Reporter details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1">
                  Your Full Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Ramesh Kumar"
                  value={reporterName}
                  onChange={(e) => setReporterName(e.target.value)}
                  className="w-full px-3 py-2 bg-[#061124] border border-[#1e3a64] rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-400"
                />
                {validationErrors.reporterName && (
                  <p className="text-rose-400 text-[10px] mt-1">{validationErrors.reporterName}</p>
                )}
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1">
                  Mobile Number / Email (Optional)
                </label>
                <input
                  type="text"
                  placeholder="For official verification callbacks"
                  value={reporterContact}
                  onChange={(e) => setReporterContact(e.target.value)}
                  className="w-full px-3 py-2 bg-[#061124] border border-[#1e3a64] rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-400"
                />
              </div>
            </div>

            {/* Photo Attachment */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1">
                Attach Ground-Truth Photo (Optional)
              </label>
              <div className="flex items-center space-x-3">
                <label className="flex items-center space-x-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 cursor-pointer transition-colors">
                  <Upload className="w-4 h-4 text-sky-400" />
                  <span>Choose Photo File</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </label>
                {photoPreview && (
                  <span className="text-[11px] text-emerald-400 flex items-center space-x-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Photo attached</span>
                  </span>
                )}
              </div>
              {photoPreview && (
                <div className="mt-2 w-32 h-20 rounded-lg overflow-hidden border border-slate-700">
                  <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>

            {/* Form Disclaimer */}
            <div className="p-3 bg-amber-950/20 border border-amber-500/30 rounded-lg text-[11px] text-amber-200/80 leading-relaxed">
              <strong>Accountability Disclaimer:</strong> False or misleading reports are automatically detected by our perceptual hash and satellite corroboration pipelines, and will be flagged to district authorities.
            </div>

            {/* Submit CTA */}
            <div className="pt-2 flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold rounded-lg shadow-lg shadow-orange-600/30 flex items-center space-x-2 transition-all border border-orange-400/40"
              >
                <Send className="w-4 h-4" />
                <span>Submit Weather Incident</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
