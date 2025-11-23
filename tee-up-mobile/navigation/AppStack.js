import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
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
import EditProfileScreen from '../screens/EditProfileScreen';

const Stack = createNativeStackNavigator();

export default function AppStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'simple_push',
      }}
    >
      {/* Bottom Navigation Screens - No stacking, fade-like transition, no gestures */}
      <Stack.Screen 
        name="Discover" 
        component={DiscoverScreen}
        options={{
          animation: 'fade_from_bottom',
          gestureEnabled: false,
        }}
      />
      <Stack.Screen 
        name="Inbox" 
        component={InboxScreen}
        options={{
          animation: 'fade_from_bottom',
          gestureEnabled: false,
        }}
      />
      <Stack.Screen 
        name="Notifications" 
        component={NotificationsScreen}
        options={{
          animation: 'fade_from_bottom',
          gestureEnabled: false,
        }}
      />
      <Stack.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{
          animation: 'fade_from_bottom',
          gestureEnabled: false,
        }}
      />
      <Stack.Screen 
        name="PostItem" 
        component={PostItemScreen}
        options={{
          animation: 'slide_from_bottom',
        }}
      />
      
      {/* Other Screens - Default animations */}
      <Stack.Screen name="RecommendedForYou" component={RecommendedForYouScreen} />
      <Stack.Screen name="RecentListings" component={RecentListingsScreen} />
      <Stack.Screen name="SavedListings" component={SavedListingsScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
      <Stack.Screen name="ChatDetail" component={ChatDetailScreen} />
      <Stack.Screen name="SearchFilter" component={SearchFilterScreen} />
      <Stack.Screen name="SearchResults" component={SearchResultsScreen} />
      <Stack.Screen name="UserProfile" component={UserProfileScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
    </Stack.Navigator>
  );
}