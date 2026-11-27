import { Lock } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { SoftButton } from '@/components/ui/SoftButton';
import { TextField } from '@/components/ui/TextField';
import { showToast } from '@/components/ui/Toaster';
import { changePassword } from '@/features/auth/api/changePassword';
import { UnauthorizedError } from '@/features/auth/api/UnauthorizedError';
import { registrationMessages } from '@/features/auth/registrationValidation';
import { validateLoginField, validationMessages } from '@/features/auth/validation';
import { navigate } from '@/router';

type Field = 'oldPassword' | 'newPassword' | 'confirmPassword';
type Values = Record<Field, string>;
type Errors = Partial<Record<Field, string>>;

const FIELDS: readonly Field[] = ['oldPassword', 'newPassword', 'confirmPassword'];
const emptyValues: Values = { oldPassword: '', newPassword: '', confirmPassword: '' };

function validate(field: Field, values: Values): string | undefined {
  const value = values[field];
  if (value.trim() === '') return validationMessages.required;
  if (field === 'newPassword') return validateLoginField('password', value) ?? undefined;
  if (field === 'confirmPassword') return value === values.newPassword ? undefined : registrationMessages.passwordMismatch;
  return undefined;
}

/** Change-password form for the signed-in user (`/dashboard/change-password`). */
export function ChangePasswordForm() {
  const [values, setValues] = useState<Values>(emptyValues);
  const [errors, setErrors] = useState<Errors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isComplete = FIELDS.every((name) => values[name].trim() !== '');

  function handleChange(field: Field, value: string) {
    const next = { ...values, [field]: value };
    setValues(next);
    // Once a field has failed, re-validate as the user types. The new password also affects the confirmation.
    setErrors((prev) => ({
      ...prev,
      ...(prev[field] ? { [field]: validate(field, next) } : {}),
      ...(field === 'newPassword' && prev.confirmPassword ? { confirmPassword: validate('confirmPassword', next) } : {}),
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const nextErrors: Errors = {};
    for (const name of FIELDS) nextErrors[name] = validate(name, values);
    setErrors(nextErrors);
    const firstInvalid = FIELDS.find((name) => nextErrors[name]);
    if (firstInvalid) {
      (form.elements.namedItem(firstInvalid) as HTMLElement | null)?.focus();
      return;
    }

    setIsSubmitting(true);
    try {
      showToast('success', await changePassword(values.oldPassword, values.newPassword));
      setValues(emptyValues);
      setErrors({});
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        navigate('/account/login');
        return;
      }
      showToast('error', error instanceof Error ? error.message : 'Unable to change the password.');
    } finally {
      setIsSubmitting(false);
    }
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
    <form noValidate onSubmit={handleSubmit} className="grid max-w-md grid-cols-1 gap-5">
      <TextField
        {...field('oldPassword')}
        type="password"
        label="Current Password"
        placeholder="••••••••"
        startIcon={<Lock size={16} />}
        autoComplete="current-password"
        required
      />
      <TextField
        {...field('newPassword')}
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
        label="Confirm New Password"
        placeholder="••••••••"
        startIcon={<Lock size={16} />}
        autoComplete="new-password"
        required
      />
      <SoftButton type="submit" disabled={!isComplete || isSubmitting} aria-busy={isSubmitting} className="w-full">
        Change Password
      </SoftButton>
    </form>
  );
}
