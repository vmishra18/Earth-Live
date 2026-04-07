import type { DashboardSnapshot, FeedCategory } from '../data/liveEarth';
import { deriveRegionStats } from './regions';

export type HistoryPoint = {
  label: string;
  value: number;
  secondaryValue?: number;
};

export function deriveCategoryHistory(history: DashboardSnapshot[], category: FeedCategory): HistoryPoint[] {
  const recent = history.slice(-7);
  return recent.map((snapshot, index) => ({
    label: index === recent.length - 1 ? 'Now' : `${recent.length - index - 1} back`,
    value: snapshot.metrics.find((metric) => metric.category === category)?.numericValue ?? 0,
  }));
}

export function deriveRegionHistory(history: DashboardSnapshot[], region: string): HistoryPoint[] {
  const recent = history.slice(-7);
  return recent.map((snapshot, index) => ({
    label: index === recent.length - 1 ? 'Now' : `${recent.length - index - 1} back`,
    value: deriveRegionStats(snapshot, region).events,
  }));
}

export function deriveRegionCompareHistory(
  history: DashboardSnapshot[],
  primaryRegion: string,
  secondaryRegion: string
): HistoryPoint[] {
  const recent = history.slice(-7);
  return recent.map((snapshot, index) => ({
    label: index === recent.length - 1 ? 'Now' : `${recent.length - index - 1} back`,
    value: deriveRegionStats(snapshot, primaryRegion).events,
    secondaryValue: deriveRegionStats(snapshot, secondaryRegion).events,
  }));
}
