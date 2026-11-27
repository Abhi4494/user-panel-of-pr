import { Toaster } from '@/components/ui/Toaster';
import { usePath } from '@/router';
import { AuthRoutes } from '@/routes/AuthRoutes';
import { DashboardRoutes, isDashboardPath } from '@/routes/DashboardRoutes';

/** Top-level split: the logged-in screens (see `isDashboardPath`) vs the public auth screens. */
export function App() {
  const path = usePath();
  return (
    <>
      {isDashboardPath(path) ? <DashboardRoutes path={path} /> : <AuthRoutes path={path} />}
      <Toaster />
    </>
  );
}
