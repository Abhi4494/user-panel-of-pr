import { ArrowRight, Lock } from 'lucide-react';
import { useEffect, useState, type FormEvent } from 'react';
import { Link } from '@/components/ui/Link';
import { SoftButton } from '@/components/ui/SoftButton';
import { TextField } from '@/components/ui/TextField';
import { showToast } from '@/components/ui/Toaster';
import { checkResetLink, setPassword } from '@/features/auth/api/setPassword';
import { registrationMessages } from '@/features/auth/registrationValidation';
import { validateLoginField, validationMessages } from '@/features/auth/validation';
import { navigate } from '@/router';

const linkClass = 'font-semibold text-accent hover:underline focus-visible:outline-2 focus-visible:outline-accent';

type Field = 'password' | 'confirmPassword';
type Errors = Partial<Record<Field, string>>;
type LinkState = { status: 'checking' } | { status: 'valid' } | { status: 'invalid'; message: string };

function validate(field: Field, values: Record<Field, string>): string | undefined {
  const value = values[field];
  if (value.trim() === '') return validationMessages.required;
  if (field === 'password') return validateLoginField('password', value) ?? undefined;
  return value === values.password ? undefined : registrationMessages.passwordMismatch;
}

/** New-password form for the link in the reset e-mail (`/accounts/setpassword/:resetId`). */
export function SetPasswordForm({ resetId }: { resetId: string }) {
  const [values, setValues] = useState<Record<Field, string>>({ password: '', confirmPassword: '' });
  const [errors, setErrors] = useState<Errors>({});
  const [linkState, setLinkState] = useState<LinkState>({ status: 'checking' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check the link up front, so an expired or used link is explained before the user types anything.
  useEffect(() => {
    let cancelled = false;
    setLinkState({ status: 'checking' });
    checkResetLink(resetId).then((result) => {
      if (cancelled) return;
      if (result.valid) {
        setLinkState({ status: 'valid' });
      } else {
        setLinkState({ status: 'invalid', message: result.message });
        showToast('error', result.message);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [resetId]);

  function handleChange(field: Field, value: string) {
    const next = { ...values, [field]: value };
    setValues(next);
    // Once a field has failed, re-validate as the user types (same as the other forms). The password also affects the confirmation.
    setErrors((prev) => ({
      ...prev,
      ...(prev[field] ? { [field]: validate(field, next) } : {}),
      ...(field === 'password' && prev.confirmPassword ? { confirmPassword: validate('confirmPassword', next) } : {}),
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const nextErrors: Errors = { password: validate('password', values), confirmPassword: validate('confirmPassword', values) };
    setErrors(nextErrors);
    const firstInvalid = (['password', 'confirmPassword'] as const).find((field) => nextErrors[field]);
    if (firstInvalid) {
      (form.elements.namedItem(firstInvalid) as HTMLElement | null)?.focus();
      return;
    }

    setIsSubmitting(true);
    try {
      const message = await setPassword(resetId, values.password, values.confirmPassword);
      showToast('success', message);
      navigate('/account/login');
    } catch (error) {
      showToast('error', error instanceof Error ? error.message : 'Unable to set the password.');
      setIsSubmitting(false);
    }
  }

  if (linkState.status === 'invalid') {
    return (
      <div className="grid gap-5">
        <p role="alert" className="text-sm font-medium text-alert">
          {linkState.message}. This password reset link cannot be used.
        </p>
        <p className="text-sm text-muted">
          <Link href="/account/resetpassword" className={linkClass}>
            Request a new link
          </Link>
        </p>
      </div>
    );
  }

  const field = (name: Field) => ({
    id: name,
    name,
    value: values[name],
    error: errors[name],
    onChange: (event: { target: { value: string } }) => handleChange(name, event.target.value),
    onBlur: () => setErrors((prev) => ({ ...prev, [name]: validate(name, values) })),
  });

  return (
    <form className="grid grid-cols-1 gap-5" noValidate onSubmit={handleSubmit}>
      <TextField
        {...field('password')}
        type="password"
        label="New Password"
        placeholder="••••••••"
        startIcon={<Lock size={16} />}
        autoComplete="new-password"
        required
      />
      <TextField
        {...field('confirmPassword')}
        type="password"
        label="Confirm Password"
        placeholder="••••••••"
        startIcon={<Lock size={16} />}
        autoComplete="new-password"
        required
      />

      <SoftButton
        type="submit"
        disabled={linkState.status !== 'valid' || isSubmitting}
        aria-busy={isSubmitting}
        className="w-full"
      >
        Save Changes
        <ArrowRight size={18} aria-hidden />
      </SoftButton>

      <p className="text-sm text-muted">
        Remember It ?{' '}
        <Link href="/account/login" className={linkClass}>
          Login
        </Link>
      </p>
    </form>
  );
}
