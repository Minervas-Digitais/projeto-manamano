/* eslint-disable global-require */
import React, { useEffect, useState } from 'react';
import { useFonts } from 'expo-font';
import { TouchableOpacity, View, Image } from 'react-native';
import { GroupsBody, GroupsContainer, GroupsList } from './GroupsStyle';
import {
  ConfigNotificationHeaderContainer,
  ConfigNotificationTitle,
} from '../Notification/NotificationStyle';
import SideMenu from '../../components/SideMenu/SideMenu';
import GroupButton from '../../components/GroupButton/GroupButton';
import AddButton from '../../components/AddButton/AddButton';
import api from '../../services/api';
import { storage } from '../SignIn/SignIn';

export default function Groups({ navigation }: any) {
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

  const [fontsLoaded] = useFonts({
    'inter-bold': require('../../fonts/Inter-Bold.ttf'),
  });
  if (!fontsLoaded) {
    return undefined;
  }

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
              />
            ))
          ) : (
            <View />
          )}
        </GroupsList>
      </GroupsBody>
      <AddButton icon={add} onPress={() => navigation.navigate('EntrarGrupo')} />
    </GroupsContainer>
  );
}
