/* eslint-disable global-require */
import React, { useState } from 'react';
import { Image } from 'react-native';
import { useFonts } from 'expo-font';
import {
  GroupButtonContainer,
  GroupName,
  GroupOnline,
  GroupOnlineCircle,
  GroupTextContainer,
  GroupOnlineContainer,
  GroupFilterContainer,
  GroupButtonImage,
} from './GroupButtonStyle';

export default function GroupButton({ groupName, onlineMembers, size, onPress }: any) {
  const [filter, setFilter] = useState(true);
  const filterOn = require('../../assets/filter-on-icon.svg');
  const filterOff = require('../../assets/filter-off-icon.svg');
  const [fontsLoaded] = useFonts({
    'inter-bold': require('../../fonts/Inter-SemiBold.ttf'),
  });
  if (!fontsLoaded) {
    return undefined;
  }

  return (
    <GroupButtonContainer size={size} onPress={onPress}>
      <GroupTextContainer>
        <GroupName numberOfLines={2} fontFamily="inter-bold">
          {groupName}
        </GroupName>
        <GroupOnlineContainer>
          <GroupOnlineCircle />
          <GroupOnline fontFamily="inter-bold">
            {onlineMembers}
            {' membros'}
          </GroupOnline>
        </GroupOnlineContainer>
      </GroupTextContainer>
      <GroupFilterContainer>
        <GroupButtonImage onPress={() => setFilter(!filter)} size={size}>
          <Image source={filter ? filterOn : filterOff} />
        </GroupButtonImage>
      </GroupFilterContainer>
    </GroupButtonContainer>
  );
}
