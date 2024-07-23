/* eslint-disable global-require */
import { StyleSheet, View } from 'react-native';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Config from './src/pages/Configuration/Configuration';
import ConfigNotification from './src/pages/ConfigNotification/ConfigNotification';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer independent>
      <Stack.Navigator initialRouteName="Notificações">
        <Stack.Screen
          name="Notificações"
          component={ConfigNotification}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
