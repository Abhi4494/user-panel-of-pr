import { getProfile } from '@/features/profile/api/getProfile';
import { ProfileForm } from '@/features/profile/components/ProfileForm';
import { useAsync } from '@/hooks/useAsync';

/** `/dashboard/profile`: the signed-in user's profile (data from the API, editable). */
export function ProfilePage() {
  const { data: profile, error } = useAsync(getProfile);

  if (error) {
    return (
      <p role="alert" className="rounded-xl border border-dash-hairline bg-dash-surface p-5 text-sm text-alert">
        We couldn&apos;t load your profile right now. Please try again later.
      </p>
    );
  }
  if (!profile) return null; // the dashboard's page loader covers the wait

  return (
    <section className="rounded-2xl bg-dash-surface p-6 shadow-dash-card">
      <ProfileForm profile={profile} />
    </section>
  );
}
