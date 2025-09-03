/* eslint-disable global-require */
import React, { useEffect, useRef, useState } from 'react';
import { View, Dimensions } from 'react-native';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { useFonts } from 'expo-font'; // Add this import if missing
import { GroupsBody, GroupsContainer, GroupsList } from './GroupsStyle';
import GroupButton from '../../components/GroupButton/GroupButton';
import AddButton from '../../components/AddButton/AddButton';
import { storage } from '../SignIn/SignIn';
import ShowPopup from '../../components/GroupPopup/GroupPopup';
import api from '../../services/api';
import HeaderCustom from '../../components/HeaderCustom/HeaderCustom';
import Add from '../../assets/add-icon.svg';
import { RootStackParamList } from '../../navigation/types';

export default function Groups() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>(); // Use navigation instance
  const [fontsLoaded] = useFonts({
    'inter-bold': require('../../fonts/Inter-Bold.ttf'),
  });

  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [showPopup, setShowPopup] = useState(false); // Initially the popup is hidden
  const [popupPosition, setPopupPosition] = useState<{ top: number; left: number } | null>(null);
  const [userData, setUserData] = useState<any>(null); // State to hold user data
  const addButtonRef = useRef<View>(null); // Ref for the "AddButton"
  const [groups, setGroups] = useState([]);

  useEffect(() => {
    // Retrieve the access token from storage
    const token = storage.getString('accessToken');
    if (token) setAccessToken(token);
    const loggedId = storage.getString('loggedId');
    if (loggedId && token) {
      api
        .get(`participant/groups/${loggedId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((res: any) => {
          setGroups(res.data);
        });
    }

    // Fetch user information to check the "tipo"
    const fetchUserTipo = async () => {
      const token = storage.getString('accessToken');

      if (token) {
        try {
          const userId = storage.getString('loggedId');

          const { data: fetchedUserData } = await api.get(`/user/${userId}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          setUserData(fetchedUserData);

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

    // Handle the AddButton press logic
    // If the user doesn't have the correct ID, navigate to EntrarGrupo
    if (!userData || userData.role !== 'MODERATOR') {
        navigation.navigate('EntrarGrupo');
        return;
    }

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

      setShowPopup(true);
    });
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

  return (
    <GroupsContainer>
      <HeaderCustom icon menu text="Grupos" font="inter-bold" />
      <GroupsBody>
        <GroupsList>
          {groups?.length > 0 ? (
            groups.map((item: any, index: number) => (
              <GroupButton
                key={item.groupId}
                groupName={item.group.name}
                onlineMembers={item.participantCount}
                onPress={() => {
                  navigation.navigate('GroupPage', item.groupId);
                  storage.set('groupInfo', item);
                }}
                size
              />
            ))
          ) : (
            <View />
          )}
        </GroupsList>
      </GroupsBody>
      <View ref={addButtonRef}>
        {' '}
        {/* Wrap AddButton with a View for measuring */}
        <AddButton testID="add-button" icon={<Add />} onPress={handleAddButtonPress} />
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
