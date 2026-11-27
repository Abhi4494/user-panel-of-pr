/**
 * The "Complete your profile" step shown after login to a user whose profile is not complete. The .NET site used
 * `/Account/Incompleteprofile/<user id>`; here the user comes from the session, so no id is needed (old links with an id
 * still match by prefix, see AuthRoutes).
 */
export const COMPLETE_PROFILE_PATH = '/account/incompleteprofile';
