import { Heading } from '@/components/ui/Heading';
import { SetPasswordForm } from '@/features/auth/components/SetPasswordForm';

/**
 * The reset id is the last segment of `/accounts/setpassword/:resetId`. It is read from the real URL, not the router's
 * path, because that one is lower-cased.
 */
function readResetId(): string {
  return window.location.pathname.split('/').filter(Boolean)[2] ?? '';
}

/** Main-column content for /accounts/setpassword/:resetId, the link in the password-reset e-mail. */
export function SetPasswordPage() {
  return (
    <>
      <Heading level={2} size="title" className="mb-8 text-ink-strong">
        Set Password
      </Heading>
      <SetPasswordForm resetId={readResetId()} />
    </>
  );
}
