import { CommonActions } from '@react-navigation/native';

/**
 * Navigate to a bottom nav screen (Discover, Inbox, Profile)
 * This resets the stack so these screens act as independent tabs
 */
export const navigateToBottomNav = (navigation, screenName) => {
  // Get current route name
  const currentRoute = navigation.getState()?.routes[navigation.getState()?.index]?.name;
  
  // If already on this screen, do nothing
  if (currentRoute === screenName) {
    return;
  }

  // Reset navigation stack to the target screen
  // This ensures bottom nav screens act as independent tabs
  navigation.dispatch(
    CommonActions.reset({
      index: 0,
      routes: [{ name: screenName }],
    })
  );
};

