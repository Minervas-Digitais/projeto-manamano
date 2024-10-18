/* eslint-disable global-require */
import React from 'react';
import { useFonts } from 'expo-font';
import { GroupDataText } from '../../pages/GroupData/GroupDataStyle';
import { GroupMembersImage, GroupMembersContainer } from './GroupMembersStyle';

export default function GroupMembers({ user, image }: any) {
  const [fontsLoaded] = useFonts({
    'inter-semiBold': require('../../fonts/Inter-SemiBold.ttf'),
  });
  if (!fontsLoaded) {
    return undefined;
  }
  return (
    <GroupMembersContainer>
      <GroupMembersImage source={image} />
      <GroupDataText color="#4E4E4E" font="inter-semiBold" size="12">
        {user}
      </GroupDataText>
    </GroupMembersContainer>
  );
}
