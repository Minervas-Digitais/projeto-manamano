/* eslint-disable global-require */
import React, { useState } from 'react';
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

export default function Groups() {
  const [sideMenu, setSideMenu] = useState(true);
  const menu = require('../../assets/menu-icon.svg');
  const add = require('../../assets/add-icon.svg');
  const [fontsLoaded] = useFonts({
    'inter-bold': require('../../fonts/Inter-Bold.ttf'),
  });
  if (!fontsLoaded) {
    return undefined;
  }
  const fakeGroups: any = [
    { groupName: 'Vetereanos 22.1', onlineMembers: 23 },
    { groupName: 'Vetereanos 22.1', onlineMembers: 23 },
    { groupName: 'Vetereanos 22.1', onlineMembers: 23 },
    { groupName: 'Vetereanos 22.1', onlineMembers: 23 },
    { groupName: 'Vetereanos 22.1', onlineMembers: 23 },
    { groupName: 'Vetereanos 22.1', onlineMembers: 23 },
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
          {fakeGroups?.length > 0 ? (
            fakeGroups.map((item: any) => (
              <GroupButton groupName={item.groupName} onlineMembers={item.onlineMembers} size />
            ))
          ) : (
            <View />
          )}
        </GroupsList>
      </GroupsBody>
      <AddButton icon={add} />
    </GroupsContainer>
  );
}
