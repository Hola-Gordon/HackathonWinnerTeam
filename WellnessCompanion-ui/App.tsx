import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationParams } from './src/types';
import { EmotionSelectionScreen } from './src/screens/EmotionSelectionScreen';
import { RecordingMethodScreen } from './src/screens/RecordingMethodScreen';
import { AnalysisScreen } from './src/screens/AnalysisScreen';
import { AIResponseScreen } from './src/screens/AIResponseScreen';
import { GratitudeScreen } from './src/screens/GratitudeScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { DebugScreen } from './src/screens/DebugScreen';
import { theme } from './src/theme';

const Stack = createNativeStackNavigator<NavigationParams>();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: theme.colors.background,
          },
          headerTintColor: theme.colors.text,
          headerTitleStyle: theme.typography.h2,
          headerShadowVisible: false,
        }}
        initialRouteName="EmotionSelection"
      >
        <Stack.Screen 
          name="EmotionSelection" 
          component={EmotionSelectionScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="RecordingMethod" 
          component={RecordingMethodScreen}
          options={{ title: 'Record Your Thoughts' }}
        />
        <Stack.Screen 
          name="Analysis" 
          component={AnalysisScreen}
          options={{ title: 'Your Journey' }}
        />
        <Stack.Screen 
          name="AIResponse" 
          component={AIResponseScreen}
          options={{ title: 'Your Support' }}
        />
        <Stack.Screen 
          name="Gratitude" 
          component={GratitudeScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="Profile" 
          component={ProfileScreen}
          options={{ title: 'Your Profile' }}
        />
        <Stack.Screen 
          name="Debug" 
          component={DebugScreen}
          options={{ title: 'API Debug' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
} 