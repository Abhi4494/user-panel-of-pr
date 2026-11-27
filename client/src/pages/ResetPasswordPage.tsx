import { Heading } from '@/components/ui/Heading';
import { ResetPasswordForm } from '@/features/auth/components/ResetPasswordForm';

/** Main-column content for /account/resetpassword (the shell lives in App). */
export function ResetPasswordPage() {
  return (
    <>
      <p className="mb-2 text-sm font-semibold text-accent">Don&apos;t Worry</p>
      <Heading level={2} size="title" className="mb-8 text-ink-strong">
        Forgot Password
      </Heading>
      <ResetPasswordForm />
    </>
  );
}
