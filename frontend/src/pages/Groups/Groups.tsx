/* eslint-disable global-require */
import React, { useEffect, useState } from 'react';
import { useFonts } from 'expo-font';
import { TouchableOpacity, View, Image, Dimensions } from 'react-native';
import { GroupsBody, GroupsContainer, GroupsList } from './GroupsStyle';
import {
  ConfigNotificationHeaderContainer,
  ConfigNotificationTitle,
} from '../Notification/NotificationStyle';
import SideMenu from '../../components/SideMenu/SideMenu';
import GroupButton from '../../components/GroupButton/GroupButton';
import AddButton from '../../components/AddButton/AddButton';
import api from '../../services/api';
import { storage } from '../../pages/SignIn/SignIn';
import ShowPopup from '../../components/GroupPopup/GroupPopup';
import { useNavigation } from '@react-navigation/native';
import { useFonts } from 'expo-font'; // Add this import if missing

export default function Groups() {
  const [sideMenu, setSideMenu] = useState(true);
  const [groups, setGroups] = useState([]);
  const menu = require('../../assets/menu-icon.svg');
  const add = require('../../assets/add-icon.svg');

  useEffect(() => {
    const accessToken = storage.getString('accessToken');
    const loggedId = storage.getString('loggedId');
    if (loggedId && accessToken) {
      api
        .get(`participant/groups/${loggedId}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        })
        .then((res) => {
          setGroups(res.data);
        });
    }
  }, []);
  const navigation = useNavigation(); // Use navigation instance
  const [fontsLoaded] = useFonts({
    'inter-bold': require('../../fonts/Inter-Bold.ttf'),
  });

  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [showPopup, setShowPopup] = useState(false); // Initially the popup is hidden
  const [popupPosition, setPopupPosition] = useState<{ top: number; left: number } | null>(null); // State for popup position
  const [userData, setUserData] = useState<any>(null); // State to hold user data
  const addButtonRef = useRef<View>(null); // Ref for the "AddButton"

  useEffect(() => {
    // Retrieve the access token from storage
    const token = storage.getString('accessToken');
    if (token) setAccessToken(token);
    console.log(token);

    // Fetch user information to check the "tipo"
    const fetchUserTipo = async () => {
      if (token) {
        try {
          const userId = storage.getString('loggedId'); // Assume userId is stored in storage
          const response = await fetch(`http://localhost:3000/user/${userId}`, {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });
          console.log(response);

          if (!response.ok) {
            throw new Error('Failed to fetch user data.');
          }

          const fetchedUserData = await response.json();
          console.log(fetchedUserData);

          // Store user data in state
          setUserData(fetchedUserData);

          // Only show the popup if the user ID matches the specific one
          if (fetchedUserData.role === "INSTRUCTOR") {
            setShowPopup(true); // Show the popup only if the user is the one with the ID
          } else {
            setShowPopup(false); // Hide the popup for users without the right ID
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      }
    };

    fetchUserTipo();
  }, []);

  if (!fontsLoaded) {
    return null; // Avoid returning undefined; return null instead
  }

  const handleAddButtonPress = () => {
    const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

    addButtonRef.current?.measure((x, y, width, height, pageX, pageY) => {
      const adjustedPosition = {
        top: Math.min(pageY, screenHeight - height - 10), // Prevent overflow on the bottom
        left: Math.min(pageX, screenWidth - width - 10), // Prevent overflow on the right
        bottom: Math.max(screenHeight - pageY - height, 10), // Distance from bottom
        right: Math.max(screenWidth - pageX - width, 10), // Distance from right
      };

      console.log('Popup Position:', adjustedPosition); // Debugging
      setPopupPosition(adjustedPosition);
    });

    // Handle the AddButton press logic
    if (userData && userData.role === "INSTRUCTOR") {
      setShowPopup(true); // Show the popup only if the user is the one with the ID
    } else {
      // If the user doesn't have the correct ID, navigate to EntrarGrupo
      navigation.navigate('EntrarGrupo');
    }
  };

  const handlePopupOption = (option: string) => {
    setShowPopup(false); // Close the popup after an option is selected
    if (option === 'Criar Grupo') {
      // Navigate to "CreateGroup" screen
      navigation.navigate('CreateGroup');
    } else if (option === 'Entrar Grupo') {
      // Navigate to "EntrarGrupo" screen ONLY after the user clicks the button
      navigation.navigate('EntrarGrupo');
    }
  };

  const fakeGroups: any = [
    { groupName: 'Turma 24.1', onlineMembers: 23 },
    { groupName: 'Veteranos 22.1', onlineMembers: 23 },
    { groupName: 'Veteranos 22.1', onlineMembers: 23 },
    { groupName: 'Veteranos 22.1', onlineMembers: 23 },
    { groupName: 'Veteranos 22.1', onlineMembers: 23 },
    { groupName: 'Veteranos 22.1', onlineMembers: 23 },
  ];

  return (
    <GroupsContainer>
      <SideMenu display={sideMenu} onPress={() => setSideMenu(!sideMenu)} />
      <ConfigNotificationHeaderContainer>
        <TouchableOpacity onPress={() => setSideMenu(!sideMenu)}>
          <Image source={menu} />
        </TouchableOpacity>
        <ConfigNotificationTitle font="inter-bold">Grupos</ConfigNotificationTitle>
        <View />
      </ConfigNotificationHeaderContainer>
      <GroupsBody>
        <GroupsList>
          {groups?.length > 0 ? (
            groups.map((item: any) => (
              <GroupButton
                key={item.groupId}
                groupName={item.group.name}
                onlineMembers={item.participantCount}
                onPress={() => {
                  navigation.navigate('GroupPage');
                  storage.set('groupInfo', item);
                }}
                size
          {fakeGroups?.length > 0 ? (
            fakeGroups.map((item: any, index: number) => (
              <GroupButton
                key={index} // Added unique key
                groupName={item.groupName}
                onlineMembers={item.onlineMembers}
                size
                onPress={() => navigation.navigate('GroupPage')} // Navigate to GroupPage
              />
            ))
          ) : (
            <View />
          )}
        </GroupsList>
      </GroupsBody>
      <View ref={addButtonRef}> {/* Wrap AddButton with a View for measuring */}
        <AddButton
          icon={require('../../assets/add-icon.svg')}
          onPress={handleAddButtonPress}
        />
      </View>
      <ShowPopup
        visible={showPopup}
        position={popupPosition} // Pass the position, including bottom and right
        onClose={() => setShowPopup(false)}
        onOptionSelect={handlePopupOption}
      />

    </GroupsContainer>
  );
}
