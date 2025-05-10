/* eslint-disable global-require */
import React from 'react';
import {
  SideMenuOptionsButtonsContainer,
  SideMenuOptionsButtonsText,
} from './SideMenuOptionsStyle';

export default function SideMenuOptions({ icon, font, text, color, onPress }: any) {
  return (
    <SideMenuOptionsButtonsContainer onPress={onPress}>
      {icon}
      <SideMenuOptionsButtonsText font={font} color={color}>
        {text}
      </SideMenuOptionsButtonsText>
    </SideMenuOptionsButtonsContainer>
  );
}
