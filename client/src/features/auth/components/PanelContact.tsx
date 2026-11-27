import type { ReactNode } from 'react';

interface PanelContactProps {
  icon: ReactNode;
  label: string;
  children: ReactNode;
}

/** Contact row for the dark auth panels: icon tile, label, value. Shared by login and registration. */
export function PanelContact({ icon, label, children }: PanelContactProps) {
  return (
    <li className="flex items-center gap-3">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-white/20 bg-white/10">
        {icon}
      </span>
      <div>
        <p className="text-caption text-white/70">{label}</p>
        <p className="text-sm font-semibold break-all">{children}</p>
      </div>
    </li>
  );
}
