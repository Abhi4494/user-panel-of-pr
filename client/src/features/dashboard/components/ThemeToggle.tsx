import { Moon, Sun } from 'lucide-react';
import { topBarButton } from '@/features/dashboard/components/topBarStyles';
import { useTheme } from '@/features/theme/themeStore';

export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button type="button" onClick={toggle} aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'} className={`${topBarButton} text-dash-sun hover:text-dash-sun`}>
      {isDark ? <Moon size={18} aria-hidden /> : <Sun size={18} aria-hidden />}
    </button>
  );
}
