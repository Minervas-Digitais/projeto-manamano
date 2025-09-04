/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable global-require */
import React, { useState } from 'react';
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
  GroupButtonGradient,
} from './GroupButtonStyle';
import FilterOnIcon from '../../assets/filter-on-icon.svg';
import FilterOffIcon from '../../assets/filter-off-icon.svg';

export default function GroupButton({
  groupName,
  onlineMembers,
  size,
  onPress,
  onPressFilter,
  filterIcon,
  groupId,
  testID,
}: any) {
  const [fontsLoaded] = useFonts({
    'inter-bold': require('../../fonts/Inter-SemiBold.ttf'),
  });
  if (!fontsLoaded) {
    return undefined;
  }
  const [filter, setFilter] = useState(filterIcon);

  return (
    <GroupButtonContainer onPress={onPress} testID={testID}>
      <GroupButtonGradient
        colors={['#1A0E47FF', '#170E47E3', '#160E47D1', '#170E47C7']}
        locations={[0, 0.85, 1, 1]}>
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
            testID={`filter-button-${groupId}`}
            onPress={() => {
              onPressFilter();
              setFilter(!filter);
            }}
            size={size}>
            {filter ? <FilterOnIcon /> : <FilterOffIcon />}
          </GroupButtonImage>
        </GroupFilterContainer>
      </GroupButtonGradient>
    </GroupButtonContainer>
  );
}
