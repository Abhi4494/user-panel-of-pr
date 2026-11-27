import { Heading } from '@/components/ui/Heading';
import { useCurrentUser } from '@/features/dashboard/CurrentUserContext';
import { UserAvatar } from '@/features/dashboard/components/UserAvatar';

/** Greeting that sits on the navy header (the page's `intro`). */
export function WelcomeHeader() {
  const { data: user } = useCurrentUser();

  return (
    <div className="flex items-center gap-4 sm:gap-5">
      <UserAvatar name={user?.name} avatarUrl={user?.avatarUrl} className="size-14 bg-white/10 text-white" />
      <div className="min-w-0">
        <Heading level={2} size="headline" className="text-white">
          Welcome back{user ? `, ${user.name}` : ''}
        </Heading>
        <p className="mt-1 text-sm text-white/70">We&apos;re very happy to see you again on your personal dashboard.</p>
      </div>
    </div>
  );
}
