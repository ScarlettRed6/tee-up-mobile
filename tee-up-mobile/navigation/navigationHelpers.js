/**
 * Navigate to a bottom nav screen (Discover, Inbox, Profile)
 * Uses React Navigation's navigate() which provides smooth transitions:
 * - If screen exists in stack: pops to it with smooth animation
 * - If screen doesn't exist: pushes it with smooth animation
 * This ensures smooth transitions while React Navigation handles stack management
 */
export const navigateToBottomNav = (navigation, screenName) => {
  const state = navigation.getState();
  const currentRoute = state?.routes[state?.index]?.name;
  
  // If already on this screen, do nothing
  if (currentRoute === screenName) {
    return;
  }

  // Use navigate() which React Navigation handles intelligently:
  // - Provides smooth transitions in all cases
  // - Automatically pops to screen if it exists in stack
  // - Pushes screen if it doesn't exist
  // This gives us smooth animations while maintaining proper navigation behavior
  navigation.navigate(screenName);
};

