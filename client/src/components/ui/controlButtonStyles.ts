/**
 * Square 34px button (4px radius) shared by the range selector and the action icons. Colours are split into
 * idle/active so only one background and one text colour utility ever applies (conflicting utilities made the
 * active Home button white-on-white before).
 */
export const toolbarButton =
  'inline-flex h-8.5 min-w-8.5 items-center justify-center rounded border px-1 text-caption font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-dash-accent';

export const toolbarIdle = 'border-dash-control-border bg-dash-surface text-dash-control-icon hover:bg-dash-hover';

/** The selected range button: filled navy (same navy as the header) with white content. */
export const toolbarActive = 'border-dash-hero bg-dash-hero text-white';
