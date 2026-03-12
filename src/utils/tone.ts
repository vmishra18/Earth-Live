import { colors } from '../theme';
import type { Tone } from '../data/liveEarth';

const toneMap: Record<Tone, string> = {
  calm: colors.mint,
  neutral: colors.sky,
  warn: colors.sun,
  danger: colors.coral,
};

export function toneColor(tone: Tone) {
  return toneMap[tone];
}
