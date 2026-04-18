/* eslint-disable global-require */
import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import EnterGroup from './src/pages/EnterGroup/EnterGroup';
import ChangePassword from './src/pages/ChangePassword/ChangePassword';
import Config from './src/pages/Configuration/Configuration';
import ConfigNotification from './src/pages/ConfigNotification/ConfigNotification';
import SignIn from './src/pages/SignIn/SignIn';
import SignUp from './src/pages/SignUp/SignUp';
import WelcomeScreen from './src/pages/Welcome/Welcome';
import Notification from './src/pages/Notification/Notification';
import EditProfile from './src/pages/EditProfile/EditProfile';
import GetInTouch from './src/pages/GetInTouch/GetInTouch';
import GroupData from './src/pages/GroupData/GroupData';
import About from './src/pages/About/About';
import Home from './src/pages/Home/Home';
import SideMenu from './src/components/SideMenu/SideMenu';
import Post from './src/pages/Post/Post';
import GroupPage from './src/pages/GroupPage/GroupPage';
import Profile from './src/pages/Profile/Profile';
import VisitorProfile from './src/pages/VisitorProfile/VisitorProfile';
import NewPost from './src/pages/NewPost/NewPost';
import NewLesson from './src/pages/NewLesson/NewLesson';
import Search from './src/pages/Search/Search';
import CreateGroup from './src/pages/CreateGroup/CreateGroup';
import EditGroup from './src/pages/EditGroup/EditGroup';
import NotificationPage from './src/pages/NotificationPage/NotificationPage';
import ADMPage from './src/pages/ADMPage/ADMPage';
import GlobalNotificationPage from './src/pages/GlobalNotificationPage/GlobalNotificationPage';
import Groups from './src/pages/Groups/Groups';
import { useNotifications } from './src/hooks/useNotification';
import { SavedPostsProvider } from './src/context/SavedPostsContext';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

const Stack = createNativeStackNavigator();

export default function App() {
  const linking = {
    prefixes: ['manamano://'],
    config: {
      screens: {
        Post: 'post/:postId',
        Profile: 'profile/:id',
        NewPost: 'newpost/:groupId',
        NewLesson: 'newlesson/:groupId',
        VisitorProfile: 'visitorprofile/:id',
        GroupPage: 'group/:groupId',
        EditProfile: 'editprofile/:id',
        GroupData: 'groupdata/:groupId',
      },
    },
  };

  useNotifications();

  useEffect(() => {
    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('default', {
        name: 'Default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FFFFFFFF',
      });
    }
  }, []);

  return (
    <SavedPostsProvider>
      <NavigationContainer independent linking={linking}>
        <Stack.Navigator initialRouteName="WelcomeScreen">
          <Stack.Screen
            name="WelcomeScreen"
            component={WelcomeScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen name="Config" component={Config} options={{ headerShown: false }} />
          <Stack.Screen name="ADMPage" component={ADMPage} options={{ headerShown: false }} />
          <Stack.Screen
            name="GlobalNotification"
            component={GlobalNotificationPage}
            options={{ headerShown: false }}
          />
          <Stack.Screen name="Groups" component={Groups} options={{ headerShown: false }} />

          <Stack.Screen name="Post" component={Post} options={{ headerShown: false }} />
          <Stack.Screen
            name="EntrarGrupo"
            component={EnterGroup}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="EditProfile"
            component={EditProfile}
            options={{ headerShown: false }}
          />
          <Stack.Screen name="NewPost" component={NewPost} options={{ headerShown: false }} />
          <Stack.Screen name="NewLesson" component={NewLesson} options={{ headerShown: false }} />
          <Stack.Screen
            name="ChangePassword"
            component={ChangePassword}
            options={{ headerShown: false }}
          />

          <Stack.Screen name="SignIn" component={SignIn} options={{ headerShown: false }} />
          <Stack.Screen name="SignUp" component={SignUp} options={{ headerShown: false }} />
          <Stack.Screen name="Search" component={Search} options={{ headerShown: false }} />
          <Stack.Screen
            name="Notification"
            component={Notification}
            options={{ headerShown: false }}
          />
          <Stack.Screen name="SideMenu" component={SideMenu} options={{ headerShown: false }} />
          <Stack.Screen
            name="CreateGroup"
            component={CreateGroup}
            options={{ headerShown: false }}
          />
          <Stack.Screen name="GroupData" component={GroupData} options={{ headerShown: false }} />
          <Stack.Screen name="About" component={About} options={{ headerShown: false }} />
          <Stack.Screen name="Home" component={Home} options={{ headerShown: false }} />
          <Stack.Screen name="GroupPage" component={GroupPage} options={{ headerShown: false }} />

          <Stack.Screen name="Profile" component={Profile} options={{ headerShown: false }} />
          <Stack.Screen
            name="VisitorProfile"
            component={VisitorProfile}
            options={{ headerShown: false }}
          />
          <Stack.Screen name="GetInTouch" component={GetInTouch} options={{ headerShown: false }} />
          <Stack.Screen
            name="ConfigNotification"
            component={ConfigNotification}
            options={{ headerShown: false }}
          />
          <Stack.Screen name="EditGroup" component={EditGroup} options={{ headerShown: false }} />
          <Stack.Screen
            name="NotificationPage"
            component={NotificationPage}
            options={{ headerShown: false }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SavedPostsProvider>
  );
}
