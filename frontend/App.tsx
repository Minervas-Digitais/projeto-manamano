/* eslint-disable global-require */
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import EnterGroup from './src/pages/EnterGroup/EnterGroup';
import ChangePassword from './src/pages/ChangePassword/ChangePassword';
import Config from './src/pages/Configuration/Configuration';
import ConfigNotification from './src/pages/ConfigNotification/ConfigNotification';
import SignIn from './src/pages/SignIn/SignIn';
import SignUp from './src/pages/SignUp/SignUp';
import WelcomeScreen from './src/pages/Welcome/Welcome';
import Notification from './src/pages/Notification/Notification';
import Groups from './src/pages/Groups/Groups';
import EditProfile from './src/pages/EditProfile/EditProfile';
import GetInTouch from './src/pages/GetInTouch/GetInTouch';
import GroupData from './src/pages/GroupData/GroupData';
import About from './src/pages/About/About';
import Home from './src/pages/Home/Home';
import SideMenu from './src/components/SideMenu/SideMenu';
import GroupPage from './src/pages/GroupPage/GroupPage';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer independent>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Configurações" component={Config} options={{ headerShown: false }} />
        <Stack.Screen name="EntrarGrupo" component={EnterGroup} options={{ headerShown: false }} />
        <Stack.Screen name="EditProfile" component={EditProfile} options={{ headerShown: false }} />
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
        <Stack.Screen name="FaleConosco" component={GetInTouch} options={{ headerShown: false }} />
        <Stack.Screen name="GroupData" component={GroupData} options={{ headerShown: false }} />
        <Stack.Screen name="About" component={About} options={{ headerShown: false }} />
        <Stack.Screen name="Home" component={Home} options={{ headerShown: false }} />
        <Stack.Screen name="GroupPage" component={GroupPage} options={{ headerShown: false }} />
        <Stack.Screen
          name="WelcomeScreen"
          component={WelcomeScreen}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
