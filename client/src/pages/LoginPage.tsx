import { Heading } from '@/components/ui/Heading';
import { LoginForm } from '@/features/auth/components/LoginForm';

/** Main-column content for /account/login (the shell lives in App). */
export function LoginPage() {
  return (
    <>
      <Heading level={2} size="title" className="mb-(--density-section) text-ink-strong">
        Login
      </Heading>
      <LoginForm />
    </>
  );
}
