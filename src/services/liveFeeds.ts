import type {
  EventItem,
  FeedCategory,
  LiveDataPatch,
  Metric,
  Tone,
} from '../data/liveEarth';

type EarthquakeFeature = {
  id: string;
  properties: {
    mag: number | null;
    place: string;
    time: number;
    title: string;
  };
  geometry?: {
    coordinates?: [number, number, number];
  };
};

type OpenSkyResponse = {
  time: number;
  states: unknown[] | null;
};

type OpenMeteoResponse = {
  current?: {
    temperature_2m?: number;
    wind_speed_10m?: number;
  };
};

type StooqRow = {
  symbol: string;
  close: number;
  change: number;
};

const weatherPoints = [
  { label: 'Tokyo', lat: 35.68, lon: 139.76 },
  { label: 'London', lat: 51.5, lon: -0.12 },
  { label: 'New York', lat: 40.71, lon: -74.01 },
];

function toneFromMagnitude(value: number): Tone {
  if (value >= 6) {
    return 'danger';
  }
  if (value >= 5) {
    return 'warn';
  }
  return 'neutral';
}

function toneFromNegative(value: number): Tone {
  if (value <= -1.2) {
    return 'danger';
  }
  if (value < 0) {
    return 'warn';
  }
  return 'calm';
}

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }
  return response.json() as Promise<T>;
}

async function fetchText(url: string) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }
  return response.text();
}

async function loadEarthquakes() {
  const data = await fetchJson<{ features: EarthquakeFeature[] }>(
    'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson'
  );
  const features = data.features.slice(0, 3);
  const count = data.features.length;
  const avgMag =
    data.features.reduce((sum, feature) => sum + (feature.properties.mag ?? 0), 0) /
    Math.max(data.features.length, 1);
  const topMag = Math.max(...data.features.map((feature) => feature.properties.mag ?? 0), 0);

  const events: EventItem[] = features.map((feature) => ({
    id: `live-quake-${feature.id}`,
    title: feature.properties.title || 'Recent earthquake',
    category: 'earthquakes',
    region: feature.properties.place || 'Global seismic feed',
    latitude: feature.geometry?.coordinates?.[1],
    longitude: feature.geometry?.coordinates?.[0],
    tone: toneFromMagnitude(feature.properties.mag ?? 0),
    summary: `Magnitude ${(feature.properties.mag ?? 0).toFixed(1)} event reported in the daily USGS feed.`,
    stat: `${count} events today`,
    updatedAt: 'live',
    source: 'USGS',
    details: [
      `Source region: ${feature.properties.place || 'Unknown'}.`,
      `Magnitude ${(feature.properties.mag ?? 0).toFixed(1)} recorded at ${new Date(feature.properties.time).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      })}.`,
      'This event is pulled from the public USGS earthquake day feed.',
    ],
  }));

  const metricUpdate: Partial<Metric> = {
    value: `${count}`,
    numericValue: count,
    delta: `${avgMag.toFixed(1)} avg mag`,
    tone: toneFromMagnitude(topMag),
  };

  return {
    category: 'earthquakes' as FeedCategory,
    metricUpdate,
    events,
  };
}

async function loadFlights() {
  const data = await fetchJson<OpenSkyResponse>('https://opensky-network.org/api/states/all');
  const count = data.states?.length ?? 0;
  const metricUpdate: Partial<Metric> = {
    value: `${(count / 1000).toFixed(1)}k`,
    numericValue: count / 1000,
    suffix: 'k',
    decimals: 1,
    delta: `${Math.min(99, Math.round((count / 22000) * 100))}% corridor load`,
    tone: count > 17000 ? 'danger' : count > 14500 ? 'warn' : 'neutral',
  };
  const events: EventItem[] = [
    {
      id: 'live-flights-opensky',
      title: 'OpenSky traffic snapshot',
      category: 'flights',
      region: 'Global airspace',
      tone: metricUpdate.tone ?? 'neutral',
      summary: 'Anonymous state vectors show current airborne density across monitored routes.',
      stat: `${count.toLocaleString()} active states`,
      updatedAt: 'live',
      source: 'OpenSky',
      details: [
        'OpenSky anonymous traffic data was used for this snapshot.',
        'The count reflects currently reported aircraft state vectors.',
        'Traffic saturation can swing quickly based on radar coverage and feed availability.',
      ],
    },
  ];

  return {
    category: 'flights' as FeedCategory,
    metricUpdate,
    events,
  };
}

async function loadWeather() {
  const settled = await Promise.all(
    weatherPoints.map((point) =>
      fetchJson<OpenMeteoResponse>(
        `https://api.open-meteo.com/v1/forecast?latitude=${point.lat}&longitude=${point.lon}&current=temperature_2m,wind_speed_10m`
      )
    )
  );
  const avgWind =
    settled.reduce((sum, item) => sum + (item.current?.wind_speed_10m ?? 0), 0) /
    Math.max(settled.length, 1);
  const activeCells = Math.round(avgWind * 7);
  const metricUpdate: Partial<Metric> = {
    value: `${activeCells}`,
    numericValue: activeCells,
    delta: `${Math.round(avgWind)} kt avg wind`,
    tone: avgWind > 34 ? 'danger' : avgWind > 22 ? 'warn' : 'neutral',
  };
  const events: EventItem[] = [
    {
      id: 'live-weather-openmeteo',
      title: 'Open-Meteo wind scan',
      category: 'weather',
      region: 'Tracked cities',
      tone: metricUpdate.tone ?? 'neutral',
      summary: 'Current wind snapshots are being aggregated across key urban nodes.',
      stat: metricUpdate.delta ?? 'live wind update',
      updatedAt: 'live',
      source: 'Open-Meteo',
      details: weatherPoints.map((point, index) => {
        const current = settled[index]?.current;
        return `${point.label}: ${Math.round(current?.wind_speed_10m ?? 0)} kt wind, ${Math.round(
          current?.temperature_2m ?? 0
        )}C.`;
      }),
    },
  ];

  return {
    category: 'weather' as FeedCategory,
    metricUpdate,
    events,
  };
}

async function loadMarkets() {
  const csv = await fetchText('https://stooq.com/q/l/?s=%5Espx,%5Eukx,%5Enkx&f=sd2t2ohlcvn&e=csv');
  const lines = csv.trim().split('\n').slice(1);
  const rows: StooqRow[] = lines
    .map((line) => line.split(','))
    .filter((parts) => parts.length >= 8)
    .map((parts) => {
      const close = Number(parts[6]);
      const open = Number(parts[3]);
      const change = open ? ((close - open) / open) * 100 : 0;
      return {
        symbol: parts[7] || parts[0],
        close,
        change,
      };
    })
    .filter((row) => Number.isFinite(row.close));

  const avgChange =
    rows.reduce((sum, row) => sum + row.change, 0) /
    Math.max(rows.length, 1);

  const metricUpdate: Partial<Metric> = {
    value: `${avgChange >= 0 ? '+' : ''}${avgChange.toFixed(1)}%`,
    numericValue: avgChange,
    prefix: avgChange >= 0 ? '+' : '',
    suffix: '%',
    decimals: 1,
    delta: `${rows.length} indices synced`,
    tone: toneFromNegative(avgChange),
  };

  const events: EventItem[] = [
    {
      id: 'live-markets-stooq',
      title: 'Index basket update',
      category: 'markets',
      region: 'US / UK / JP',
      tone: metricUpdate.tone ?? 'neutral',
      summary: 'Public index snapshots were aggregated from a lightweight basket.',
      stat: metricUpdate.value ?? '0.0%',
      updatedAt: 'live',
      source: 'Stooq',
      details: rows.map((row) => `${row.symbol}: ${row.change >= 0 ? '+' : ''}${row.change.toFixed(2)}%`),
    },
  ];

  return {
    category: 'markets' as FeedCategory,
    metricUpdate,
    events,
  };
}

export async function fetchLiveDataPatch(): Promise<LiveDataPatch | null> {
  const settled = await Promise.allSettled([loadEarthquakes(), loadFlights(), loadWeather(), loadMarkets()]);
  const patch: LiveDataPatch = {
    fetchedAt: Date.now(),
    liveCategories: [],
    detail: 'Live fetch unavailable. Falling back to demo telemetry.',
    metrics: {},
    events: {},
  };

  for (const result of settled) {
    if (result.status !== 'fulfilled') {
      continue;
    }
    patch.liveCategories.push(result.value.category);
    patch.metrics![result.value.category] = result.value.metricUpdate;
    patch.events![result.value.category] = result.value.events;
  }

  if (patch.liveCategories.length === 0) {
    return null;
  }

  patch.detail = `Live categories: ${patch.liveCategories.join(', ')}`;
  return patch;
}
