import { allCategories, type DashboardSnapshot, type EventItem, type FeedCategory, type Tone } from '../data/liveEarth';

export type SourceMeta = {
  label: 'Live' | 'Fallback' | 'Demo';
  detail: string;
  tone: Tone;
  isLive: boolean;
};

export function deriveCategorySourceMeta(
  snapshot: DashboardSnapshot,
  category: FeedCategory
): SourceMeta {
  const categoryStatus = snapshot.sourceStatus.categories[category];
  if (categoryStatus) {
    return {
      label:
        categoryStatus.status === 'live'
          ? 'Live'
          : categoryStatus.status === 'demo'
            ? 'Demo'
            : 'Fallback',
      detail: categoryStatus.detail,
      tone:
        categoryStatus.status === 'live'
          ? 'calm'
          : categoryStatus.status === 'error'
            ? 'danger'
            : categoryStatus.status === 'demo'
              ? 'warn'
              : 'neutral',
      isLive: categoryStatus.status === 'live',
    };
  }

  if (snapshot.sourceStatus.liveCategories.includes(category)) {
    return {
      label: 'Live',
      detail: 'Feed-backed',
      tone: 'calm',
      isLive: true,
    };
  }

  if (snapshot.sourceStatus.mode === 'demo') {
    return {
      label: 'Demo',
      detail: 'Generated telemetry',
      tone: 'warn',
      isLive: false,
    };
  }

  return {
    label: 'Fallback',
    detail: 'Generated fallback',
    tone: 'neutral',
    isLive: false,
  };
}

export function deriveEventSourceMeta(snapshot: DashboardSnapshot, event: EventItem): SourceMeta {
  const categoryMeta = deriveCategorySourceMeta(snapshot, event.category);

  if (categoryMeta.isLive || event.updatedAt === 'live') {
    return {
      ...categoryMeta,
      detail: event.source,
    };
  }

  return {
    ...categoryMeta,
    detail: `${event.source} fallback`,
  };
}

export function deriveFeedHealth(snapshot: DashboardSnapshot) {
  return allCategories.map((category) => ({
    category,
    source: deriveCategorySourceMeta(snapshot, category),
    eventCount: snapshot.events.filter((event) => event.category === category).length,
    updatedAt: snapshot.sourceStatus.categories[category]?.updatedAt ?? snapshot.sourceStatus.updatedAt,
  }));
}
