import type { ComponentType } from 'react';
import { FadeIn } from '@/components/ui/FadeIn';
import { COMPLETE_PROFILE_PATH } from '@/features/auth/paths';
import { LoginPanel } from '@/features/auth/components/LoginPanel';
import { RegistrationPanel } from '@/features/auth/components/RegistrationPanel';
import { CardAuthLayout } from '@/layouts/CardAuthLayout';
import { CompleteProfilePage } from '@/pages/CompleteProfilePage';
import { LoginPage } from '@/pages/LoginPage';
import { RegistrationPage } from '@/pages/RegistrationPage';
import { ResetPasswordPage } from '@/pages/ResetPasswordPage';
import { SetPasswordPage } from '@/pages/SetPasswordPage';

interface AuthRoute {
  /** Re-plays the content fade when it changes. */
  key: string;
  /** Panels with the same key are not re-faded (login <-> forgot password share one). */
  panelKey: string;
  Panel: ComponentType;
  Page: ComponentType;
}

const loginRoute: AuthRoute = { key: 'login', panelKey: 'login', Panel: LoginPanel, Page: LoginPage };

const routes: Record<string, AuthRoute> = {
  '/account/login': loginRoute,
  '/account/registration': { key: 'registration', panelKey: 'registration', Panel: RegistrationPanel, Page: RegistrationPage },
  '/account/resetpassword': { key: 'resetpassword', panelKey: 'login', Panel: LoginPanel, Page: ResetPasswordPage },
};

/** Profile completion after login; old .NET links with a user id on the end still match by prefix. */
const completeProfileRoute: AuthRoute = { key: 'completeprofile', panelKey: 'login', Panel: LoginPanel, Page: CompleteProfilePage };
const isCompleteProfilePath = (path: string) => path === COMPLETE_PROFILE_PATH || path.startsWith(`${COMPLETE_PROFILE_PATH}/`);

/** The reset e-mail links to `/accounts/setPassword/<id>` (note `accounts`), so it matches by prefix. */
const setPasswordRoute: AuthRoute = { key: 'setpassword', panelKey: 'login', Panel: LoginPanel, Page: SetPasswordPage };
const isSetPasswordPath = (path: string) => path === '/accounts/setpassword' || path.startsWith('/accounts/setpassword/');

/**
 * One persistent shell (layout, logo, particles) for all auth screens; navigating swaps only the content,
 * with a short fade. Unknown paths fall back to login.
 */
export function AuthRoutes({ path }: { path: string }) {
  const route = isSetPasswordPath(path) ? setPasswordRoute : isCompleteProfilePath(path) ? completeProfileRoute : (routes[path] ?? loginRoute);

  return (
    <CardAuthLayout
      asideFirst
      aside={
        <FadeIn key={route.panelKey} className="flex flex-1 flex-col gap-5">
          <route.Panel />
        </FadeIn>
      }
    >
      <FadeIn key={route.key} className="flex flex-col">
        <route.Page />
      </FadeIn>
    </CardAuthLayout>
  );
}
