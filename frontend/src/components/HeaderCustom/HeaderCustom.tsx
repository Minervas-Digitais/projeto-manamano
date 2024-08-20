/* eslint-disable global-require */
import React from 'react';
import { Image, TouchableOpacity } from 'react-native';
import { HeaderContainer, HeaderText, NoIcon } from './HeaderCustomStyle';
import BackButton from '../BackButton/BackButton';

export default function HeaderCustom({ font, text, icon, onPress }: any) {
  return (
    <HeaderContainer>
      <BackButton />
      <HeaderText font={font}>{text}</HeaderText>
      {icon ? (
        <TouchableOpacity onPress={onPress}>
          <Image source={icon} />
        </TouchableOpacity>
      ) : (
        <NoIcon />
      )}
    </HeaderContainer>
  );
}
