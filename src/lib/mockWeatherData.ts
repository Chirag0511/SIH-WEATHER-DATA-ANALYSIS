import { WeatherEvent, KPISummary, FilterState, CitizenSubmissionForm } from '@/types/weather';

export const INDIAN_STATES: string[] = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa',
  'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala',
  'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland',
  'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Delhi NCT', 'Jammu and Kashmir', 'Ladakh'
];

export const INITIAL_WEATHER_EVENTS: WeatherEvent[] = [
  {
    id: 'NWIP-2026-081',
    title: 'Severe Cyclone Alert: Wind Gusts 115 km/h along Coastal Coast',
    description: 'Deep depression intensified into a severe cyclonic storm approaching north Odisha and West Bengal coastline. Coastal districts advised to evacuate low-lying habitats.',
    category: 'cyclone',
    severity: 'critical',
    status: 'verified',
    confidenceScore: 98,
    location: {
      name: 'Paradip Port & Jagatsinghpur Coast',
      district: 'Jagatsinghpur',
      state: 'Odisha',
      lat: 20.3164,
      lng: 86.6114,
    },
    timestamp: '2026-09-29T18:30:00Z',
    reportedAt: '15 mins ago',
    source: {
      id: 'src-imd-01',
      name: 'IMD Doppler Weather Radar & Coastal Buoy',
      type: 'imd',
      trustScore: 99,
      verifiedBadge: true,
      url: 'https://mausam.imd.gov.in',
    },
    corroboratingSourcesCount: 5,
    evidenceList: [
      {
        sourceName: 'IMD National Cyclone Warning Centre',
        sourceType: 'imd',
        timestamp: '18:15 IST',
        excerpt: 'Eye diameter 28km, barometric pressure 976 hPa, landfall expected in 6 hours.',
        confidenceContribution: 45,
      },
      {
        sourceName: 'Open-Meteo Satellite Feed',
        sourceType: 'openmeteo',
        timestamp: '18:20 IST',
        excerpt: 'Wind gust reading confirmed at 112 km/h over Bay of Bengal sector.',
        confidenceContribution: 30,
      },
      {
        sourceName: 'Odisha Disaster Management Authority (OSDMA)',
        sourceType: 'news',
        timestamp: '18:25 IST',
        excerpt: 'Red alert sounded across Kendrapara, Jagatsinghpur, and Balasore.',
        confidenceContribution: 23,
      },
    ],
    mediaUrls: [
      'https://images.unsplash.com/photo-1527482797697-8795b05a13fe?auto=format&fit=crop&w=800&q=80',
    ],
    metrics: {
      precipitationMm: 165,
      windSpeedKmh: 115,
      temperatureC: 25.4,
      humidityPercent: 96,
    },
    aiAnalysis: {
      nlpKeywords: ['cyclone', 'gale force', 'evacuation', 'landfall', 'storm surge'],
      sentiment: 'emergency',
      duplicateClusterId: 'cluster-odisha-cyclone-01',
      anomalyFlag: false,
      verificationNotes: 'High spatial and temporal correlation with satellite cloud tops and barometric pressure anomalies.',
    },
  },
  {
    id: 'NWIP-2026-082',
    title: 'Extreme Flash Flood & Inundation in Urban Mumbai',
    description: 'Continuous torrential downpour exceeding 220mm within 6 hours has caused severe waterlogging along Hindmata, Kurla, and Western Express Highway.',
    category: 'flood',
    severity: 'critical',
    status: 'verified',
    confidenceScore: 94,
    location: {
      name: 'Kurla & Sion Junctions',
      district: 'Mumbai Suburban',
      state: 'Maharashtra',
      lat: 19.0760,
      lng: 72.8777,
    },
    timestamp: '2026-09-29T17:45:00Z',
    reportedAt: '1 hour ago',
    source: {
      id: 'src-mcgm-02',
      name: 'BMC Automatic Weather Station Network',
      type: 'imd',
      trustScore: 95,
      verifiedBadge: true,
    },
    corroboratingSourcesCount: 8,
    evidenceList: [
      {
        sourceName: 'Citizen Geotagged Incident #308',
        sourceType: 'citizen',
        timestamp: '17:20 IST',
        excerpt: 'Water level reached 3.5 feet near Kurla railway station subway.',
        confidenceContribution: 25,
      },
      {
        sourceName: 'Mumbai Traffic Police Live Bulletin',
        sourceType: 'news',
        timestamp: '17:35 IST',
        excerpt: 'Vehicular traffic halted between Bandra and Santacruz flyover.',
        confidenceContribution: 40,
      },
      {
        sourceName: 'Open-Meteo High-Resolution Precipitation Grid',
        sourceType: 'openmeteo',
        timestamp: '17:40 IST',
        excerpt: 'Measured sustained rainfall rate of 42mm/hr over Santacruz grid.',
        confidenceContribution: 29,
      },
    ],
    mediaUrls: [
      'https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=800&q=80',
    ],
    metrics: {
      precipitationMm: 224,
      windSpeedKmh: 45,
      temperatureC: 26.2,
      humidityPercent: 98,
    },
    aiAnalysis: {
      nlpKeywords: ['waterlogging', 'high tide', 'railway disruption', 'flash flood', 'monsoon'],
      sentiment: 'emergency',
      duplicateClusterId: 'cluster-mumbai-monsoon-22',
      anomalyFlag: false,
      verificationNotes: 'Corroborated by 8 distinct citizen image reports with matching timestamps and water levels.',
    },
  },
  {
    id: 'NWIP-2026-083',
    title: 'Severe Landslide Blocking National Highway 5',
    description: 'Massive debris flow triggered by 48-hour cloudburst has severed road connectivity between Shimla and Kinnaur near Jeori.',
    category: 'landslide',
    severity: 'high',
    status: 'verified',
    confidenceScore: 91,
    location: {
      name: 'Jeori Stretch, NH-5',
      district: 'Shimla',
      state: 'Himachal Pradesh',
      lat: 31.5298,
      lng: 77.7846,
    },
    timestamp: '2026-09-29T16:00:00Z',
    reportedAt: '3 hours ago',
    source: {
      id: 'src-hpsdma-03',
      name: 'HP State Disaster Management Authority',
      type: 'news',
      trustScore: 92,
      verifiedBadge: true,
    },
    corroboratingSourcesCount: 4,
    evidenceList: [
      {
        sourceName: 'Border Roads Organisation (BRO) Field Report',
        sourceType: 'news',
        timestamp: '15:30 IST',
        excerpt: 'Heavy boulders fallen on 120-meter stretch; clearance underway.',
        confidenceContribution: 55,
      },
      {
        sourceName: 'Citizen Video Submission',
        sourceType: 'citizen',
        timestamp: '15:45 IST',
        excerpt: 'Stranded truck convoy photographed near Rampur-Jeori boundary.',
        confidenceContribution: 36,
      },
    ],
    mediaUrls: [
      'https://images.unsplash.com/photo-1508873696983-2df5293cb32f?auto=format&fit=crop&w=800&q=80',
    ],
    metrics: {
      precipitationMm: 98,
      windSpeedKmh: 28,
      temperatureC: 15.1,
      humidityPercent: 89,
    },
    aiAnalysis: {
      nlpKeywords: ['landslide', 'debris flow', 'NH-5', 'cloudburst', 'road blocked'],
      sentiment: 'warning',
      anomalyFlag: false,
      verificationNotes: 'Visual terrain verification matched known geological slip zones.',
    },
  },
  {
    id: 'NWIP-2026-084',
    title: 'Extreme Heatwave Red Alert: Daytime Highs Touching 47.8°C',
    description: 'Severe heatwave conditions persisting across western Rajasthan. Loo winds with relative humidity below 15% creating severe heat stress.',
    category: 'heatwave',
    severity: 'critical',
    status: 'verified',
    confidenceScore: 97,
    location: {
      name: 'Churu & Phalodi Arid Zone',
      district: 'Churu',
      state: 'Rajasthan',
      lat: 28.2900,
      lng: 74.9600,
    },
    timestamp: '2026-09-29T14:15:00Z',
    reportedAt: '5 hours ago',
    source: {
      id: 'src-imd-synop',
      name: 'IMD Surface Synoptic Observatory',
      type: 'imd',
      trustScore: 99,
      verifiedBadge: true,
    },
    corroboratingSourcesCount: 6,
    evidenceList: [
      {
        sourceName: 'Open-Meteo Surface Temperature Reanalysis',
        sourceType: 'openmeteo',
        timestamp: '14:00 IST',
        excerpt: 'Peak 2m temperature calculated at 47.6°C under zero cloud cover.',
        confidenceContribution: 50,
      },
      {
        sourceName: 'District Health Administration Advisory',
        sourceType: 'news',
        timestamp: '14:10 IST',
        excerpt: 'Emergency water stations deployed across Churu market squares.',
        confidenceContribution: 47,
      },
    ],
    mediaUrls: [
      'https://images.unsplash.com/photo-1504370805625-d32c54b16100?auto=format&fit=crop&w=800&q=80',
    ],
    metrics: {
      temperatureC: 47.8,
      humidityPercent: 14,
      windSpeedKmh: 32,
    },
    aiAnalysis: {
      nlpKeywords: ['heatwave', 'loo', 'dehydration', 'churu', 'red alert'],
      sentiment: 'emergency',
      anomalyFlag: false,
      verificationNotes: 'Direct instrumental reading cross-verified with 3 regional meteorological substations.',
    },
  },
  {
    id: 'NWIP-2026-085',
    title: 'Severe Lightning & Thunderstorm Activity in Gangetic Plains',
    description: 'Squall line with intense cloud-to-ground lightning strikes and hail reported across Patna and Vaishali districts. Residents urged to stay indoors.',
    category: 'thunderstorm',
    severity: 'high',
    status: 'verified',
    confidenceScore: 89,
    location: {
      name: 'Patna & Hajipur Belt',
      district: 'Patna',
      state: 'Bihar',
      lat: 25.5941,
      lng: 85.1376,
    },
    timestamp: '2026-09-29T18:00:00Z',
    reportedAt: '45 mins ago',
    source: {
      id: 'src-imd-radar-patna',
      name: 'IMD Patna Doppler Radar & Damini App Network',
      type: 'imd',
      trustScore: 96,
      verifiedBadge: true,
    },
    corroboratingSourcesCount: 4,
    evidenceList: [
      {
        sourceName: 'Damini Lightning Warning Network',
        sourceType: 'imd',
        timestamp: '17:50 IST',
        excerpt: 'Over 420 lightning flash pulses detected within 30km radius in 15 mins.',
        confidenceContribution: 60,
      },
      {
        sourceName: 'Citizen Submissions (Twitter / X geo-stream)',
        sourceType: 'social',
        timestamp: '17:55 IST',
        excerpt: 'Multiple reports of uprooted trees and localized power blackout in Kankarbagh.',
        confidenceContribution: 29,
      },
    ],
    mediaUrls: [
      'https://images.unsplash.com/photo-1516912481808-3406841bd33c?auto=format&fit=crop&w=800&q=80',
    ],
    metrics: {
      precipitationMm: 58,
      windSpeedKmh: 78,
      temperatureC: 22.8,
      humidityPercent: 91,
    },
    aiAnalysis: {
      nlpKeywords: ['lightning', 'thunderstorm', 'damini', 'power cut', 'hail'],
      sentiment: 'warning',
      anomalyFlag: false,
      verificationNotes: 'Confirmed by Damini lightning sensor network with millisecond accuracy.',
    },
  },
  {
    id: 'NWIP-2026-086',
    title: 'Citizen Report: Severe Lake Overflow & Road Submersion',
    description: 'Bellandur and Varthur lake feeder canals overflowing after sudden 85mm convective storm. Tech park access road flooded with knee-deep water.',
    category: 'heavy_rainfall',
    severity: 'moderate',
    status: 'pending_review',
    confidenceScore: 68,
    location: {
      name: 'Outer Ring Road, Bellandur',
      district: 'Bengaluru Urban',
      state: 'Karnataka',
      lat: 12.9304,
      lng: 77.6784,
    },
    timestamp: '2026-09-29T18:40:00Z',
    reportedAt: '5 mins ago',
    source: {
      id: 'src-cit-992',
      name: 'Citizen Report via Web Submission',
      type: 'citizen',
      trustScore: 70,
    },
    corroboratingSourcesCount: 2,
    evidenceList: [
      {
        sourceName: 'Citizen Upload Photo with Exif Geotag',
        sourceType: 'citizen',
        timestamp: '18:38 IST',
        excerpt: 'Water level shown at vehicle tire height near Ecospace entrance.',
        confidenceContribution: 45,
      },
      {
        sourceName: 'Bengaluru Traffic Wardens Radio Feed',
        sourceType: 'news',
        timestamp: '18:42 IST',
        excerpt: 'Slow vehicle crawl reported towards Marathahalli junction.',
        confidenceContribution: 23,
      },
    ],
    mediaUrls: [
      'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?auto=format&fit=crop&w=800&q=80',
    ],
    metrics: {
      precipitationMm: 85,
      temperatureC: 23.0,
      humidityPercent: 88,
    },
    aiAnalysis: {
      nlpKeywords: ['waterlogging', 'outer ring road', 'bellandur', 'traffic snarl'],
      sentiment: 'warning',
      duplicateClusterId: 'cluster-blr-or-04',
      anomalyFlag: false,
      verificationNotes: 'Pending administrator sign-off. Photo EXIF GPS matches claimed coordinates.',
    },
  },
  {
    id: 'NWIP-2026-087',
    title: 'Uncorroborated Social Claim: Tsunami Warning near Marina Beach',
    description: 'Circulating message claiming sudden 10-meter sea wave withdrawal and imminent tsunami alert along Chennai coast.',
    category: 'cyclone',
    severity: 'low',
    status: 'flagged',
    confidenceScore: 12,
    location: {
      name: 'Marina Beach Promenade',
      district: 'Chennai',
      state: 'Tamil Nadu',
      lat: 13.0500,
      lng: 80.2824,
    },
    timestamp: '2026-09-29T17:10:00Z',
    reportedAt: '1.5 hours ago',
    source: {
      id: 'src-soc-rumor-09',
      name: 'Social Media Viral Forward Ingestion',
      type: 'social',
      trustScore: 15,
    },
    corroboratingSourcesCount: 0,
    evidenceList: [
      {
        sourceName: 'INCOIS (Indian National Centre for Ocean Information Services)',
        sourceType: 'imd',
        timestamp: '17:25 IST',
        excerpt: 'Zero seismic trigger detected. Sea tide gauges operating at normal 0.8m astronomical tide. Claim officially refuted.',
        confidenceContribution: -80,
      },
    ],
    mediaUrls: [],
    metrics: {
      windSpeedKmh: 14,
      temperatureC: 29.5,
      humidityPercent: 78,
    },
    aiAnalysis: {
      nlpKeywords: ['tsunami', 'rumor', 'marina beach', 'panic forward'],
      sentiment: 'advisory',
      anomalyFlag: true,
      verificationNotes: 'FLAGGED AS MISLEADING. INCOIS real-time ocean buoy and tide data show completely baseline conditions. No seismic anomaly.',
    },
  },
  {
    id: 'NWIP-2026-088',
    title: 'Severe Cold Wave & Frost Advisory in High Himalayan Valleys',
    description: 'Minimum temperatures plunged to -14°C with icy winds sweeping Drass and Kargil. Water pipelines frozen and localized black ice on Zojila Pass.',
    category: 'cold_wave',
    severity: 'high',
    status: 'verified',
    confidenceScore: 93,
    location: {
      name: 'Drass Valley & Kargil Sector',
      district: 'Kargil',
      state: 'Ladakh',
      lat: 34.4286,
      lng: 75.7602,
    },
    timestamp: '2026-09-29T15:00:00Z',
    reportedAt: '4 hours ago',
    source: {
      id: 'src-imd-leh',
      name: 'IMD High-Altitude Station Leh/Kargil',
      type: 'imd',
      trustScore: 98,
      verifiedBadge: true,
    },
    corroboratingSourcesCount: 3,
    evidenceList: [
      {
        sourceName: 'IMD Drass Automated Synoptic Station',
        sourceType: 'imd',
        timestamp: '14:50 IST',
        excerpt: 'Minimum temperature logged at -14.2°C, wind chill index -22°C.',
        confidenceContribution: 65,
      },
      {
        sourceName: 'Ladakh Autonomous Hill Development Council',
        sourceType: 'news',
        timestamp: '15:10 IST',
        excerpt: 'Advisory issued for high-altitude livestock and vehicular chains.',
        confidenceContribution: 28,
      },
    ],
    mediaUrls: [
      'https://images.unsplash.com/photo-1483921020237-2ff51e8e4b22?auto=format&fit=crop&w=800&q=80',
    ],
    metrics: {
      temperatureC: -14.2,
      windSpeedKmh: 35,
      humidityPercent: 52,
    },
    aiAnalysis: {
      nlpKeywords: ['cold wave', 'drass', 'black ice', 'frost', 'zojila'],
      sentiment: 'warning',
      anomalyFlag: false,
      verificationNotes: 'Thermometer readings verified against border post automatic telemetry.',
    },
  },
];

export const MOCK_KPI_SUMMARY: KPISummary = {
  totalEvents: 142,
  verifiedEvents: 108,
  criticalAlerts: 14,
  pendingReview: 18,
  activeStatesCount: 22,
  averageConfidence: 87.4,
  citizenReportsCount: 46,
  lastSyncTimestamp: '29 Sep 2026, 20:40 IST',
};

export function filterWeatherEvents(events: WeatherEvent[], filters: FilterState): WeatherEvent[] {
  return events.filter((event) => {
    // Search query matches title, description, district, state
    if (filters.searchQuery.trim()) {
      const q = filters.searchQuery.toLowerCase();
      const match =
        event.title.toLowerCase().includes(q) ||
        event.description.toLowerCase().includes(q) ||
        event.location.name.toLowerCase().includes(q) ||
        event.location.district.toLowerCase().includes(q) ||
        event.location.state.toLowerCase().includes(q) ||
        event.category.toLowerCase().includes(q);
      if (!match) return false;
    }

    // Category filter
    if (filters.category && filters.category !== 'all') {
      if (event.category !== filters.category) return false;
    }

    // Severity filter
    if (filters.severity && filters.severity !== 'all') {
      if (event.severity !== filters.severity) return false;
    }

    // Verification status filter
    if (filters.status && filters.status !== 'all') {
      if (event.status !== filters.status) return false;
    }

    // State filter
    if (filters.state && filters.state !== 'all') {
      if (event.location.state !== filters.state) return false;
    }

    return true;
  });
}
