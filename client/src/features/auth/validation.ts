/**
 * Login validation, mirroring the legacy Parsley.js rules on /Account/Login:
 *   email:    required, type=email
 *   password: required, pattern (digit + lowercase + uppercase), minlength 6
 * Messages are Parsley's defaults / the legacy custom message, verbatim.
 * Like Parsley, only the highest-priority failing rule is reported
 * (required > type > pattern > minlength).
 */

export interface LoginValues {
  email: string;
  password: string;
}

export type LoginField = keyof LoginValues;

/** `undefined` = not validated yet, `null` = valid, `string` = error message. */
export type FieldResult = string | null | undefined;

export const validationMessages = {
  required: 'This value is required.',
  email: 'This value should be a valid email.',
  passwordPattern:
    'Password must be at least 6 characters having one special, a numeric, a lowercase and an uppercase alphabet.',
  passwordMinLength: 'This value is too short. It should have 6 characters or more.',
} as const;

// WHATWG input[type=email] pattern, but requiring a dot in the domain (as Parsley does).
const EMAIL_PATTERN =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

// Copied from the legacy markup. Note: despite the message, it does not require a special character.
const PASSWORD_PATTERN = /^(?:(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).*)$/;
const PASSWORD_MIN_LENGTH = 6;

export function validateLoginField(field: LoginField, value: string): string | null {
  if (value.trim() === '') return validationMessages.required;

  if (field === 'email') {
    return EMAIL_PATTERN.test(value) ? null : validationMessages.email;
  }

  if (!PASSWORD_PATTERN.test(value)) return validationMessages.passwordPattern;
  if (value.length < PASSWORD_MIN_LENGTH) return validationMessages.passwordMinLength;
  return null;
}

export function validateLoginForm(values: LoginValues): Record<LoginField, string | null> {
  return {
    email: validateLoginField('email', values.email),
    password: validateLoginField('password', values.password),
  };
}
