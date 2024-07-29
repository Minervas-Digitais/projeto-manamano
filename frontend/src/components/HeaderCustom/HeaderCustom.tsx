/* eslint-disable global-require */
import React from 'react';
import { Image } from 'react-native';
import { HeaderContainer, HeaderText, HeaderTouchable } from './HeaderCustomStyle';

export default function HeaderCustom({ font, text }: any) {
  const backbutton = require('../../assets/back-button-icon.svg');
  return (
    <HeaderContainer>
      <HeaderTouchable>
        <Image source={backbutton} />
      </HeaderTouchable>
      <HeaderText font={font}>{text}</HeaderText>
    </HeaderContainer>
  );
}
