import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import EmailVerificationScreen from '../screens/EmailVerificationScreen';
import ForgotPasswordRequestScreen from '../screens/ForgotPasswordRequestScreen';
import ForgotPasswordVerifyScreen from '../screens/ForgotPasswordVerifyScreen';
import ForgotPasswordResetScreen from '../screens/ForgotPasswordResetScreen';
import SellerReviewsScreen from '../screens/SellerReviewsScreen';

const Stack = createNativeStackNavigator();

export default function AuthStack(){
    return(
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
                animation: 'fade',
            }}
        >
            <Stack.Screen name='Login' component={LoginScreen}/>
            <Stack.Screen name='Signup' component={SignupScreen}/>
            <Stack.Screen name='EmailVerification' component={EmailVerificationScreen}/>
            <Stack.Screen name='ForgotPasswordRequest' component={ForgotPasswordRequestScreen}/>
            <Stack.Screen name='ForgotPasswordVerify' component={ForgotPasswordVerifyScreen}/>
            <Stack.Screen name='ForgotPasswordReset' component={ForgotPasswordResetScreen}/>
            <Stack.Screen name='SellerReviews' component={SellerReviewsScreen}/>
        </Stack.Navigator>
    );
}


