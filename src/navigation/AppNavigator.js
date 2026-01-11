import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSelector } from 'react-redux';
import OnboardingScreen from '../screens/OnboardingScreen';
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import HomeScreen from '../screens/HomeScreen/HomeScreen';
import VisualizeRoomScreen from '../screens/VisualizeRoomScreen/VisualizeRoomScreen';
import SmartImage from '../components/SmartImage';
import { images } from '../assets/images/images';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const HomeTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarIcon: ({ focused }) => {
        let iconSource;

        // Example: change icons based on route
        if (route.name === 'Home') {
          iconSource = images.home;
        } else if (route.name === 'Profile') {
          iconSource = images.profile;
        }

        return (
          <SmartImage
            source={iconSource}
            style={{
              height: 26,
              width: 26,
              tintColor: focused ? '#007AFF' : 'gray', // Optional tint for monochrome icons
            }}
            resizeMode="contain"
          />
        );
      },
      tabBarShowLabel: true, // or false if you only want icons
      tabBarActiveTintColor: '#007AFF',
      tabBarInactiveTintColor: 'gray',
    })}
  >
    <Tab.Screen name="Home" component={HomeScreen} />
  </Tab.Navigator>
);

const AppNavigator = () => {
  const { token, hydrated } = useSelector((state) => state.auth);

  if (!hydrated) return null;

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {token ? (
          <>
            <Stack.Screen
              screenOptions={{ headerShown: false }}
              name="Main"
              component={HomeTabs}
            />
            <Stack.Screen
              name="VisualizeRoom"
              component={VisualizeRoomScreen}
              options={{ headerShown: false }}
            />
          </>
        ) : (
          <>
            <Stack.Screen name="Onboarding" component={OnboardingScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Signup" component={SignupScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
