import { colors } from '../theme';

export type Tone = 'calm' | 'neutral' | 'warn' | 'danger';
export type FeedCategory =
  | 'earthquakes'
  | 'flights'
  | 'weather'
  | 'ocean'
  | 'markets'
  | 'satellites';
export type DataMode = 'auto' | 'demo' | 'live';
export type SeverityFilter = 'all' | 'critical' | 'elevated' | 'normal';

export type Metric = {
  id: string;
  label: string;
  category: FeedCategory;
  value: string;
  numericValue: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  delta: string;
  tone: Tone;
};

export type Hotspot = {
  id: string;
  label: string;
  category: FeedCategory;
  region: string;
  latitude: number;
  longitude: number;
  x: number;
  y: number;
  color: string;
  intensity: number;
  eventId: string;
  stat: string;
};

export type ActivityPoint = {
  label: string;
  value: number;
  highlight?: boolean;
};

export type Trend = {
  id: string;
  title: string;
  subtitle: string;
  value: string;
  category: FeedCategory;
  tone: Tone;
  eventId: string;
};

export type AlertItem = {
  id: string;
  title: string;
  body: string;
  tone: Tone;
  region: string;
  category: FeedCategory;
  eventId: string;
};

export type TimelineEntry = {
  id: string;
  time: string;
  title: string;
  body: string;
  tone: Tone;
  category: FeedCategory;
  eventId: string;
};

export type SatelliteTrack = {
  id: string;
  label: string;
  orbit: 'polar' | 'equatorial' | 'regional';
  coverage: string;
  latency: string;
  tone: Tone;
  category: 'satellites';
  eventId: string;
};

export type MarketPulse = {
  id: string;
  name: string;
  region: string;
  value: string;
  delta: string;
  tone: Tone;
  category: 'markets';
  eventId: string;
};

export type WatchZone = {
  id: string;
  name: string;
  risk: string;
  detail: string;
  tone: Tone;
  category: FeedCategory;
  eventId: string;
};

export type FeedItem = {
  id: string;
  label: string;
  detail: string;
  tone: Tone;
  category: FeedCategory;
  eventId: string;
};

export type ReplayFrame = {
  label: string;
  intensity: number;
  status: string;
};

export type WeatherBand = {
  id: string;
  zone: string;
  wind: string;
  seas: string;
  tone: Tone;
  category: 'weather';
  eventId: string;
};

export type EventItem = {
  id: string;
  title: string;
  category: FeedCategory;
  region: string;
  latitude?: number;
  longitude?: number;
  tone: Tone;
  summary: string;
  stat: string;
  updatedAt: string;
  source: string;
  details: string[];
};

export type DataSourceStatus = {
  mode: DataMode;
  isLive: boolean;
  label: string;
  detail: string;
  updatedAt: number;
  liveCategories: FeedCategory[];
};

export type DashboardSnapshot = {
  lastUpdated: number;
  sourceStatus: DataSourceStatus;
  summary: {
    activeSignals: string;
    alerts: string;
    coverage: string;
    replayWindow: string;
  };
  metrics: Metric[];
  hotspots: Hotspot[];
  trending: Trend[];
  activity: ActivityPoint[];
  alerts: AlertItem[];
  timeline: TimelineEntry[];
  satellites: SatelliteTrack[];
  markets: MarketPulse[];
  watchZones: WatchZone[];
  feed: FeedItem[];
  replayFrames: ReplayFrame[];
  weatherBands: WeatherBand[];
  events: EventItem[];
};

export type LiveDataPatch = {
  fetchedAt: number;
  liveCategories: FeedCategory[];
  detail: string;
  metrics?: Partial<Record<FeedCategory, Partial<Metric>>>;
  events?: Partial<Record<FeedCategory, EventItem[]>>;
};

export const allCategories: FeedCategory[] = [
  'earthquakes',
  'flights',
  'weather',
  'ocean',
  'markets',
  'satellites',
];

const hotspotTemplates = [
  { id: 'tokyo', label: 'Tokyo', region: 'Japan', latitude: 35.67, longitude: 139.65, x: 76, y: 28, color: colors.mint, category: 'earthquakes' },
  { id: 'san-francisco', label: 'San Francisco', region: 'United States', latitude: 37.77, longitude: -122.42, x: 17, y: 43, color: colors.sky, category: 'flights' },
  { id: 'santiago', label: 'Santiago', region: 'Chile', latitude: -33.45, longitude: -70.67, x: 23, y: 74, color: colors.coral, category: 'earthquakes' },
  { id: 'london', label: 'London', region: 'United Kingdom', latitude: 51.5, longitude: -0.12, x: 47, y: 30, color: colors.sun, category: 'markets' },
  { id: 'nairobi', label: 'Nairobi', region: 'Kenya', latitude: -1.29, longitude: 36.82, x: 56, y: 56, color: colors.sky, category: 'weather' },
  { id: 'sydney', label: 'Sydney', region: 'Australia', latitude: -33.87, longitude: 151.21, x: 83, y: 75, color: colors.mint, category: 'satellites' },
] as const;

const categoryLabels: Record<FeedCategory, string> = {
  earthquakes: 'Earthquakes',
  flights: 'Flights',
  weather: 'Weather',
  ocean: 'Ocean',
  markets: 'Markets',
  satellites: 'Satellites',
};

function randomBetween(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function pickTone(value: number, medium: number, high: number): Tone {
  if (value >= high) {
    return 'danger';
  }
  if (value >= medium) {
    return 'warn';
  }
  return 'neutral';
}

function toneFromDelta(value: number): Tone {
  if (value <= -1.2) {
    return 'danger';
  }
  if (value < 0) {
    return 'warn';
  }
  return 'calm';
}

function toneColor(tone: Tone) {
  return {
    calm: colors.mint,
    neutral: colors.sky,
    warn: colors.sun,
    danger: colors.coral,
  }[tone];
}

function createMetric(
  id: string,
  label: string,
  category: FeedCategory,
  numericValue: number,
  tone: Tone,
  options: {
    value: string;
    delta: string;
    prefix?: string;
    suffix?: string;
    decimals?: number;
  }
): Metric {
  return {
    id,
    label,
    category,
    numericValue,
    tone,
    value: options.value,
    delta: options.delta,
    prefix: options.prefix,
    suffix: options.suffix,
    decimals: options.decimals,
  };
}

function buildMetrics(): Metric[] {
  const earthquakeCount = Math.round(randomBetween(92, 156));
  const flights = Math.round(randomBetween(12420, 18880));
  const weatherCells = Math.round(randomBetween(130, 310));
  const oceanAnomaly = randomBetween(0.7, 2.4);
  const marketMomentum = randomBetween(-2.8, 2.2);
  const satelliteCoverage = Math.round(randomBetween(68, 98));

  return [
    createMetric('metric-earthquakes', 'Earthquakes', 'earthquakes', earthquakeCount, pickTone(earthquakeCount, 115, 140), {
      value: `${earthquakeCount}`,
      delta: `${Math.round(randomBetween(4, 13))} events in 1h`,
    }),
    createMetric('metric-flights', 'Flights', 'flights', flights / 1000, pickTone(flights, 14500, 17600), {
      value: `${(flights / 1000).toFixed(1)}k`,
      delta: `${Math.round(randomBetween(78, 94))}% corridor load`,
      suffix: 'k',
      decimals: 1,
    }),
    createMetric('metric-weather', 'Weather', 'weather', weatherCells, pickTone(weatherCells, 210, 270), {
      value: `${weatherCells}`,
      delta: `${Math.round(randomBetween(9, 22))} severe zones`,
    }),
    createMetric('metric-ocean', 'Ocean Temp', 'ocean', oceanAnomaly, pickTone(oceanAnomaly, 1.4, 2), {
      value: `+${oceanAnomaly.toFixed(1)}C`,
      delta: `${randomBetween(0.1, 0.6).toFixed(1)}C daily drift`,
      prefix: '+',
      suffix: 'C',
      decimals: 1,
    }),
    createMetric('metric-markets', 'Markets', 'markets', marketMomentum, toneFromDelta(marketMomentum), {
      value: `${marketMomentum >= 0 ? '+' : ''}${marketMomentum.toFixed(1)}%`,
      delta: `${Math.round(randomBetween(18, 46))} indices moving`,
      prefix: marketMomentum >= 0 ? '+' : '',
      suffix: '%',
      decimals: 1,
    }),
    createMetric('metric-satellites', 'Satellites', 'satellites', satelliteCoverage, satelliteCoverage < 76 ? 'warn' : 'calm', {
      value: `${satelliteCoverage}%`,
      delta: `${Math.round(randomBetween(6, 18))} rapid revisits`,
      suffix: '%',
    }),
  ];
}

function buildEvents(metrics: Metric[]): EventItem[] {
  return [
    {
      id: 'event-earthquakes-ring',
      title: 'Ring of Fire escalation',
      category: 'earthquakes',
      region: 'Japan trench',
      latitude: 35.67,
      longitude: 139.65,
      tone: metrics[0].tone,
      summary: 'Seismic rate is climbing around the western Pacific rim.',
      stat: metrics[0].delta,
      updatedAt: '2m ago',
      source: 'Seismic feed',
      details: [
        'Clusters remain shallow and closely spaced across island arcs.',
        'Secondary wave activity is broadening into neighboring monitored zones.',
        'Operators should expect more alert churn during the next replay window.',
      ],
    },
    {
      id: 'event-flights-atlantic',
      title: 'Atlantic corridor saturation',
      category: 'flights',
      region: 'North Atlantic',
      latitude: 52.0,
      longitude: -30.0,
      tone: metrics[1].tone,
      summary: 'Long-haul routes are stacking across the most efficient tracks.',
      stat: metrics[1].delta,
      updatedAt: '1m ago',
      source: 'Aviation grid',
      details: [
        'Track allocation remains dense across westbound and eastbound lanes.',
        'Weather avoidance is compounding route convergence.',
        'Dispatch teams are prioritizing route smoothing over time gains.',
      ],
    },
    {
      id: 'event-weather-monsoon',
      title: 'Monsoon cell expansion',
      category: 'weather',
      region: 'Bay of Bengal',
      latitude: 17.0,
      longitude: 88.0,
      tone: metrics[2].tone,
      summary: 'Convective growth is outrunning this morning baseline.',
      stat: metrics[2].delta,
      updatedAt: '3m ago',
      source: 'Weather mesh',
      details: [
        'Low-pressure rotation is tightening over warm water.',
        'Coastal routing risk is increasing for marine and aviation paths.',
        'Wind shear remains unstable across the active boundary.',
      ],
    },
    {
      id: 'event-ocean-heat',
      title: 'Equatorial thermal bloom',
      category: 'ocean',
      region: 'Equatorial Pacific',
      latitude: 0,
      longitude: -140,
      tone: metrics[3].tone,
      summary: 'Sea-surface anomalies remain elevated across a broad belt.',
      stat: metrics[3].value,
      updatedAt: '4m ago',
      source: 'Ocean model',
      details: [
        'Warm pools are persisting beyond the daily drift forecast.',
        'The anomaly footprint is widening eastward.',
        'Storm-energy potential remains above seasonal baseline.',
      ],
    },
    {
      id: 'event-markets-open',
      title: 'Risk sentiment reversal',
      category: 'markets',
      region: 'Global indices',
      latitude: 51.5,
      longitude: -0.12,
      tone: metrics[4].tone,
      summary: 'Futures and cash sessions are leaning away from overnight highs.',
      stat: metrics[4].value,
      updatedAt: 'just now',
      source: 'Market pulse',
      details: [
        'Energy-led volatility is spreading into broader index pricing.',
        'Cross-market pressure is visible in European and Asian sessions.',
        'Short-term positioning remains reactive rather than directional.',
      ],
    },
    {
      id: 'event-satellites-retask',
      title: 'Orbital retask priority',
      category: 'satellites',
      region: 'Polar weather arc',
      latitude: 63,
      longitude: 12,
      tone: metrics[5].tone,
      summary: 'Rapid revisit assets are being retasked toward active zones.',
      stat: metrics[5].delta,
      updatedAt: '5m ago',
      source: 'Orbital net',
      details: [
        'Coverage remains high but latency has tightened on key passes.',
        'Polar and regional assets are being synchronized around weather demand.',
        'Revisit priority is highest over storm-linked regions.',
      ],
    },
  ];
}

function buildHotspots(events: EventItem[]): Hotspot[] {
  return hotspotTemplates.map((spot, index) => {
    const event = events.find((item) => item.category === spot.category) ?? events[index % events.length];
    const intensity = Math.round(randomBetween(48, 100));

    return {
      id: spot.id,
      label: spot.label,
      category: spot.category,
      region: spot.region,
      latitude: spot.latitude,
      longitude: spot.longitude,
      x: spot.x,
      y: spot.y,
      color: toneColor(event.tone) || spot.color,
      intensity,
      eventId: event.id,
      stat: event.stat,
    };
  });
}

function buildTrending(metrics: Metric[], events: EventItem[]): Trend[] {
  return metrics.slice(0, 4).map((metric, index) => ({
    id: `trend-${metric.category}`,
    title: categoryLabels[metric.category],
    subtitle: events[index].summary,
    value: metric.value,
    category: metric.category,
    tone: metric.tone,
    eventId: events[index].id,
  }));
}

function buildActivity(): ActivityPoint[] {
  const labels = ['00', '02', '04', '06', '08', '10', '12', '14', '16', '18', '20', '22'];
  return labels.map((label, index) => ({
    label,
    value: Math.round(randomBetween(24, 100)),
    highlight: index >= 7 && index <= 9,
  }));
}

function buildAlerts(events: EventItem[]): AlertItem[] {
  return events.slice(0, 4).map((event) => ({
    id: `alert-${event.id}`,
    title: event.title,
    body: event.summary,
    tone: event.tone,
    region: event.region,
    category: event.category,
    eventId: event.id,
  }));
}

function buildTimeline(events: EventItem[]): TimelineEntry[] {
  return events.concat(events[0]).slice(0, 7).map((event, index) => ({
    id: `timeline-${event.id}-${index}`,
    time: `${String(5 + index * 2).padStart(2, '0')}:00`,
    title: event.title,
    body: event.summary,
    tone: event.tone,
    category: event.category,
    eventId: event.id,
  }));
}

function buildSatellites(events: EventItem[]): SatelliteTrack[] {
  const satelliteEvent = events.find((event) => event.category === 'satellites') ?? events[0];
  return [
    ['Aquila-7', 'polar'],
    ['Meridian-4', 'equatorial'],
    ['Nimbus-12', 'regional'],
    ['Tethys-2', 'polar'],
  ].map(([label, orbit], index) => ({
    id: label.toLowerCase(),
    label,
    orbit: orbit as SatelliteTrack['orbit'],
    coverage: `${Math.round(randomBetween(72, 99))}% coverage`,
    latency: `${Math.round(randomBetween(3, 11))}m latency`,
    tone: (['calm', 'neutral', 'warn', 'calm'] as Tone[])[index],
    category: 'satellites',
    eventId: satelliteEvent.id,
  }));
}

function buildMarkets(events: EventItem[]): MarketPulse[] {
  const marketEvent = events.find((event) => event.category === 'markets') ?? events[0];
  return [
    ['S&P 500', 'US'],
    ['FTSE 100', 'UK'],
    ['Nikkei 225', 'JP'],
    ['Nifty 50', 'IN'],
  ].map(([name, region]) => {
    const delta = randomBetween(-1.9, 1.6);
    return {
      id: `market-${name.toLowerCase().replace(/\s+/g, '-')}`,
      name,
      region,
      value: `${Math.round(randomBetween(4200, 41300)).toLocaleString()}`,
      delta: `${delta >= 0 ? '+' : ''}${delta.toFixed(2)}%`,
      tone: toneFromDelta(delta),
      category: 'markets',
      eventId: marketEvent.id,
    };
  });
}

function buildWatchZones(events: EventItem[]): WatchZone[] {
  const mapping: [string, FeedCategory, string, Tone][] = [
    ['Arctic front', 'weather', 'Wind shear and sea ice movement are converging.', 'warn'],
    ['Andean coast', 'earthquakes', 'Seismic and weather activity are overlapping near coastlines.', 'danger'],
    ['Mediterranean basin', 'markets', 'Heat and market stress are raising logistics risk.', 'neutral'],
    ['Indo-Pacific corridor', 'flights', 'Flight load and storm cells are reinforcing routing pressure.', 'warn'],
  ];

  return mapping.map(([name, category, detail, tone]) => ({
    id: `watch-${name.toLowerCase().replace(/\s+/g, '-')}`,
    name,
    risk: tone === 'danger' ? 'Critical' : tone === 'warn' ? 'Elevated' : 'Guarded',
    detail,
    tone,
    category,
    eventId: events.find((event) => event.category === category)?.id ?? events[0].id,
  }));
}

function buildFeed(events: EventItem[]): FeedItem[] {
  return events.slice(0, 4).map((event) => ({
    id: `feed-${event.id}`,
    label: categoryLabels[event.category],
    detail: event.stat,
    tone: event.tone,
    category: event.category,
    eventId: event.id,
  }));
}

function buildReplayFrames(): ReplayFrame[] {
  return ['-6h', '-5h', '-4h', '-3h', '-2h', '-1h', 'Now'].map((label, index) => ({
    label,
    intensity: Math.round(randomBetween(28, 100)),
    status: ['low', 'rising', 'stable', 'rising', 'elevated', 'hot', 'live'][index],
  }));
}

function buildWeatherBands(events: EventItem[]): WeatherBand[] {
  const weatherEvent = events.find((event) => event.category === 'weather') ?? events[0];
  return ['North Atlantic', 'Arabian Sea', 'South Pacific', 'Gulf Stream'].map((zone, index) => ({
    id: `weather-band-${index}`,
    zone,
    wind: `${Math.round(randomBetween(22, 78))} kt`,
    seas: `${randomBetween(1.8, 6.7).toFixed(1)} m`,
    tone: (['warn', 'danger', 'neutral', 'warn'] as Tone[])[index],
    category: 'weather',
    eventId: weatherEvent.id,
  }));
}

function buildSummary(metrics: Metric[]) {
  const dangerCount = metrics.filter((metric) => metric.tone === 'danger').length;
  const warnCount = metrics.filter((metric) => metric.tone === 'warn').length;
  return {
    activeSignals: `${18 + warnCount + dangerCount * 3}`,
    alerts: `${Math.max(3, warnCount + dangerCount + 1)}`,
    coverage: `${Math.round(randomBetween(82, 97))}% globe`,
    replayWindow: `${Math.round(randomBetween(12, 24))}h`,
  };
}

function createSourceStatus(mode: DataMode, isLive = false, detail = 'Using generated demo telemetry.'): DataSourceStatus {
  return {
    mode,
    isLive,
    label: isLive ? 'LIVE' : mode === 'live' ? 'LIVE FALLBACK' : mode === 'auto' ? 'AUTO DEMO' : 'DEMO',
    detail,
    updatedAt: Date.now(),
    liveCategories: [],
  };
}

function buildSnapshot(mode: DataMode = 'demo'): DashboardSnapshot {
  const metrics = buildMetrics();
  const events = buildEvents(metrics);
  return {
    lastUpdated: Date.now(),
    sourceStatus: createSourceStatus(mode),
    summary: buildSummary(metrics),
    metrics,
    hotspots: buildHotspots(events),
    trending: buildTrending(metrics, events),
    activity: buildActivity(),
    alerts: buildAlerts(events),
    timeline: buildTimeline(events),
    satellites: buildSatellites(events),
    markets: buildMarkets(events),
    watchZones: buildWatchZones(events),
    feed: buildFeed(events),
    replayFrames: buildReplayFrames(),
    weatherBands: buildWeatherBands(events),
    events,
  };
}

export function createInitialSnapshot(mode: DataMode = 'demo') {
  return buildSnapshot(mode);
}

export function createNextSnapshot(previous: DashboardSnapshot, mode: DataMode = previous.sourceStatus.mode) {
  const next = buildSnapshot(mode);
  return {
    ...next,
    timeline: previous.timeline.map((entry, index) => {
      if (index === 0) {
        const event = next.events[Math.floor(randomBetween(0, next.events.length))];
        return {
          id: `timeline-live-${next.lastUpdated}`,
          time: new Date(next.lastUpdated).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          }),
          title: event.title,
          body: event.summary,
          tone: event.tone,
          category: event.category,
          eventId: event.id,
        };
      }
      return previous.timeline[index - 1];
    }),
    feed: [next.feed[0], ...previous.feed.slice(0, previous.feed.length - 1)].map((item, index) => ({
      ...item,
      id: `${item.category}-${index}-${next.lastUpdated}`,
    })),
  };
}

export function applyLiveData(base: DashboardSnapshot, patch: LiveDataPatch, mode: DataMode): DashboardSnapshot {
  let events = [...base.events];
  const metrics = base.metrics.map((metric) => {
    const update = patch.metrics?.[metric.category];
    if (!update) {
      return metric;
    }
    return {
      ...metric,
      ...update,
      value: update.value ?? metric.value,
      numericValue: update.numericValue ?? metric.numericValue,
      delta: update.delta ?? metric.delta,
      tone: update.tone ?? metric.tone,
    };
  });

  if (patch.events) {
    for (const category of Object.keys(patch.events) as FeedCategory[]) {
      const categoryEvents = patch.events[category];
      if (categoryEvents?.length) {
        events = events.filter((event) => event.category !== category).concat(categoryEvents);
      }
    }
  }

  const sortedEvents = allCategories
    .map((category) => events.find((event) => event.category === category))
    .filter(Boolean) as EventItem[];

  return {
    ...base,
    lastUpdated: patch.fetchedAt,
    sourceStatus: {
      mode,
      isLive: patch.liveCategories.length > 0,
      label: patch.liveCategories.length > 0 ? 'LIVE' : mode === 'live' ? 'LIVE FALLBACK' : 'AUTO DEMO',
      detail: patch.detail,
      updatedAt: patch.fetchedAt,
      liveCategories: patch.liveCategories,
    },
    summary: buildSummary(metrics),
    metrics,
    events: sortedEvents.length ? sortedEvents : base.events,
    hotspots: buildHotspots(sortedEvents.length ? sortedEvents : base.events),
    trending: buildTrending(metrics, sortedEvents.length ? sortedEvents : base.events),
    alerts: buildAlerts(sortedEvents.length ? sortedEvents : base.events),
    timeline: buildTimeline(sortedEvents.length ? sortedEvents : base.events),
    satellites: buildSatellites(sortedEvents.length ? sortedEvents : base.events),
    markets: buildMarkets(sortedEvents.length ? sortedEvents : base.events),
    watchZones: buildWatchZones(sortedEvents.length ? sortedEvents : base.events),
    feed: buildFeed(sortedEvents.length ? sortedEvents : base.events),
    weatherBands: buildWeatherBands(sortedEvents.length ? sortedEvents : base.events),
  };
}

export function filterByCategories<T extends { category: FeedCategory }>(items: T[], categories: FeedCategory[]) {
  if (categories.length === 0) {
    return items;
  }
  return items.filter((item) => categories.includes(item.category));
}

export function filterBySeverity<T extends { tone: Tone }>(items: T[], severity: SeverityFilter) {
  if (severity === 'all') {
    return items;
  }
  if (severity === 'critical') {
    return items.filter((item) => item.tone === 'danger');
  }
  if (severity === 'elevated') {
    return items.filter((item) => item.tone === 'warn' || item.tone === 'danger');
  }
  return items.filter((item) => item.tone === 'neutral' || item.tone === 'calm');
}

export function filterEventsByQuery(events: EventItem[], query: string) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return events;
  }
  return events.filter((event) =>
    [event.title, event.region, event.summary, categoryLabels[event.category]].some((value) =>
      value.toLowerCase().includes(normalized)
    )
  );
}

export function formatRelativeTime(timestamp: number) {
  const secondsAgo = Math.max(0, Math.floor((Date.now() - timestamp) / 1000));
  if (secondsAgo < 5) {
    return 'just now';
  }
  if (secondsAgo < 60) {
    return `${secondsAgo}s ago`;
  }
  return `${Math.floor(secondsAgo / 60)}m ago`;
}
