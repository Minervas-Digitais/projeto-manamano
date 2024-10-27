/* eslint-disable global-require */
import React from 'react';
import { Image, TouchableOpacity } from 'react-native';
import { HeaderContainer, HeaderText, NoIcon } from './HeaderCustomStyle';
import BackButton from '../BackButton/BackButton';

export default function HeaderCustom({
  font,
  text,
  icon,
  onPress,
  onPressMenu,
  onPressTitle,
  menu,
  headerButton,
}: any) {
  const menuIcon = require('../../assets/menu-icon.svg');
  return (
    <HeaderContainer>
      {menu ? (
        <TouchableOpacity onPress={onPressMenu}>
          <Image source={menuIcon} />
        </TouchableOpacity>
      ) : (
        <BackButton />
      )}
      <TouchableOpacity activeOpacity={onPressTitle || 1}>
        <HeaderText font={font}>{text}</HeaderText>
      </TouchableOpacity>
      {icon ? (
        <TouchableOpacity onPress={onPress}>
          <Image source={icon} />
          {headerButton}
        </TouchableOpacity>
      ) : (
        <NoIcon />
      )}
    </HeaderContainer>
  );
}
