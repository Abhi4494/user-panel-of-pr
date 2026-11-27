/** The six profile fields the user can see and edit (`GET`/`POST /api/v1/user-panel/profile`). */
export interface Profile {
  name: string;
  email: string;
  mobileNumber: string;
  landline: string;
  bio: string;
  /** Photo URL, or `undefined` when the user has not uploaded one (the API then reports a default icon). */
  imageUrl?: string;
}

/** What the form sends; only fields that changed are included, `image` only when a new file was picked. */
export type ProfileChanges = Partial<Omit<Profile, 'imageUrl'>> & { image?: File };
