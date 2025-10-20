/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable global-require */
import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import { useFonts } from 'expo-font';
import { LinearGradient } from 'expo-linear-gradient';
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
import FilterOnIcon from '../../assets/filter-on-icon.svg';
import FilterOffIcon from '../../assets/filter-off-icon.svg';

export default function GroupButton({
  groupName,
  onlineMembers,
  onPress,
  onPressFilter,
  filterIcon,
  groupId,
  testID,
  containerStyle,
  showFilter = true,
}: any) {
  const [fontsLoaded] = useFonts({
    'inter-bold': require('../../fonts/Inter-SemiBold.ttf'),
  });
  if (!fontsLoaded) {
    return undefined;
  }
  const [filter, setFilter] = useState(filterIcon);
  return (
    <GroupButtonContainer onPress={onPress} testID={testID} style={containerStyle}>
      <LinearGradient
        colors={['#1A0E47FF', '#170E47E3', '#160E47D1', '#170E47C7']}
        locations={[0, 0.85, 1, 1]}
        style={StyleSheet.absoluteFill}
      />
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
      {showFilter && (
        <GroupFilterContainer>
          <GroupButtonImage
            testID={`filter-button-${groupId}`}
            onPress={() => {
              onPressFilter();
              setFilter(!filter);
            }}>
            {filter ? <FilterOnIcon /> : <FilterOffIcon />}
          </GroupButtonImage>
        </GroupFilterContainer>
      )}
    </GroupButtonContainer>
  );
}
