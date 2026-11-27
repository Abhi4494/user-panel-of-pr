/** Grid texture + corner glow shared by the dark auth panels. `glow` picks the corner. */
export function PanelBackdrop({ glow = 'right' }: { glow?: 'left' | 'right' }) {
  const glowPosition = glow === 'right' ? '-right-24' : '-left-24';
  return (
    <>
      <span aria-hidden className="bg-grid  absolute inset-0 -z-10 mask-[linear-gradient(to_bottom,black,transparent_80%)]" />
      <span aria-hidden className={`absolute -top-24 -z-10 size-96 rounded-full bg-panel-glow/40 blur-3xl ${glowPosition}`} />
    </>
  );
}
