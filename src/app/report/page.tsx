'use client';

import React, { useState } from 'react';
import { WeatherCategory, SeverityLevel, WeatherEvent } from '@/types/weather';
import { INDIAN_STATES } from '@/lib/mockWeatherData';
import { 
  Camera, 
  MapPin, 
  Upload, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  Compass, 
  ShieldCheck, 
  FileText,
  PhoneCall,
  Info
} from 'lucide-react';

export default function ReportPage() {
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmittedSuccess(true);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold">
          <ShieldCheck className="w-4 h-4 text-amber-400" />
          <span>Official SIH Citizen Weather Submission Portal</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          Submit Weather Incident / Ground-Truth Report
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mx-auto">
          Your ground observations empower disaster management authorities and calibrate meteorological models. All submissions are automatically geocoded and verified.
        </p>
      </div>

      {submittedSuccess ? (
        <div className="p-10 text-center bg-[#07142a] border border-emerald-500/50 rounded-2xl shadow-2xl space-y-5 animate-in zoom-in-95 duration-300">
          <div className="w-20 h-20 bg-emerald-500/20 border-2 border-emerald-500 rounded-full flex items-center justify-center mx-auto text-emerald-400 animate-bounce">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-black text-white">
            Incident Registered into National Queue!
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
            Thank you, <strong className="text-white">{reporterName}</strong>. Your report for <strong>{locationName}, {district}</strong> has been tagged with reference ID <span className="font-mono text-sky-400">CIT-{Date.now().toString().slice(-6)}</span> and entered into the AI multi-source corroboration pipeline.
          </p>

          <div className="pt-4 flex justify-center space-x-3">
            <button
              onClick={() => {
                setSubmittedSuccess(false);
                setTitle('');
                setDescription('');
                setDistrict('');
                setLocationName('');
                setLat('');
                setLng('');
                setReporterName('');
                setReporterContact('');
                setPhotoPreview(null);
              }}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow"
            >
              Submit Another Report
            </button>
            <a
              href="/dashboard"
              className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-all border border-slate-700"
            >
              View on Live Map
            </a>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2 bg-[#061226] border border-[#162c52] rounded-2xl p-6 sm:p-8 shadow-xl">
            <form onSubmit={handleSubmit} className="space-y-5 text-xs">
              {/* Incident Title */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1">
                  Incident Summary / Headline *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Inundated bypass road with stranded buses after intense cloudburst"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#030a17] border border-[#1b3660] rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-400"
                />
                {validationErrors.title && (
                  <p className="text-rose-400 text-[10px] mt-1 flex items-center space-x-1">
                    <AlertCircle className="w-3 h-3" />
                    <span>{validationErrors.title}</span>
                  </p>
                )}
              </div>

              {/* Category and Severity Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1">
                    Weather Event Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as WeatherCategory)}
                    className="w-full px-3.5 py-2.5 bg-[#030a17] border border-[#1b3660] rounded-xl text-white focus:outline-none focus:border-blue-400"
                  >
                    <option value="heavy_rainfall">Heavy Rainfall / Downpour</option>
                    <option value="flood">Flash Flood / Inundation</option>
                    <option value="cyclone">Cyclone / Gale Winds</option>
                    <option value="thunderstorm">Severe Lightning & Thunderstorm</option>
                    <option value="heatwave">Extreme Heatwave</option>
                    <option value="landslide">Landslide / Mudflow</option>
                    <option value="cold_wave">Extreme Cold Wave</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1">
                    Estimated Ground Severity *
                  </label>
                  <select
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value as SeverityLevel)}
                    className="w-full px-3.5 py-2.5 bg-[#030a17] border border-[#1b3660] rounded-xl text-white focus:outline-none focus:border-blue-400"
                  >
                    <option value="low">Low (Local minor inconvenience)</option>
                    <option value="moderate">Moderate (Traffic & power disruption)</option>
                    <option value="high">High (Severe property inundation)</option>
                    <option value="critical">Critical (Immediate life hazard)</option>
                  </select>
                </div>
              </div>

              {/* Detailed Description */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1">
                  Detailed Observations *
                </label>
                <textarea
                  rows={4}
                  placeholder="Detail water level, wind speed, duration, damages observed, and urgent rescue needs..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#030a17] border border-[#1b3660] rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-400"
                />
                {validationErrors.description && (
                  <p className="text-rose-400 text-[10px] mt-1 flex items-center space-x-1">
                    <AlertCircle className="w-3 h-3" />
                    <span>{validationErrors.description}</span>
                  </p>
                )}
              </div>

              {/* State & District */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1">
                    State / Union Territory *
                  </label>
                  <select
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#030a17] border border-[#1b3660] rounded-xl text-white focus:outline-none focus:border-blue-400"
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
                    placeholder="e.g. Cuttack, Surat, Kamrup"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#030a17] border border-[#1b3660] rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-400"
                  />
                  {validationErrors.district && (
                    <p className="text-rose-400 text-[10px] mt-1">{validationErrors.district}</p>
                  )}
                </div>
              </div>

              {/* Locality */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1">
                  Specific Locality / Ward / Landmark *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Near Gandhi Bridge, Sector 4"
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#030a17] border border-[#1b3660] rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-400"
                />
                {validationErrors.locationName && (
                  <p className="text-rose-400 text-[10px] mt-1">{validationErrors.locationName}</p>
                )}
              </div>

              {/* GPS Geotagging */}
              <div className="p-4 bg-[#030a17] rounded-xl border border-[#142846] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-300 flex items-center space-x-1.5">
                    <Compass className="w-4 h-4 text-sky-400" />
                    <span>Geotag Coordinates (Lat / Long) *</span>
                  </span>
                  <button
                    type="button"
                    onClick={handleDetectLocation}
                    disabled={locating}
                    className="px-3 py-1 bg-blue-600/30 hover:bg-blue-600/50 text-sky-300 rounded-lg border border-blue-500/40 text-[11px] font-medium flex items-center space-x-1 transition-colors"
                  >
                    <MapPin className="w-3 h-3 text-sky-400" />
                    <span>{locating ? 'Acquiring GPS Fix...' : 'Detect GPS Coordinates'}</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="number"
                    step="any"
                    placeholder="Latitude (e.g. 20.4625)"
                    value={lat}
                    onChange={(e) => setLat(e.target.value === '' ? '' : parseFloat(e.target.value))}
                    className="w-full px-3 py-2 bg-[#061124] border border-[#1e3a64] rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-400"
                  />
                  <input
                    type="number"
                    step="any"
                    placeholder="Longitude (e.g. 85.8828)"
                    value={lng}
                    onChange={(e) => setLng(e.target.value === '' ? '' : parseFloat(e.target.value))}
                    className="w-full px-3 py-2 bg-[#061124] border border-[#1e3a64] rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-400"
                  />
                </div>
                {validationErrors.coords && (
                  <p className="text-rose-400 text-[10px]">{validationErrors.coords}</p>
                )}
              </div>

              {/* Reporter Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1">
                    Your Full Name *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Suman Senapati"
                    value={reporterName}
                    onChange={(e) => setReporterName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#030a17] border border-[#1b3660] rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-400"
                  />
                  {validationErrors.reporterName && (
                    <p className="text-rose-400 text-[10px] mt-1">{validationErrors.reporterName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1">
                    Mobile / Email (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="For official verification"
                    value={reporterContact}
                    onChange={(e) => setReporterContact(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#030a17] border border-[#1b3660] rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-400"
                  />
                </div>
              </div>

              {/* Photo Upload */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1">
                  Upload Ground-Truth Photograph
                </label>
                <div className="flex items-center space-x-3">
                  <label className="flex items-center space-x-2 px-4 py-2.5 bg-[#0b1b36] hover:bg-[#10274e] text-slate-200 rounded-xl border border-[#1e3c6d] cursor-pointer transition-colors">
                    <Upload className="w-4 h-4 text-sky-400" />
                    <span>Select Photo (JPG / PNG)</span>
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
                      <span>Ready for EXIF verification</span>
                    </span>
                  )}
                </div>
                {photoPreview && (
                  <div className="mt-3 w-48 h-28 rounded-xl overflow-hidden border border-slate-700">
                    <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              {/* Submit CTA */}
              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-orange-600 via-amber-600 to-orange-500 hover:from-orange-500 hover:to-amber-500 text-white font-extrabold text-sm rounded-xl shadow-xl shadow-orange-600/30 flex items-center justify-center space-x-2 transition-all border border-orange-400/40"
                >
                  <Send className="w-4 h-4" />
                  <span>Transmit to National Weather Intelligence Queue</span>
                </button>
              </div>
            </form>
          </div>

          {/* Right Column: Guidelines & Helplines */}
          <div className="space-y-6">
            <div className="bg-[#061226] border border-[#162c52] rounded-2xl p-5 shadow-lg space-y-3">
              <div className="flex items-center space-x-2 text-sky-400 font-bold text-xs uppercase tracking-wider">
                <Info className="w-4 h-4" />
                <span>Reporting Guidelines</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-300 leading-relaxed list-disc list-inside">
                <li>Capture clear visual proof showing landmark cues and water levels.</li>
                <li>Ensure location permissions are enabled for accurate geocoding.</li>
                <li>Avoid circulating unverified WhatsApp forwards or old images.</li>
                <li>In immediate life risk scenarios, dial <strong>112</strong> immediately.</li>
              </ul>
            </div>

            <div className="bg-[#061226] border border-[#162c52] rounded-2xl p-5 shadow-lg space-y-3">
              <div className="flex items-center space-x-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
                <PhoneCall className="w-4 h-4" />
                <span>Emergency Numbers</span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center py-1 border-b border-slate-800">
                  <span className="text-slate-400">National Emergency:</span>
                  <span className="font-bold text-white">112</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-800">
                  <span className="text-slate-400">NDMA Disaster Helpline:</span>
                  <span className="font-bold text-sky-400">1078</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-800">
                  <span className="text-slate-400">IMD Weather Helpline:</span>
                  <span className="font-bold text-emerald-400">1800-180-1717</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
