import type {
  EventItem,
  FeedCategory,
  LiveDataPatch,
  Metric,
  Tone,
} from '../data/liveEarth';

type FeedLoadResult = {
  category: FeedCategory;
  metricUpdate: Partial<Metric>;
  events: EventItem[];
};

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

type OpenMeteoMarineResponse = {
  current?: {
    sea_surface_temperature?: number;
    wave_height?: number;
  };
};

type StooqRow = {
  symbol: string;
  close: number;
  change: number;
};

type BoundingBox = {
  lamin: number;
  lomin: number;
  lamax: number;
  lomax: number;
};

type RegionalConfig = {
  label: string;
  region: string;
  latitude: number;
  longitude: number;
  bbox?: BoundingBox;
};

const regionalConfigs = {
  india: {
    label: 'India',
    region: 'India',
    latitude: 20.59,
    longitude: 78.96,
    bbox: { lamin: 6, lomin: 68, lamax: 37.5, lomax: 97.5 },
  },
  dubai: {
    label: 'Dubai',
    region: 'Dubai, UAE',
    latitude: 25.2,
    longitude: 55.27,
    bbox: { lamin: 23.5, lomin: 51.5, lamax: 26.5, lomax: 56.8 },
  },
} as const satisfies Record<string, RegionalConfig>;

const marinePoints = [
  { label: 'Bay of Bengal', region: 'India', latitude: 16.5, longitude: 88.5 },
  { label: 'Arabian Sea', region: 'India', latitude: 18.5, longitude: 72.5 },
  { label: 'Persian Gulf', region: 'Dubai, UAE', latitude: 25.35, longitude: 55.1 },
];

const weatherPoints = [
  { label: 'Tokyo', region: 'Japan', lat: 35.68, lon: 139.76 },
  { label: 'London', region: 'United Kingdom', lat: 51.5, lon: -0.12 },
  { label: 'New York', region: 'United States', lat: 40.71, lon: -74.01 },
  { label: 'Dubai', region: 'Dubai, UAE', lat: 25.2, lon: 55.27 },
  { label: 'Mumbai', region: 'India', lat: 19.08, lon: 72.88 },
  { label: 'New Delhi', region: 'India', lat: 28.61, lon: 77.21 },
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

function formatWeatherLine(point: typeof weatherPoints[number], current?: OpenMeteoResponse['current']) {
  return `${point.label}: ${Math.round(current?.wind_speed_10m ?? 0)} kt wind, ${Math.round(
    current?.temperature_2m ?? 0
  )}C.`;
}

function formatMarineLine(point: typeof marinePoints[number], current?: OpenMeteoMarineResponse['current']) {
  return `${point.label}: ${Math.round(current?.sea_surface_temperature ?? 0)}C SST, ${(
    current?.wave_height ?? 0
  ).toFixed(1)} m waves.`;
}

function createUrl(base: string, params: Record<string, string | number>) {
  const url = new URL(base);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, String(value));
  }
  return url.toString();
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

async function loadRegionalEarthquakes(config: RegionalConfig) {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const data = await fetchJson<{ features: EarthquakeFeature[] }>(
    createUrl('https://earthquake.usgs.gov/fdsnws/event/1/query', {
      format: 'geojson',
      starttime: since,
      minlatitude: config.bbox!.lamin,
      maxlatitude: config.bbox!.lamax,
      minlongitude: config.bbox!.lomin,
      maxlongitude: config.bbox!.lomax,
      orderby: 'time',
      limit: 5,
    })
  );

  const strongest = data.features.reduce<EarthquakeFeature | null>((current, feature) => {
    if (!current) {
      return feature;
    }
    return (feature.properties.mag ?? 0) > (current.properties.mag ?? 0) ? feature : current;
  }, null);

  if (!strongest) {
    return {
      id: `live-quake-${config.label.toLowerCase()}`,
      title: `${config.label} seismic monitor`,
      category: 'earthquakes' as const,
      region: config.region,
      latitude: config.latitude,
      longitude: config.longitude,
      tone: 'calm' as Tone,
      summary: `No earthquakes were reported by USGS inside the monitored ${config.label} bounds in the last 24 hours.`,
      stat: '0 events in 24h',
      updatedAt: 'live',
      source: 'USGS',
      details: [
        'This uses a regional bounding-box query against the USGS event API.',
        'A zero reading means no matching events were returned for the current 24-hour window.',
        `Monitor centroid: ${config.latitude.toFixed(2)}, ${config.longitude.toFixed(2)}.`,
      ],
    } satisfies EventItem;
  }

  return {
    id: `live-quake-${config.label.toLowerCase()}`,
    title: `${config.label} seismic monitor`,
    category: 'earthquakes' as const,
    region: config.region,
    latitude: strongest.geometry?.coordinates?.[1] ?? config.latitude,
    longitude: strongest.geometry?.coordinates?.[0] ?? config.longitude,
    tone: toneFromMagnitude(strongest.properties.mag ?? 0),
    summary: `USGS reports ${data.features.length} earthquake${data.features.length === 1 ? '' : 's'} in the last 24 hours inside the monitored ${config.label} bounds.`,
    stat: `${data.features.length} events in 24h`,
    updatedAt: 'live',
    source: 'USGS',
    details: [
      `Strongest event: ${(strongest.properties.mag ?? 0).toFixed(1)} near ${strongest.properties.place || config.region}.`,
      `Most recent timestamp: ${new Date(strongest.properties.time).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      })}.`,
      'This event is based on the USGS regional bounding-box query feed.',
    ],
  } satisfies EventItem;
}

async function loadEarthquakes() {
  const data = await fetchJson<{ features: EarthquakeFeature[] }>(
    'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson'
  );
  const [indiaEvent, dubaiEvent] = await Promise.all([
    loadRegionalEarthquakes(regionalConfigs.india),
    loadRegionalEarthquakes(regionalConfigs.dubai),
  ]);
  const features = data.features.slice(0, 3);
  const count = data.features.length;
  const avgMag =
    data.features.reduce((sum, feature) => sum + (feature.properties.mag ?? 0), 0) /
    Math.max(data.features.length, 1);
  const topMag = Math.max(...data.features.map((feature) => feature.properties.mag ?? 0), 0);

  const events: EventItem[] = [
    indiaEvent,
    dubaiEvent,
    ...features.map((feature) => ({
      id: `live-quake-${feature.id}`,
      title: feature.properties.title || 'Recent earthquake',
      category: 'earthquakes' as const,
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
    })),
  ];

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
  } satisfies FeedLoadResult;
}

async function loadFlights() {
  const [data, indiaData, dubaiData] = await Promise.all([
    fetchJson<OpenSkyResponse>('https://opensky-network.org/api/states/all'),
    fetchJson<OpenSkyResponse>(
      createUrl('https://opensky-network.org/api/states/all', regionalConfigs.india.bbox!)
    ),
    fetchJson<OpenSkyResponse>(
      createUrl('https://opensky-network.org/api/states/all', regionalConfigs.dubai.bbox!)
    ),
  ]);
  const count = data.states?.length ?? 0;
  const indiaCount = indiaData.states?.length ?? 0;
  const dubaiCount = dubaiData.states?.length ?? 0;
  const corridorLoad = Math.min(99, Math.round((count / 22000) * 100));
  const metricUpdate: Partial<Metric> = {
    value: `${(count / 1000).toFixed(1)}k`,
    numericValue: count / 1000,
    suffix: 'k',
    decimals: 1,
    delta: `${corridorLoad}% corridor load`,
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
    {
      id: 'live-flights-india',
      title: 'India airspace monitor',
      category: 'flights',
      region: regionalConfigs.india.region,
      latitude: regionalConfigs.india.latitude,
      longitude: regionalConfigs.india.longitude,
      tone: indiaCount > 420 ? 'danger' : indiaCount > 260 ? 'warn' : 'neutral',
      summary: 'Regional OpenSky state vectors are being counted across the monitored India airspace box.',
      stat: `${indiaCount.toLocaleString()} tracked states`,
      updatedAt: 'live',
      source: 'OpenSky',
      details: [
        'This count comes from a regional bounding-box query to the OpenSky states endpoint.',
        'Coverage depends on volunteer receiver density and the unauthenticated OpenSky feed.',
        `Current India monitor load: ${indiaCount.toLocaleString()} airborne states.`,
      ],
    },
    {
      id: 'live-flights-dubai',
      title: 'Dubai airspace monitor',
      category: 'flights',
      region: regionalConfigs.dubai.region,
      latitude: regionalConfigs.dubai.latitude,
      longitude: regionalConfigs.dubai.longitude,
      tone: dubaiCount > 75 ? 'danger' : dubaiCount > 45 ? 'warn' : 'neutral',
      summary: 'Regional OpenSky state vectors are being counted over the monitored Dubai and Gulf corridor box.',
      stat: `${dubaiCount.toLocaleString()} tracked states`,
      updatedAt: 'live',
      source: 'OpenSky',
      details: [
        'This count comes from a regional bounding-box query to the OpenSky states endpoint.',
        'It reflects airborne state vectors over the Dubai/UAE monitor area, not airport movement totals.',
        `Current Dubai monitor load: ${dubaiCount.toLocaleString()} airborne states.`,
      ],
    },
  ];

  return {
    category: 'flights' as FeedCategory,
    metricUpdate,
    events,
  } satisfies FeedLoadResult;
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
  const dubaiPoint = weatherPoints.find((point) => point.label === 'Dubai') ?? weatherPoints[0];
  const indiaIndices = weatherPoints
    .map((point, index) => ({ point, index }))
    .filter(({ point }) => point.region === 'India');
  const dubaiIndex = weatherPoints.findIndex((point) => point.label === dubaiPoint.label);
  const dubaiCurrent = settled[dubaiIndex]?.current;
  const indiaWind =
    indiaIndices.reduce((sum, { index }) => sum + (settled[index]?.current?.wind_speed_10m ?? 0), 0) /
    Math.max(indiaIndices.length, 1);
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
      details: weatherPoints.map((point, index) => formatWeatherLine(point, settled[index]?.current)),
    },
    {
      id: 'live-weather-india',
      title: 'India weather watch',
      category: 'weather',
      region: 'India',
      latitude: 20.59,
      longitude: 78.96,
      tone: indiaWind > 34 ? 'danger' : indiaWind > 22 ? 'warn' : 'neutral',
      summary: 'Mumbai and New Delhi telemetry is being combined into a live posture check for India.',
      stat: `${Math.round(indiaWind)} kt blended wind`,
      updatedAt: 'live',
      source: 'Open-Meteo',
      details: indiaIndices.map(({ point, index }) => formatWeatherLine(point, settled[index]?.current)),
    },
    {
      id: 'live-weather-dubai',
      title: 'Dubai heat and wind watch',
      category: 'weather',
      region: 'Dubai, UAE',
      latitude: 25.2,
      longitude: 55.27,
      tone: (dubaiCurrent?.wind_speed_10m ?? 0) > 28 ? 'warn' : 'neutral',
      summary: 'Dubai live telemetry is tracking wind and heat stress around the Gulf coast.',
      stat: `${Math.round(dubaiCurrent?.wind_speed_10m ?? 0)} kt wind`,
      updatedAt: 'live',
      source: 'Open-Meteo',
      details: [formatWeatherLine(dubaiPoint, dubaiCurrent)],
    },
  ];

  return {
    category: 'weather' as FeedCategory,
    metricUpdate,
    events,
  } satisfies FeedLoadResult;
}

async function loadOcean() {
  const settled = await Promise.all(
    marinePoints.map((point) =>
      fetchJson<OpenMeteoMarineResponse>(
        createUrl('https://marine-api.open-meteo.com/v1/marine', {
          latitude: point.latitude,
          longitude: point.longitude,
          current: 'sea_surface_temperature,wave_height',
        })
      )
    )
  );

  const avgTemperature =
    settled.reduce((sum, item) => sum + (item.current?.sea_surface_temperature ?? 0), 0) /
    Math.max(settled.length, 1);
  const avgWaveHeight =
    settled.reduce((sum, item) => sum + (item.current?.wave_height ?? 0), 0) / Math.max(settled.length, 1);

  const metricUpdate: Partial<Metric> = {
    value: `+${avgTemperature.toFixed(1)}C`,
    numericValue: avgTemperature,
    delta: `${avgWaveHeight.toFixed(1)} m avg waves`,
    prefix: '+',
    suffix: 'C',
    decimals: 1,
    tone: avgTemperature > 30.5 ? 'danger' : avgTemperature > 28.5 ? 'warn' : 'neutral',
  };

  const indiaReadings = marinePoints
    .map((point, index) => ({ point, index }))
    .filter(({ point }) => point.region === regionalConfigs.india.region);
  const indiaTemperature =
    indiaReadings.reduce((sum, { index }) => sum + (settled[index]?.current?.sea_surface_temperature ?? 0), 0) /
    Math.max(indiaReadings.length, 1);
  const indiaWaveHeight =
    indiaReadings.reduce((sum, { index }) => sum + (settled[index]?.current?.wave_height ?? 0), 0) /
    Math.max(indiaReadings.length, 1);
  const dubaiIndex = marinePoints.findIndex((point) => point.region === regionalConfigs.dubai.region);
  const dubaiCurrent = settled[dubaiIndex]?.current;

  const events: EventItem[] = [
    {
      id: 'live-ocean-india',
      title: 'India marine monitor',
      category: 'ocean',
      region: regionalConfigs.india.region,
      latitude: regionalConfigs.india.latitude,
      longitude: regionalConfigs.india.longitude,
      tone: indiaWaveHeight > 2.6 ? 'warn' : indiaTemperature > 30.5 ? 'warn' : 'neutral',
      summary: 'Arabian Sea and Bay of Bengal marine readings are being combined into a live India sea-state snapshot.',
      stat: `${indiaWaveHeight.toFixed(1)} m blended waves`,
      updatedAt: 'live',
      source: 'Open-Meteo Marine',
      details: indiaReadings.map(({ point, index }) => formatMarineLine(point, settled[index]?.current)),
    },
    {
      id: 'live-ocean-dubai',
      title: 'Dubai gulf marine monitor',
      category: 'ocean',
      region: regionalConfigs.dubai.region,
      latitude: regionalConfigs.dubai.latitude,
      longitude: regionalConfigs.dubai.longitude,
      tone: (dubaiCurrent?.wave_height ?? 0) > 1.6 ? 'warn' : 'neutral',
      summary: 'Persian Gulf marine conditions are being tracked off the Dubai coast.',
      stat: `${(dubaiCurrent?.wave_height ?? 0).toFixed(1)} m waves`,
      updatedAt: 'live',
      source: 'Open-Meteo Marine',
      details: [formatMarineLine(marinePoints[dubaiIndex], dubaiCurrent)],
    },
  ];

  return {
    category: 'ocean' as FeedCategory,
    metricUpdate,
    events,
  } satisfies FeedLoadResult;
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
      region: 'Global indices',
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
  } satisfies FeedLoadResult;
}

export async function fetchLiveDataPatch(): Promise<LiveDataPatch | null> {
  const settled = await Promise.allSettled([
    loadEarthquakes(),
    loadFlights(),
    loadWeather(),
    loadOcean(),
    loadMarkets(),
  ]);
  const patch: LiveDataPatch = {
    fetchedAt: Date.now(),
    liveCategories: [],
    detail: 'Live fetch unavailable. Falling back to demo telemetry.',
    metrics: {},
    events: {},
    categories: {},
  };

  const loaders: FeedCategory[] = ['earthquakes', 'flights', 'weather', 'ocean', 'markets'];

  for (const [index, result] of settled.entries()) {
    const category = loaders[index];
    if (result.status !== 'fulfilled') {
      patch.categories![category] = {
        status: 'error',
        detail: result.reason instanceof Error ? result.reason.message : 'Live request failed',
        updatedAt: patch.fetchedAt,
      };
      continue;
    }
    patch.liveCategories.push(result.value.category);
    patch.metrics![result.value.category] = result.value.metricUpdate;
    patch.events![result.value.category] = result.value.events;
    patch.categories![result.value.category] = {
      status: 'live',
      detail: `${result.value.events.length} live events mapped`,
      updatedAt: patch.fetchedAt,
    };
  }

  if (patch.liveCategories.length === 0) {
    return null;
  }

  patch.detail = `Live categories: ${patch.liveCategories.join(', ')}`;
  return patch;
}
