/* eslint-disable global-require */
import React from 'react';
import { HeaderContainer, HeaderImage, HeaderText } from './HeaderCustomStyle';

export default function HeaderCustom({ font, text }: any) {
  const backbutton = require('../../assets/back-button-icon.svg');
  return (
    <HeaderContainer>
      <HeaderImage source={backbutton} />
      <HeaderText font={font}>{text}</HeaderText>
    </HeaderContainer>
  );
}
