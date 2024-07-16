/* eslint-disable global-require */
import { StyleSheet, View } from 'react-native';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Config from './src/pages/Configuration/Configuration';
import { useFonts } from 'expo-font';

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
  const [fontsLoaded] = useFonts({
    'inter-bold': require('../frontend/src/fonts/Inter-Bold.ttf'),
  });
  if (!fontsLoaded) {
    return undefined;
  }
  return (
    <NavigationContainer independent>
      <Stack.Navigator initialRouteName="Configurações">
        <Stack.Screen name="Configurações" component={Config} options={{
            headerTitleAlign: "center",
            headerTitleStyle:{
              fontFamily: "inter-bold",
            },
            headerStyle:{
              backgroundColor: "#F2F6FA",
            }
        }}/>
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