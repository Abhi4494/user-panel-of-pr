/** Small two-tone person icon on the cost-model cards (orange head, blue body), drawn with the avatar colour tokens. */
export function CategoryAvatar() {
  return (
    <svg aria-hidden viewBox="0 0 24 30" className="h-7.5 w-6 shrink-0">
      <circle cx="12" cy="8" r="6.5" className="fill-dash-avatar-head" />
      <path d="M1 28.5C1 20.8 5.6 16 12 16s11 4.8 11 12.5c0 .8-.6 1.5-1.5 1.5h-19C1.6 30 1 29.3 1 28.5Z" className="fill-dash-avatar-body" />
    </svg>
  );
}
