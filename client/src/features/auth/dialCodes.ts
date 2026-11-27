import type { DialCode } from '@/components/ui/PhoneField';

/** Default selection (reference site defaults to India). */
export const DEFAULT_DIAL_COUNTRY = 'IN';

// Short list for now; the legacy site offers every country (full list is a follow-up).
export const DIAL_CODES: readonly DialCode[] = [
  { country: 'IN', dial: '+91' },
  { country: 'US', dial: '+1' },
  { country: 'GB', dial: '+44' },
  { country: 'AE', dial: '+971' },
  { country: 'AU', dial: '+61' },
  { country: 'CA', dial: '+1' },
  { country: 'DE', dial: '+49' },
  { country: 'FR', dial: '+33' },
  { country: 'SG', dial: '+65' },
];
