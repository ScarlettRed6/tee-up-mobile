import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import DiscoverScreen from '../screens/DiscoverScreen';
import RecommendedForYouScreen from '../screens/RecommendedForYouScreen';
import RecentListingsScreen from '../screens/RecentListingsScreen';
import SavedListingsScreen from '../screens/SavedListingsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import SettingsScreen from '../screens/SettingsScreen';
import PostItemScreen from '../screens/PostItemScreen';
import ProductDetailScreen from '../screens/ProductDetailScreen';
import InboxScreen from '../screens/InboxScreen';
import ChatDetailScreen from '../screens/ChatDetailScreen';
import SearchFilterScreen from '../screens/SearchFilterScreen';
import SearchResultsScreen from '../screens/SearchResultsScreen';
import UserProfileScreen from '../screens/UserProfileScreen';
import NotificationsScreen from '../screens/NotificationsScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName='Login' 
        screenOptions={{ 
          headerShown: false,
          animation: 'simple_push', // Cross-platform smooth animation
          gestureEnabled: true,
          gestureDirection: 'horizontal',
          fullScreenGestureEnabled: true,
        }}
      >
        <Stack.Screen 
          name="Home" 
          component={HomeScreen}
          options={{
            animation: 'fade',
            gestureEnabled: false,
          }}
        />
        <Stack.Screen 
          name="Login" 
          component={LoginScreen}
          options={{
            animation: 'fade',
            gestureEnabled: false,
          }}
        />
        <Stack.Screen 
          name="Signup" 
          component={SignupScreen}
          options={{
            animation: 'simple_push',
          }}
        />
        <Stack.Screen 
          name="Discover" 
          component={DiscoverScreen}
          options={{
            animation: 'fade',
            gestureEnabled: false,
          }}
        />
        <Stack.Screen 
          name="RecommendedForYou" 
          component={RecommendedForYouScreen}
          options={{
            animation: 'simple_push',
          }}
        />
        <Stack.Screen 
          name="RecentListings" 
          component={RecentListingsScreen}
          options={{
            animation: 'simple_push',
          }}
        />
        <Stack.Screen 
          name="SavedListings" 
          component={SavedListingsScreen}
          options={{
            animation: 'simple_push',
          }}
        />
        <Stack.Screen 
          name="Profile" 
          component={ProfileScreen}
          options={{
            animation: 'fade',
            gestureEnabled: false,
          }}
        />
        <Stack.Screen 
          name="Settings" 
          component={SettingsScreen}
          options={{
            animation: 'simple_push',
          }}
        />
        <Stack.Screen 
          name="PostItem" 
          component={PostItemScreen}
          options={{
            animation: 'slide_from_bottom',
            presentation: 'modal',
            gestureEnabled: true,
          }}
        />
        <Stack.Screen 
          name="ProductDetail" 
          component={ProductDetailScreen}
          options={{
            animation: 'simple_push',
          }}
        />
        <Stack.Screen 
          name="Inbox" 
          component={InboxScreen}
          options={{
            animation: 'fade',
            gestureEnabled: false,
          }}
        />
        <Stack.Screen 
          name="ChatDetail" 
          component={ChatDetailScreen}
          options={{
            animation: 'simple_push',
          }}
        />
        <Stack.Screen 
          name="SearchFilter" 
          component={SearchFilterScreen}
          options={{
            animation: 'simple_push',
          }}
        />
        <Stack.Screen 
          name="SearchResults" 
          component={SearchResultsScreen}
          options={{
            animation: 'simple_push',
          }}
        />
        <Stack.Screen 
          name="UserProfile" 
          component={UserProfileScreen}
          options={{
            animation: 'simple_push',
          }}
        />
        <Stack.Screen 
          name="Notifications" 
          component={NotificationsScreen}
          options={{
            animation: 'fade',
            gestureEnabled: false,
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}


