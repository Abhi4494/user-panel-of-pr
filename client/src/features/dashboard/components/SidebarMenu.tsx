import { Heading } from '@/components/ui/Heading';
import { Link } from '@/components/ui/Link';
import { menuFor, railItems } from '@/features/dashboard/data/navigation';

/** "Dashboard" -> "D", "Price Trends" -> "PT" (first letters of up to two words). */
function initials(text: string) {
  return text
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join('');
}

interface SidebarMenuProps {
  activeId: string;
  path: string;
}

/**
 * Secondary panel: the links that belong to the selected rail item. Sizes and colours match the live dashboard
 * (tokens `text-menu-*`, `dash-nav-*`). An untitled first section is the "primary" link (13px semibold, navy);
 * titled sections have a 10px label and 14px links.
 */
export function SidebarMenu({ activeId, path }: SidebarMenuProps) {
  const rail = railItems.find((item) => item.id === activeId);
  const title = rail?.menuTitle ?? rail?.label ?? 'Dashboard';
  const sections = menuFor(activeId);

  return (
    <div className="flex w-menu shrink-0 flex-col bg-dash-surface">
      <div className="flex h-16 shrink-0 items-center gap-3 px-5">
        <span aria-hidden className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-dash-nav-badge text-menu-title font-semibold text-dash-nav-badge-text">
          {initials(title)}
        </span>
        <Heading level={2} size="nav" className="truncate text-dash-nav-title">
          {title}
        </Heading>
      </div>

      <nav aria-label={title} className="flex-1 overflow-y-auto px-5 pt-2 pb-6 scrollbar-none">
        {sections.map((section, index) => (
          <div key={section.title ?? index} className={index > 0 ? 'mt-4 border-t border-dash-nav-line pt-5' : ''}>
            {section.title && <p className="mb-2.5 text-menu-label font-normal text-dash-nav-title">{section.title}</p>}
            <ul>
              {section.links.map((link) => {
                const active = link.href === path;
                const primary = !section.title;
                const size = primary ? 'text-menu-home font-semibold' : 'text-menu-sub font-medium';
                const colour = active ? 'text-dash-nav-active' : 'text-dash-nav-idle hover:text-dash-nav-active';
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      aria-current={active ? 'page' : undefined}
                      className={`block py-2 transition-colors focus-visible:outline-2 focus-visible:outline-dash-accent ${size} ${colour} ${active && !primary ? 'font-semibold' : ''}`}
                    >
                      {link.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
        {/* A menu with a single untitled link (e.g. Price Trends) still closes with a divider, like the live site. */}
        {sections.length === 1 && !sections[0].title && <hr className="mt-4 border-dash-nav-line" />}
      </nav>
    </div>
  );
}
