import { useEffect, useState, type FormEvent } from 'react';
import { Checkbox } from '@/components/ui/Checkbox';
import { SoftButton } from '@/components/ui/SoftButton';
import { showToast } from '@/components/ui/Toaster';
import { completeProfile, getAreasOfInterest } from '@/features/auth/api/profileCompletion';
import { UnauthorizedError } from '@/features/auth/api/UnauthorizedError';
import { useAsync } from '@/hooks/useAsync';
import { navigate } from '@/router';

/**
 * "Areas of interest" step shown after login to a user whose profile is not complete (same as the .NET
 * /Account/Incompleteprofile page). At least one area is needed; saving marks the profile complete and opens the dashboard.
 */
export function CompleteProfileForm() {
  const areas = useAsync(getAreasOfInterest, { pageLoader: false });
  const [chosen, setChosen] = useState<number[] | null>(null);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // No valid session: back to the login screen.
  useEffect(() => {
    if (areas.error instanceof UnauthorizedError) navigate('/account/login');
  }, [areas.error]);

  // Start from what the user saved earlier (once the list has loaded); after that the checkboxes are theirs.
  const selected = chosen ?? (areas.data ?? []).filter((area) => area.selected).map((area) => area.id);

  function toggle(id: number) {
    setError('');
    setChosen(selected.includes(id) ? selected.filter((item) => item !== id) : [...selected, id]);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (selected.length === 0) {
      setError('Please select at least one area of interest.');
      return;
    }
    setIsSubmitting(true);
    try {
      showToast('success', await completeProfile(selected));
      navigate('/dashboard');
    } catch (err) {
      if (err instanceof UnauthorizedError) {
        navigate('/account/login');
        return;
      }
      const message = err instanceof Error ? err.message : 'We could not save your profile right now. Please try again.';
      setError(message);
      showToast('error', message);
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate aria-busy={areas.isLoading}>
      <fieldset>
        <legend className="mb-4 text-base text-ink-strong">Areas of interest</legend>
        {areas.error && !(areas.error instanceof UnauthorizedError) ? (
          <p role="alert" className="text-sm text-invalid-text">
            {areas.error.message}
          </p>
        ) : !areas.data ? (
          <div aria-label="Loading areas of interest" className="grid gap-3 sm:grid-cols-2">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="h-6 animate-pulse rounded bg-muted/30 motion-reduce:animate-none" />
            ))}
          </div>
        ) : (
          <div className="grid gap-x-8 gap-y-3 sm:grid-cols-2">
            {areas.data.map((area) => (
              <Checkbox key={area.id} id={`interest-${area.id}`} checked={selected.includes(area.id)} onChange={() => toggle(area.id)}>
                {area.name}
              </Checkbox>
            ))}
          </div>
        )}
      </fieldset>

      {error && (
        <p role="alert" className="mt-4 text-sm text-invalid-text">
          {error}
        </p>
      )}

      <div className="mt-8 flex justify-end">
        <SoftButton type="submit" disabled={isSubmitting || !areas.data}>
          {isSubmitting ? 'Saving…' : 'Submit'}
        </SoftButton>
      </div>
    </form>
  );
}
