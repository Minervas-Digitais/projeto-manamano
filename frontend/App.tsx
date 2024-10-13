/* eslint-disable global-require */
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ChangePassword from './src/pages/ChangePassword/ChangePassword';
import EnterGroup from './src/pages/EnterGroup/EnterGroup';
import Config from './src/pages/Configuration/Configuration';
import ConfigNotification from './src/pages/ConfigNotification/ConfigNotification';
import SignIn from './src/pages/SignIn/SignIn';
import SignUp from './src/pages/SignUp/SignUp';
import WelcomeScreen from './src/pages/Welcome/Welcome';
import Notification from './src/pages/Notification/Notification';
import Groups from './src/pages/Groups/Groups';
import GroupData from './src/pages/GroupData/GroupData';
import About from './src/pages/About/About';
import Home from './src/pages/Home/Home';
import SideMenu from './src/components/SideMenu/SideMenu';
import Post from './src/pages/Post/Post';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer independent>
      <Stack.Navigator initialRouteName="Post">
        <Stack.Screen name="Configurações" component={Config} options={{ headerShown: false }} />
        <Stack.Screen name="Post" component={Post} options={{ headerShown: false }} />
        <Stack.Screen name="EntrarGrupo" component={EnterGroup} options={{ headerShown: false }} />
        <Stack.Screen name="Welcome" component={WelcomeScreen} options={{ headerShown: false }} />
        <Stack.Screen
          name="MudarSenha"
          component={ChangePassword}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Notificações"
          component={ConfigNotification}
          options={{ headerShown: false }}
        />
        <Stack.Screen name="SignIn" component={SignIn} options={{ headerShown: false }} />
        <Stack.Screen name="SignUp" component={SignUp} options={{ headerShown: false }} />
        <Stack.Screen
          name="Notification"
          component={Notification}
          options={{ headerShown: false }}
        />
        <Stack.Screen name="SideMenu" component={SideMenu} options={{ headerShown: false }} />
        <Stack.Screen name="Groups" component={Groups} options={{ headerShown: false }} />
        <Stack.Screen name="GroupData" component={GroupData} options={{ headerShown: false }} />
        <Stack.Screen name="About" component={About} options={{ headerShown: false }} />
        <Stack.Screen name="Home" component={Home} options={{ headerShown: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
