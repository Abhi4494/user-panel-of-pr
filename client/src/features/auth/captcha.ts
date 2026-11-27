import { useCallback, useState } from 'react';

/** Numeric 4-digit code: easy to read and type on any keyboard. */
const ALPHABET = '0123456789';
const LENGTH = 4;

// Tailwind classes backed by `@theme` tokens (listed in full so the compiler picks them up).
const GLYPH_COLORS = ['fill-accent', 'fill-panel-end', 'fill-ink-strong', 'fill-panel-start'] as const;

export const CAPTCHA_VIEW = { width: 130, height: 44 } as const;

export interface CaptchaGlyph {
  char: string;
  x: number;
  y: number;
  rotate: number;
  colorClass: string;
  italic: boolean;
}

export interface CaptchaChallenge {
  code: string;
  glyphs: CaptchaGlyph[];
}

const random = () => crypto.getRandomValues(new Uint32Array(1))[0] / 2 ** 32;
const between = (min: number, max: number) => min + random() * (max - min);
const pick = <T>(items: readonly T[]): T => items[Math.floor(random() * items.length)];

/**
 * UX-only challenge. Real bot protection must be verified by the server once the legacy
 * integration is designed (see docs/implementation-status.md).
 */
export function createCaptchaChallenge(): CaptchaChallenge {
  const { width, height } = CAPTCHA_VIEW;
  const step = (width - 24) / LENGTH;

  const code = Array.from({ length: LENGTH }, () => pick(ALPHABET.split(''))).join('');
  const glyphs = code.split('').map((char, i) => ({
    char,
    x: 14 + i * step + between(-2, 2),
    y: height / 2 + 9 + between(-4, 4),
    rotate: between(-22, 22),
    colorClass: pick(GLYPH_COLORS),
    italic: random() > 0.5,
  }));
  return { code, glyphs };
}

export function isCaptchaMatch(answer: string, challenge: CaptchaChallenge): boolean {
  return answer.trim() === challenge.code;
}

export function useCaptcha() {
  const [challenge, setChallenge] = useState(createCaptchaChallenge);
  const refresh = useCallback(() => setChallenge(createCaptchaChallenge()), []);
  return { challenge, refresh };
}
