export type ScreenKey = 'overview' | 'globe' | 'alerts' | 'replay';

export type ScreenOption = {
  key: ScreenKey;
  label: string;
  short: string;
};

export const screenOptions: ScreenOption[] = [
  { key: 'overview', label: 'Overview', short: 'HOME' },
  { key: 'globe', label: 'Map', short: 'MAP' },
  { key: 'alerts', label: 'Alerts', short: 'ALT' },
  { key: 'replay', label: 'Replay', short: 'RPL' },
];
