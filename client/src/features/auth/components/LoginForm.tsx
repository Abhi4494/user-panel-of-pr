import { useState, type ChangeEvent, type FocusEvent, type FormEvent } from 'react';
import { ArrowRight, Lock, Mail } from 'lucide-react';
import { CaptchaField } from './CaptchaField';
import { Link } from '@/components/ui/Link';
import { SoftButton } from '@/components/ui/SoftButton';
import { navigate } from '@/router';
import { TextField } from '@/components/ui/TextField';
import { showToast } from '@/components/ui/Toaster';
import { login } from '@/features/auth/api/login';
import { isCaptchaMatch, useCaptcha } from '@/features/auth/captcha';
import { registrationMessages } from '@/features/auth/registrationValidation';
import {
  validateLoginField,
  validateLoginForm,
  type FieldResult,
  type LoginField,
  type LoginValues,
} from '@/features/auth/validation';

const linkClass = 'font-semibold text-accent hover:underline focus-visible:outline-2 focus-visible:outline-accent';

export function LoginForm() {
  const [values, setValues] = useState<LoginValues>({ email: '', password: '' });
  const [results, setResults] = useState<Record<LoginField, FieldResult>>({
    email: undefined,
    password: undefined,
  });
  const { challenge, refresh } = useCaptcha();
  const [captcha, setCaptcha] = useState('');
  const [captchaError, setCaptchaError] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const field = event.target.name as LoginField;
    const { value } = event.target;
    setValues((prev) => ({ ...prev, [field]: value }));
    // Like Parsley: once a field has failed, re-validate it as the user types.
    if (typeof results[field] === 'string') {
      setResults((prev) => ({ ...prev, [field]: validateLoginField(field, value) }));
    }
  }

  function handleBlur(event: FocusEvent<HTMLInputElement>) {
    const field = event.target.name as LoginField;
    setResults((prev) => ({ ...prev, [field]: validateLoginField(field, event.target.value) }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const nextResults = validateLoginForm(values);
    setResults(nextResults);
    const nextCaptchaError = isCaptchaMatch(captcha, challenge) ? undefined : registrationMessages.captcha;
    setCaptchaError(nextCaptchaError);

    const firstInvalid = (Object.keys(nextResults) as LoginField[]).find((field) => nextResults[field]);
    const focusTarget = firstInvalid ?? (nextCaptchaError ? 'captcha' : undefined);
    if (focusTarget) {
      (form.elements.namedItem(focusTarget) as HTMLInputElement | null)?.focus();
      return;
    }

    setIsSubmitting(true);
    try {
      const returnUrl = new URLSearchParams(window.location.search).get('ReturnUrl') ?? undefined;
      const { redirectUrl } = await login({ ...values, returnUrl });
      // Same-app paths (e.g. /dashboard/index) navigate client-side; anything else is a full redirect.
      if (redirectUrl.startsWith('/') && !redirectUrl.startsWith('//')) navigate(redirectUrl);
      else window.location.assign(redirectUrl);
    } catch (error) {
      showToast('error', error instanceof Error ? error.message : 'Unable to log in.');
      refresh();
      setCaptcha('');
      setIsSubmitting(false);
    }
  }

  return (
    <form className="grid grid-cols-1 gap-(--density-gap)" noValidate onSubmit={handleSubmit}>
      <TextField
        id="email"
        name="email"
        type="email"
        label="Email Address"
        startIcon={<Mail size={16} />}
        placeholder="you@company.com"
        autoComplete="username"
        required
        value={values.email}
        onChange={handleChange}
        onBlur={handleBlur}
        error={results.email ?? undefined}
        isValid={results.email === null}
      />
      <TextField
        id="password"
        name="password"
        type="password"
        label="Password"
        startIcon={<Lock size={16} />}
        placeholder="••••••••"
        autoComplete="current-password"
        required
        value={values.password}
        onChange={handleChange}
        onBlur={handleBlur}
        error={results.password ?? undefined}
        isValid={results.password === null}
      />

      <CaptchaField
        id="captcha"
        name="captcha"
        challenge={challenge}
        onRefresh={() => {
          refresh();
          setCaptcha('');
          setCaptchaError(undefined);
        }}
        value={captcha}
        onChange={(event) => {
          setCaptcha(event.target.value);
          setCaptchaError(undefined);
        }}
        error={captchaError}
      />

      <Link href="/account/resetpassword" className={`justify-self-end text-sm ${linkClass}`}>
        Forgot Password
      </Link>

      <SoftButton type="submit" disabled={isSubmitting} aria-busy={isSubmitting} className="w-full">
        Log in
        <ArrowRight size={18} aria-hidden />
      </SoftButton>

      <p className="text-sm text-muted">
        Don&apos;t have an account?{' '}
        <Link href="/account/registration" className={linkClass}>
          Register
        </Link>
      </p>
    </form>
  );
}
