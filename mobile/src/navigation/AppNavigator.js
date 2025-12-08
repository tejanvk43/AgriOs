import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from '../screens/LoginScreen';
import HomeScreen from '../screens/HomeScreen';
import CropRecommendationScreen from '../screens/CropRecommendationScreen';
import ChatScreen from '../screens/ChatScreen';
import WeatherScreen from '../screens/WeatherScreen';
import MarketPricesScreen from '../screens/MarketPricesScreen';

const Stack = createStackNavigator();

export default function AppNavigator() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="CropRecommendation" component={CropRecommendationScreen} />
            <Stack.Screen name="Chat" component={ChatScreen} />
            <Stack.Screen name="Weather" component={WeatherScreen} />
            <Stack.Screen name="MarketPrices" component={MarketPricesScreen} />
        </Stack.Navigator>
    );
}
