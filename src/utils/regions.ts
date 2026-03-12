import type { DashboardSnapshot, FeedCategory, EventItem } from '../data/liveEarth';

export type RegionFocus = {
  name: string;
  category: FeedCategory;
  event: EventItem;
  stat: string;
  summary: string;
  relatedEvents: EventItem[];
};

function matchesRegion(event: EventItem, region: string) {
  const normalized = region.toLowerCase();
  return (
    event.region.toLowerCase().includes(normalized) ||
    normalized.includes(event.region.toLowerCase()) ||
    event.summary.toLowerCase().includes(normalized)
  );
}

export function deriveRegionFocus(snapshot: DashboardSnapshot): RegionFocus[] {
  return snapshot.events.slice(0, 4).map((event) => ({
    name: event.region,
    category: event.category,
    event,
    stat: event.stat,
    summary: event.summary,
    relatedEvents: snapshot.events.filter((candidate) => matchesRegion(candidate, event.region)),
  }));
}

export function deriveRegionDetail(snapshot: DashboardSnapshot, region: string) {
  const relatedEvents = snapshot.events.filter((event) => matchesRegion(event, region));
  const relatedTimeline = snapshot.timeline.filter((entry) =>
    relatedEvents.some((event) => event.id === entry.eventId)
  );
  const relatedHotspots = snapshot.hotspots.filter(
    (hotspot) =>
      hotspot.region.toLowerCase().includes(region.toLowerCase()) ||
      region.toLowerCase().includes(hotspot.region.toLowerCase())
  );

  return {
    region,
    relatedEvents,
    relatedTimeline,
    relatedHotspots,
  };
}
