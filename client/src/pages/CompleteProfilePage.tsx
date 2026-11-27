import { Heading } from '@/components/ui/Heading';
import { CompleteProfileForm } from '@/features/auth/components/CompleteProfileForm';

/** Main-column content for /account/complete-profile (the shell lives in App). */
export function CompleteProfilePage() {
  return (
    <>
      <Heading level={2} size="title" className="mb-(--density-section) text-ink-strong">
        Complete your profile
      </Heading>
      <CompleteProfileForm />
    </>
  );
}
