/* eslint-disable global-require */
import React, { useState } from 'react';
import { TouchableOpacity, View } from 'react-native';
import { HeaderContainer, HeaderText, NoIcon } from './HeaderCustomStyle';
import BackButton from '../BackButton/BackButton';
import Menu from '../../assets/menu-icon.svg';
import SideMenu from '../SideMenu/SideMenu';

export default function HeaderCustom({
  font,
  text,
  icon,
  onPress,
  onPressTitle,
  menu,
  testID,
}: any) {
  const [sideMenu, setSideMenu] = useState(true);

  return (
    <HeaderContainer>
      {menu ? (
        <View>
          <View style={{ right: 25 }}>
            <SideMenu display={sideMenu} onPress={() => setSideMenu(!sideMenu)} />
          </View>
          <TouchableOpacity onPress={() => setSideMenu(!sideMenu)}>
            <Menu />
          </TouchableOpacity>
        </View>
      ) : (
        <BackButton />
      )}
      <TouchableOpacity onPress={onPressTitle}>
        <HeaderText font={font} {...(testID ? { testID } : {})}>{text}</HeaderText>
      </TouchableOpacity>
      {icon ? <TouchableOpacity onPress={onPress}>{icon}</TouchableOpacity> : <NoIcon />}
    </HeaderContainer>
  );
}
