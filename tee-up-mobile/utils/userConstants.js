/**
 * Current logged-in user information
 * In a real app, this would come from authentication state/context
 */
export const CURRENT_USER = {
  username: 'hockeyops',
  userId: '1', // This would come from auth token or session
};

/**
 * Check if a given username is the current logged-in user
 */
export const isCurrentUser = (username) => {
  return username === CURRENT_USER.username;
};


