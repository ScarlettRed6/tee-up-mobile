import { CommonActions } from '@react-navigation/native';

/**
 * Navigate to a bottom nav screen (Discover, Inbox, Notifications, Profile, PostItem)
 * Resets the navigation stack to prevent stacking - no swipe back gesture
 * Bottom nav screens act as independent tabs without stack history
 * Uses replace action to ensure smooth transitions without stacking
 */
export const navigateToBottomNav = (navigation, screenName) => {
  const state = navigation.getState();
  const currentRoute = state?.routes[state?.index]?.name;
  
  // If already on this screen, do nothing
  if (currentRoute === screenName) {
    return;
  }

  // Check if the screen exists in the stack
  const existingRouteIndex = state?.routes.findIndex(route => route.name === screenName);
  
  if (existingRouteIndex !== -1 && existingRouteIndex < state.index) {
    // Screen exists earlier in stack - reset to it (this prevents stacking)
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: screenName }],
      })
    );
  } else {
    // Screen doesn't exist or is ahead - use reset to replace current screen
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: screenName }],
      })
    );
  }
};

