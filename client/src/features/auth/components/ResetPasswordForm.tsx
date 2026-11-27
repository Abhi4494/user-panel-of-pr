import { ArrowRight, Mail } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { Link } from '@/components/ui/Link';
import { SoftButton } from '@/components/ui/SoftButton';
import { TextField } from '@/components/ui/TextField';
import { showToast } from '@/components/ui/Toaster';
import { requestPasswordReset } from '@/features/auth/api/resetPassword';
import { validateLoginField } from '@/features/auth/validation';

const linkClass = 'font-semibold text-accent hover:underline focus-visible:outline-2 focus-visible:outline-accent';

export function ResetPasswordForm() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = validateLoginField('email', email);
    setError(result);
    if (result) {
      (event.currentTarget.elements.namedItem('email') as HTMLInputElement | null)?.focus();
      return;
    }

    setIsSubmitting(true);
    try {
      showToast('success', await requestPasswordReset(email));
      // Back to a pristine form (no leftover address, no validation state).
      setEmail('');
      setError(undefined);
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Unable to reset the password.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="grid grid-cols-1 gap-5" noValidate onSubmit={handleSubmit}>
      <TextField
        id="email"
        name="email"
        type="email"
        label="Email Address"
        placeholder="you@company.com"
        startIcon={<Mail size={16} />}
        autoComplete="username"
        required
        value={email}
        onChange={(event) => {
          setEmail(event.target.value);
          // Once the field has failed, re-validate as the user types (same as the other forms).
          if (typeof error === 'string') setError(validateLoginField('email', event.target.value));
        }}
        onBlur={(event) => setError(validateLoginField('email', event.target.value))}
        error={error ?? undefined}
        isValid={error === null}
      />

      <SoftButton type="submit" disabled={isSubmitting} aria-busy={isSubmitting} className="w-full">
        Reset Password
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
