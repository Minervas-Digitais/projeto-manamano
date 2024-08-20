/* eslint-disable global-require */
import React from 'react';
import { useFonts } from 'expo-font';
import { Image, TouchableOpacity, Linking } from 'react-native';
import {
  DevMemberCardContainer,
  DevMemberCardContainerInfo,
  DevMemberCardImage,
  DevMemberCardView,
} from './DevMemberCardStyle';
import { GroupDataText } from '../../pages/GroupData/GroupDataStyle';
// A descrição está limitado à penas 3 linhas e o nome em 1 linha
export default function DevMemberCard({ name, image, description, url }: any) {
  const linkedinIcon = require('../../assets/linkedin-icon.svg');

  const [fontsLoaded] = useFonts({
    'inter-bold': require('../../fonts/Inter-Bold.ttf'),
    'inter-semiBold': require('../../fonts/Inter-SemiBold.ttf'),
  });
  if (!fontsLoaded) {
    return undefined;
  }
  return (
    <DevMemberCardContainer>
      <DevMemberCardImage source={image} />
      <DevMemberCardContainerInfo>
        <DevMemberCardView>
          <GroupDataText numberOfLines={1} font="inter-bold" color="#4E4E4E" size="13px">
            {name}
          </GroupDataText>
          <TouchableOpacity onPress={() => Linking.openURL(url)}>
            <Image source={linkedinIcon} />
          </TouchableOpacity>
        </DevMemberCardView>
        <GroupDataText numberOfLines={3} font="inter-semiBold" color="#4E4E4E" size="12px">
          {description}
        </GroupDataText>
      </DevMemberCardContainerInfo>
    </DevMemberCardContainer>
  );
}
