/* eslint-disable global-require */
import { StyleSheet } from 'react-native';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SignIn from './src/pages/SignIn/SignIn';
import SignUp from './src/pages/SignUp/SignUp';
import WelcomeScreen from './src/pages/Welcome/Welcome';
import Notification from './src/pages/Notification/Notification';
import Groups from './src/pages/Groups/Groups';

const Stack = createNativeStackNavigator();

const MyTheme = {
  dark: false,
  colors: {
    primary: '#FFF',
    background: '#FFF',
    card: '#FFF',
    text: '#FFF',
    border: '#160E47',
    notification: '#FFF',
  },
};

export default function App() {
  return (
    <NavigationContainer theme={MyTheme} independent>
      <Stack.Navigator initialRouteName="Groups">
        <Stack.Screen name="Welcome" component={WelcomeScreen} options={{ headerShown: false }} />
        <Stack.Screen name="SignIn" component={SignIn} options={{ headerShown: false }} />
        <Stack.Screen name="SignUp" component={SignUp} options={{ headerShown: false }} />
        <Stack.Screen
          name="Notification"
          component={Notification}
          options={{ headerShown: false }}
        />
        <Stack.Screen name="Groups" component={Groups} options={{ headerShown: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: '5%',
  },
});
