/* eslint-disable global-require */
import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { useFonts } from 'expo-font'; // Add this import if missing
import { GroupsBody, GroupsContainer, GroupsList } from './GroupsStyle';
import GroupButton from '../../components/GroupButton/GroupButton';
import AddButton from '../../components/AddButton/AddButton';
import secureStorage from '../../services/secureStorage';
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
  const [showPopup, setShowPopup] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [groups, setGroups] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      // Retrieve the access token from storage
      const token = await secureStorage.getItem('accessToken');
      if (token) setAccessToken(token);
      const loggedId = await secureStorage.getItem('loggedId');
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
      if (token) {
        try {
          const userId = await secureStorage.getItem('loggedId');

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

    fetchData();
  }, []);

  if (!fontsLoaded) {
    return null; // Avoid returning undefined; return null instead
  }

  const handleAddButtonPress = () => {
    // Check if user has permission: role INSTRUCTOR or sysRole MODERATOR or ADMIN
    const hasPermission =
      userData?.role === 'INSTRUCTOR' ||
      userData?.sysRole === 'MODERATOR' ||
      userData?.sysRole === 'ADMIN';

    if (!userData || !hasPermission) {
      navigation.navigate('EntrarGrupo');
      return;
    }

    setShowPopup(true);
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
                  navigation.navigate('GroupPage', {
                    groupId: item.groupId,
                    groupName: item.group.name,
                  });
                }}
                showFilter={false}
                containerStyle={{
                  display: 'flex',
                  alignItems: 'center',
                  width: '100%',
                  backgroundColor: '#f2f6fa',
                }}
              />
            ))
          ) : (
            <View />
          )}
        </GroupsList>
      </GroupsBody>
      <AddButton testID="add-button" icon={<Add />} onPress={handleAddButtonPress} />
      <ShowPopup
        visible={showPopup}
        onClose={() => setShowPopup(false)}
        onOptionSelect={handlePopupOption}
      />
    </GroupsContainer>
  );
}
