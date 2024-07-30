/* eslint-disable global-require */
import React from 'react';
import { View } from 'react-native';
import { HeaderContainer, HeaderImage, HeaderText } from './HeaderCustomStyle';

export default function HeaderCustom({ font, text }: any) {
  const backbutton = require('../../assets/back-button-icon.svg');
  return (
    <View>
      <HeaderImage source={backbutton} />
      <HeaderContainer>
        <HeaderText font={font}>{text}</HeaderText>
      </HeaderContainer>
    </View>
  );
}
