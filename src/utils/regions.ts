import type { DashboardSnapshot, FeedCategory, EventItem } from '../data/liveEarth';

export type RegionFocus = {
  name: string;
  category: FeedCategory;
  event: EventItem;
  stat: string;
  summary: string;
  relatedEvents: EventItem[];
};

const regionProfiles = [
  { name: 'India', aliases: ['india', 'mumbai', 'new delhi', 'delhi', 'bay of bengal', 'arabian sea'] },
  { name: 'Dubai', aliases: ['dubai', 'uae', 'united arab emirates', 'persian gulf', 'gulf'] },
] as const;

function normalize(value: string) {
  return value.trim().toLowerCase();
}

function resolveRegionTerms(region: string) {
  const normalized = normalize(region);
  const profile = regionProfiles.find(
    (candidate) =>
      normalize(candidate.name) === normalized ||
      candidate.aliases.some((alias) => normalized.includes(alias) || alias.includes(normalized))
  );

  return profile ? [normalize(profile.name), ...profile.aliases] : [normalized];
}

function eventMatchesRegion(event: EventItem, region: string) {
  const haystack = [event.region, event.summary, event.title, ...event.details].join(' ').toLowerCase();
  return resolveRegionTerms(region).some((term) => haystack.includes(term));
}

function hotspotMatchesRegion(region: string, value: string) {
  const normalizedValue = value.toLowerCase();
  return resolveRegionTerms(region).some((term) => normalizedValue.includes(term));
}

export function matchesRegionText(value: string, region: string) {
  return hotspotMatchesRegion(region, value);
}

export function matchesRegionEvent(event: EventItem, region: string) {
  return eventMatchesRegion(event, region);
}

export function deriveRegionOptions(snapshot: DashboardSnapshot, watchlist: string[] = []) {
  const candidates = [
    ...watchlist,
    ...deriveRegionFocus(snapshot).map((item) => item.name),
    ...snapshot.events.map((event) => event.region),
  ];

  return candidates.filter((value, index) => value && candidates.indexOf(value) === index).slice(0, 8);
}

export function deriveRegionStats(snapshot: DashboardSnapshot, region: string) {
  const relatedEvents = snapshot.events.filter((event) => eventMatchesRegion(event, region));
  const eventIds = new Set(relatedEvents.map((event) => event.id));
  const criticalCount = relatedEvents.filter((event) => event.tone === 'danger').length;
  const elevatedCount = relatedEvents.filter((event) => event.tone === 'warn' || event.tone === 'danger').length;
  const hotspots = snapshot.hotspots.filter(
    (hotspot) => hotspotMatchesRegion(region, hotspot.region) || hotspotMatchesRegion(region, hotspot.label)
  );
  const alerts = snapshot.alerts.filter((alert) => eventIds.has(alert.eventId));

  return {
    region,
    events: relatedEvents.length,
    alerts: alerts.length,
    hotspots: hotspots.length,
    liveCategories: relatedEvents.filter((event) => event.updatedAt === 'live').length,
    criticalCount,
    elevatedCount,
    categories: Array.from(new Set(relatedEvents.map((event) => event.category))),
  };
}

export function filterSnapshotByRegion(snapshot: DashboardSnapshot, region: string): DashboardSnapshot {
  const relatedEvents = snapshot.events.filter((event) => eventMatchesRegion(event, region));
  if (!relatedEvents.length) {
    return {
      ...snapshot,
      hotspots: [],
      trending: [],
      alerts: [],
      timeline: [],
      satellites: [],
      markets: [],
      watchZones: [],
      feed: [],
      weatherBands: [],
      events: [],
      summary: {
        ...snapshot.summary,
        activeSignals: '0',
        alerts: '0',
        coverage: region,
      },
    };
  }

  const eventIds = new Set(relatedEvents.map((event) => event.id));
  const linkedHotspots = snapshot.hotspots.filter(
    (hotspot) => hotspotMatchesRegion(region, hotspot.region) || hotspotMatchesRegion(region, hotspot.label)
  );
  const linkedMarkets = snapshot.markets.filter((item) => eventIds.has(item.eventId));
  const linkedWeatherBands = snapshot.weatherBands.filter((item) => eventIds.has(item.eventId));
  const linkedWatchZones = snapshot.watchZones.filter((item) => eventIds.has(item.eventId));
  const linkedTrending = snapshot.trending.filter((item) => eventIds.has(item.eventId));
  const linkedFeed = snapshot.feed.filter((item) => eventIds.has(item.eventId));
  const linkedTimeline = snapshot.timeline.filter((item) => eventIds.has(item.eventId));
  const linkedAlerts = snapshot.alerts.filter((item) => eventIds.has(item.eventId));
  const linkedSatellites = snapshot.satellites.filter((item) => eventIds.has(item.eventId));

  return {
    ...snapshot,
    hotspots: linkedHotspots,
    trending: linkedTrending,
    alerts: linkedAlerts,
    timeline: linkedTimeline,
    satellites: linkedSatellites,
    markets: linkedMarkets,
    watchZones: linkedWatchZones,
    feed: linkedFeed,
    weatherBands: linkedWeatherBands,
    events: relatedEvents,
    summary: {
      activeSignals: `${relatedEvents.length + linkedHotspots.length}`,
      alerts: `${linkedAlerts.length}`,
      coverage: region,
      replayWindow: snapshot.summary.replayWindow,
    },
  };
}

export function filterHistoryByRegion(history: DashboardSnapshot[], region: string) {
  return history.map((snapshot) => filterSnapshotByRegion(snapshot, region));
}

export function deriveRegionFocus(snapshot: DashboardSnapshot): RegionFocus[] {
  const prioritized = regionProfiles
    .map((profile) => {
      const relatedEvents = snapshot.events.filter((event) => eventMatchesRegion(event, profile.name));
      const primaryEvent = relatedEvents[0];

      if (!primaryEvent) {
        return null;
      }

      return {
        name: profile.name,
        category: primaryEvent.category,
        event: primaryEvent,
        stat: relatedEvents.length > 1 ? `${relatedEvents.length} linked signals` : primaryEvent.stat,
        summary: primaryEvent.summary,
        relatedEvents,
      } satisfies RegionFocus;
    })
    .filter(Boolean) as RegionFocus[];

  const fallback = snapshot.events
    .filter((event) => !prioritized.some((item) => item.relatedEvents.some((candidate) => candidate.id === event.id)))
    .slice(0, 4 - prioritized.length)
    .map((event) => ({
      name: event.region,
      category: event.category,
      event,
      stat: event.stat,
      summary: event.summary,
      relatedEvents: snapshot.events.filter((candidate) => eventMatchesRegion(candidate, event.region)),
    }));

  return [...prioritized, ...fallback].slice(0, 4);
}

export function deriveRegionDetail(snapshot: DashboardSnapshot, region: string) {
  const profile = regionProfiles.find((candidate) => resolveRegionTerms(region).includes(normalize(candidate.name)));
  const relatedEvents = snapshot.events.filter((event) => eventMatchesRegion(event, region));
  const relatedTimeline = snapshot.timeline.filter((entry) =>
    relatedEvents.some((event) => event.id === entry.eventId)
  );
  const relatedHotspots = snapshot.hotspots.filter(
    (hotspot) => hotspotMatchesRegion(region, hotspot.region) || hotspotMatchesRegion(region, hotspot.label)
  );

  return {
    region: profile?.name ?? region,
    relatedEvents,
    relatedTimeline,
    relatedHotspots,
  };
}
