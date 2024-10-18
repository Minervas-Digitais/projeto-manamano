/* eslint-disable global-require */
import React from 'react';
import { Image } from 'react-native';
import {
  SideMenuOptionsButtonsContainer,
  SideMenuOptionsButtonsText,
} from './SideMenuOptionsStyle';

export default function SideMenuOptions({ icon, font, text, onPress }: any) {
  return (
    <SideMenuOptionsButtonsContainer onPress={onPress}>
      <Image source={icon} />
      <SideMenuOptionsButtonsText font={font}>{text}</SideMenuOptionsButtonsText>
    </SideMenuOptionsButtonsContainer>
  );
}
