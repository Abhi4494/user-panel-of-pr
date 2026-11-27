interface UserAvatarProps {
  name?: string;
  avatarUrl?: string;
  /** Show the green presence dot. */
  online?: boolean;
  className?: string;
}

/** Round avatar: photo when available, otherwise the user's initial. */
export function UserAvatar({ name, avatarUrl, online = false, className = 'size-10' }: UserAvatarProps) {
  return (
    <span className={`relative inline-flex shrink-0 items-center justify-center rounded-full bg-dash-active text-sm font-semibold text-dash-accent ${className}`}>
      {avatarUrl ? (
        <img src={avatarUrl} alt="" className="size-full rounded-full object-cover" />
      ) : (
        <span aria-hidden>{name?.trim().charAt(0).toUpperCase() || '?'}</span>
      )}
      {online && <span aria-hidden className="absolute right-0 bottom-0 size-2.5 rounded-full border-2 border-dash-rail bg-dash-online" />}
    </span>
  );
}
