import { ChangePasswordForm } from '@/features/auth/components/ChangePasswordForm';

/** `/dashboard/change-password`: the card under the navy header (the header shows the page title). */
export function ChangePasswordPage() {
  return (
    <section className="rounded-2xl bg-dash-surface p-6 shadow-dash-card">
      <h2 className="mb-1 text-lg font-semibold text-dash-ink">Update your password</h2>
      <p className="mb-6 text-sm text-dash-muted">
        Use at least 6 characters with an uppercase letter, a lowercase letter and a number.
      </p>
      <ChangePasswordForm />
    </section>
  );
}
