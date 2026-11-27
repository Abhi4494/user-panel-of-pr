import { Camera } from 'lucide-react';
import { useEffect, useId, useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import { SoftButton } from '@/components/ui/SoftButton';
import { FieldError, FieldLabel, TextField, inlineErrorId, softInputClass } from '@/components/ui/TextField';
import { showToast } from '@/components/ui/Toaster';
import { UnauthorizedError } from '@/features/auth/api/UnauthorizedError';
import { validateLoginField, validationMessages } from '@/features/auth/validation';
import { useCurrentUser } from '@/features/dashboard/CurrentUserContext';
import { UserAvatar } from '@/features/dashboard/components/UserAvatar';
import { updateProfile } from '@/features/profile/api/updateProfile';
import type { Profile, ProfileChanges } from '@/features/profile/types';
import { navigate } from '@/router';

type TextKey = 'name' | 'email' | 'mobileNumber' | 'landline' | 'bio';
type Errors = Partial<Record<TextKey, string>>;

const TEXT_KEYS: readonly TextKey[] = ['name', 'email', 'mobileNumber', 'landline', 'bio'];
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp'];
const MAX_BIO_LENGTH = 2000;
const PHONE_PATTERN = /^\+?\d{6,15}$/;
const phoneMessage = 'Enter a valid number, with the country code (e.g. +91 8762389765).';

function validate(key: TextKey, values: Record<TextKey, string>): string | undefined {
  const value = values[key].trim();
  switch (key) {
    case 'name':
      return value === '' ? validationMessages.required : undefined;
    case 'email':
      return validateLoginField('email', value) ?? undefined;
    case 'mobileNumber':
      if (value === '') return validationMessages.required;
      return PHONE_PATTERN.test(value.replace(/[\s\-().]/g, '')) ? undefined : phoneMessage;
    case 'landline':
      return value === '' || PHONE_PATTERN.test(value.replace(/[\s\-().]/g, '')) ? undefined : phoneMessage;
    case 'bio':
      return value.length > MAX_BIO_LENGTH ? `Bio must be ${MAX_BIO_LENGTH} characters or fewer.` : undefined;
  }
}

function toValues(profile: Profile): Record<TextKey, string> {
  return {
    name: profile.name,
    email: profile.email,
    mobileNumber: profile.mobileNumber,
    landline: profile.landline,
    bio: profile.bio,
  };
}

/** View and edit the six profile fields (photo, name, email, mobile, landline, bio). */
export function ProfileForm({ profile: initial }: { profile: Profile }) {
  const { reload } = useCurrentUser();
  const [saved, setSaved] = useState(initial);
  const [values, setValues] = useState(() => toValues(initial));
  const [errors, setErrors] = useState<Errors>({});
  const [image, setImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const bioId = useId();

  // Local preview of the picked photo; released when it changes or the form closes.
  useEffect(() => {
    if (!image) {
      setPreviewUrl(undefined);
      return;
    }
    const url = URL.createObjectURL(image);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [image]);

  const savedValues = toValues(saved);
  const changedKeys = TEXT_KEYS.filter((key) => values[key].trim() !== savedValues[key].trim());
  const isDirty = changedKeys.length > 0 || image !== null;

  function handleChange(key: TextKey, value: string) {
    const next = { ...values, [key]: value };
    setValues(next);
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: validate(key, next) }));
  }

  function handleImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = ''; // so picking the same file again still fires
    if (!file) return;
    if (!IMAGE_TYPES.includes(file.type)) {
      showToast('error', 'Only .png, .jpg, .jpeg and .webp images are allowed.');
    } else if (file.size > MAX_IMAGE_BYTES) {
      showToast('error', 'Image must be 5 MB or smaller.');
    } else {
      setImage(file);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const nextErrors: Errors = {};
    for (const key of TEXT_KEYS) nextErrors[key] = validate(key, values);
    setErrors(nextErrors);
    const firstInvalid = TEXT_KEYS.find((key) => nextErrors[key]);
    if (firstInvalid) {
      (form.elements.namedItem(firstInvalid) as HTMLElement | null)?.focus();
      return;
    }

    // Send only what changed: the API updates just the fields it receives.
    const changes: ProfileChanges = {};
    for (const key of changedKeys) changes[key] = values[key].trim();
    if (image) changes.image = image;

    setIsSubmitting(true);
    try {
      const result = await updateProfile(changes);
      showToast('success', result.message);
      setSaved(result.profile);
      setValues(toValues(result.profile));
      setImage(null);
      setErrors({});
      reload(); // the sidebar name and avatar come from the current-user data
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        navigate('/account/login');
        return;
      }
      showToast('error', error instanceof Error ? error.message : 'Unable to update your profile.');
    } finally {
      setIsSubmitting(false);
    }
  }

  const field = (key: TextKey) => ({
    id: key,
    name: key,
    value: values[key],
    error: errors[key],
    onChange: (event: { target: { value: string } }) => handleChange(key, event.target.value),
    onBlur: () => setErrors((prev) => ({ ...prev, [key]: validate(key, values) })),
  });

  const bioError = errors.bio;

  return (
    <form noValidate onSubmit={handleSubmit} className="grid gap-6">
      <div className="flex items-center gap-4">
        <UserAvatar name={values.name} avatarUrl={previewUrl ?? saved.imageUrl} className="size-20 text-2xl" />
        <div>
          <input ref={fileInput} type="file" accept={IMAGE_TYPES.join(',')} onChange={handleImage} className="sr-only" aria-label="Profile photo" tabIndex={-1} />
          <button
            type="button"
            onClick={() => fileInput.current?.click()}
            className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-soft-border px-3 py-2 text-sm font-semibold text-accent transition-colors hover:bg-soft-field focus-visible:outline-2 focus-visible:outline-accent"
          >
            <Camera size={16} aria-hidden />
            {image ? 'Choose another photo' : 'Change photo'}
          </button>
          <p className="mt-1 text-caption text-dash-muted">{image ? image.name : 'PNG, JPG or WebP, up to 5 MB.'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-x-4 gap-y-5 md:grid-cols-2">
        <TextField {...field('name')} label="Name" placeholder="John Doe" autoComplete="name" required />
        <TextField {...field('email')} type="email" label="Email" placeholder="you@company.com" autoComplete="email" required />
        <TextField
          {...field('mobileNumber')}
          type="tel"
          label="Mobile Number"
          placeholder="+91 8762389765"
          autoComplete="tel"
          required
        />
        <TextField {...field('landline')} type="tel" label="Landline" placeholder="+91 1123456789" autoComplete="tel" />

        <div className="group relative md:col-span-2">
          <FieldLabel htmlFor={bioId} error={bioError}>
            Bio
          </FieldLabel>
          <textarea
            id={bioId}
            name="bio"
            rows={4}
            maxLength={MAX_BIO_LENGTH}
            placeholder="Tell us a little about yourself"
            value={values.bio}
            onChange={(event) => handleChange('bio', event.target.value)}
            onBlur={() => setErrors((prev) => ({ ...prev, bio: validate('bio', values) }))}
            aria-invalid={bioError ? true : undefined}
            className={`${softInputClass} h-auto resize-y py-2 ${bioError ? 'border-invalid-border bg-invalid-bg' : 'border-soft-border bg-soft-field'} text-ink-strong`}
          />
          <FieldError id={`${bioId}-error`} inlineId={inlineErrorId(bioId)}>
            {bioError}
          </FieldError>
        </div>
      </div>

      <div>
        <SoftButton type="submit" disabled={!isDirty || isSubmitting} aria-busy={isSubmitting}>
          Save Changes
        </SoftButton>
      </div>
    </form>
  );
}
