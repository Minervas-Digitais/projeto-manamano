/* eslint-disable global-require */
import React, { useCallback, useState } from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { NavigationProp, useFocusEffect, useNavigation } from '@react-navigation/native';
import { GroupsBody, GroupsContainer, GroupsList } from './GroupsStyle';
import GroupButton from '../../components/GroupButton/GroupButton';
import AddButton from '../../components/AddButton/AddButton';
import ShowPopup from '../../components/GroupPopup/GroupPopup';
import api from '../../services/api';
import Add from '../../assets/add-icon.svg';
import { RootStackParamList } from '../../navigation/types';
import ScreenWithHeader from '../../components/ScreenWithHeader/ScreenWithHeader';
import { useAuth } from '../../context/auth/useAuth';

export default function Groups() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>(); // Use navigation instance
  const { loggedId } = useAuth();

  const [showPopup, setShowPopup] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [groups, setGroups] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const GROUPS_PER_PAGE = 10;
  const displayedGroups = groups.slice(0, page * GROUPS_PER_PAGE);
  const hasMoreGroups = displayedGroups.length < groups.length;

  useFocusEffect(
    useCallback(() => {
      const fetchData = async () => {
        if (loggedId) {
          api
            .get('participant/groups/')
            .then((res: any) => {
              const data = res.data.data ?? res.data;
              setGroups(Array.isArray(data) ? data : []);
              setPage(1);
            })
            .catch(() => {
              setGroups([]);
            });
        }

        // Fetch user information to check the "tipo"
        if (loggedId) {
          try {
            const { data: fetchedUserData } = await api.get(`/user/${loggedId}`);
            setUserData(fetchedUserData);
          } catch (error) {
            console.error('Error fetching user data:', error);
          }
        }
      };

      fetchData();
    }, []),
  );

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
    <ScreenWithHeader headerProps={{ menu: true, text: 'Grupos', font: 'inter-bold' }}>
      <GroupsContainer>
        <GroupsBody>
          <GroupsList
            contentContainerStyle={{ gap: 25, alignItems: 'center', paddingBottom: 20 }}
            showsVerticalScrollIndicator={false}>
            {displayedGroups?.length > 0 ? (
              displayedGroups.map((item: any) => (
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
            {hasMoreGroups && (
              <TouchableOpacity
                onPress={() => setPage((p) => p + 1)}
                style={{
                  backgroundColor: '#EF4036',
                  padding: 12,
                  borderRadius: 8,
                  marginTop: 16,
                  width: '100%',
                  alignItems: 'center',
                }}>
                <Text style={{ color: '#fff', fontFamily: 'inter-bold' }}>Carregar mais</Text>
              </TouchableOpacity>
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
    </ScreenWithHeader>
  );
}
