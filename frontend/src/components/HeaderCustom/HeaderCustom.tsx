/* eslint-disable global-require */
import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { HeaderContainer, HeaderText, NoIcon } from './HeaderCustomStyle';
import BackButton from '../BackButton/BackButton';
import Menu from '../../assets/menu-icon.svg';
import { useSideMenu } from '../../context/SideMenuContext';

export default function HeaderCustom({
  font,
  text,
  icon,
  onPress,
  onPressTitle,
  menu,
  testID,
}: any) {
  const { toggleMenu } = useSideMenu();

  return (
    <HeaderContainer>
      {menu ? (
        <View>
          <TouchableOpacity onPress={toggleMenu}>
            <Menu />
          </TouchableOpacity>
        </View>
      ) : (
        <BackButton />
      )}
      <TouchableOpacity
        onPress={onPressTitle}
        style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 8 }}
        activeOpacity={0.7}>
        <HeaderText
          font={font}
          numberOfLines={1}
          ellipsizeMode="tail"
          adjustsFontSizeToFit
          {...(testID ? { testID } : {})}>
          {text}
        </HeaderText>
      </TouchableOpacity>
      {icon ? <TouchableOpacity onPress={onPress}>{icon}</TouchableOpacity> : <NoIcon />}
    </HeaderContainer>
  );
}
