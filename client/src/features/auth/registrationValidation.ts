import { isCaptchaMatch, type CaptchaChallenge } from './captcha';
import { validateLoginField, validationMessages } from './validation';

export interface RegistrationValues {
  fullName: string;
  phone: string;
  /** Ids of the selected products (at least one). */
  product: string[];
  company: string;
  email: string;
  password: string;
  confirmPassword: string;
  terms: boolean;
  captcha: string;
}

export type RegistrationField = keyof RegistrationValues;
export type RegistrationErrors = Partial<Record<RegistrationField, string>>;

export const registrationMessages = {
  phone: 'Enter a valid phone number (6–15 digits).',
  passwordMismatch: 'Passwords do not match.',
  terms: 'You must accept the Terms & Conditions and Privacy Policy.',
  captcha: 'Captcha does not match.',
} as const;

const PHONE_PATTERN = /^\d{6,15}$/;

/** Returns an error message, or `null` when the field is valid. */
export function validateRegistrationField(
  field: RegistrationField,
  values: RegistrationValues,
  challenge: CaptchaChallenge,
): string | null {
  if (field === 'terms') return values.terms ? null : registrationMessages.terms;

  if (field === 'product') return values.product.length > 0 ? null : validationMessages.required;

  const value = values[field];
  if (value.trim() === '') return validationMessages.required;

  switch (field) {
    case 'email':
    case 'password':
      return validateLoginField(field, value);
    case 'phone':
      return PHONE_PATTERN.test(value.replace(/[\s-]/g, '')) ? null : registrationMessages.phone;
    case 'confirmPassword':
      return value === values.password ? null : registrationMessages.passwordMismatch;
    case 'captcha':
      return isCaptchaMatch(value, challenge) ? null : registrationMessages.captcha;
    default:
      return null;
  }
}

export function validateRegistrationForm(values: RegistrationValues, challenge: CaptchaChallenge): RegistrationErrors {
  const errors: RegistrationErrors = {};
  for (const field of Object.keys(values) as RegistrationField[]) {
    const message = validateRegistrationField(field, values, challenge);
    if (message) errors[field] = message;
  }
  return errors;
}
