/* eslint-disable global-require */
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ChangePassword from './src/pages/ChangePassword/ChangePassword';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer independent>
      <Stack.Navigator initialRouteName="MudarSenha">
        <Stack.Screen
          name="MudarSenha"
          component={ChangePassword}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
