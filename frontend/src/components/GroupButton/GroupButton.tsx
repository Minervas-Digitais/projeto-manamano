/* eslint-disable react-hooks/rules-of-hooks */
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

export default function GroupButton({
  groupName,
  onlineMembers,
  size,
  onPress,
  onPressFilter,
  filterIcon,
}: any) {
  const [fontsLoaded] = useFonts({
    'inter-bold': require('../../fonts/Inter-SemiBold.ttf'),
  });
  if (!fontsLoaded) {
    return undefined;
  }
  const filterOn = require('../../assets/filter-on-icon.svg');
  const filterOff = require('../../assets/filter-off-icon.svg');
  const [filter, setFilter] = useState(filterIcon);

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
        <GroupButtonImage
          onPress={() => {
            onPressFilter();
            setFilter(!filter);
          }}
          size={size}
        >
          <Image source={filter ? filterOn : filterOff} />
        </GroupButtonImage>
      </GroupFilterContainer>
    </GroupButtonContainer>
  );
}
