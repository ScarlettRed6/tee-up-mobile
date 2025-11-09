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

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName='Login' screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Signup" component={SignupScreen} />
        <Stack.Screen name="Discover" component={DiscoverScreen} />
        <Stack.Screen name="RecommendedForYou" component={RecommendedForYouScreen} />
        <Stack.Screen name="RecentListings" component={RecentListingsScreen} />
        <Stack.Screen name="SavedListings" component={SavedListingsScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen name="PostItem" component={PostItemScreen} />
        <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
        <Stack.Screen name="Inbox" component={InboxScreen} />
        <Stack.Screen name="ChatDetail" component={ChatDetailScreen} />
        <Stack.Screen name="SearchFilter" component={SearchFilterScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}


