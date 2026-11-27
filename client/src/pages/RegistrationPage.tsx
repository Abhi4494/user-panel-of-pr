import { Heading } from '@/components/ui/Heading';
import { RegistrationForm } from '@/features/auth/components/RegistrationForm';

/** Main-column content for /account/registration (the shell lives in App). */
export function RegistrationPage() {
  return (
    <>
      <Heading level={2} size="title" className="mb-(--density-section) text-ink-strong">
        Registration
      </Heading>
      <RegistrationForm />
    </>
  );
}
