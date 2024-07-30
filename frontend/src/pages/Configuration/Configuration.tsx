/* eslint-disable global-require */
import React from 'react';
import { View } from 'react-native';
import { useFonts } from 'expo-font';
import SideMenuOptions from '../../components/SideMenuOptions/SideMenuOptions';
import HeaderCustom from '../../components/HeaderCustom/HeaderCustom';

export default function Config() {
  const notification = require('../../assets/notification-licon.svg');
  const lock = require('../../assets/lock-licon.svg');
  const about = require('../../assets/about-icon.svg');
  const [fontsLoaded] = useFonts({
    'inter-bold': require('../../fonts/Inter-Bold.ttf'),
  });
  if (!fontsLoaded) {
    return undefined;
  }
  return (
    <View style={{ backgroundColor: '#F2F6FA', flex: 1 }}>
      <HeaderCustom font="inter-bold" text="Configurações" />
      <View style={{ gap: 25, backgroundColor: '#F2F6FA', marginLeft: 25 }}>
        <SideMenuOptions icon={notification} text="Notificações" font="inter-bold" />
        <SideMenuOptions icon={about} text="Sobre" font="inter-bold" />
        <SideMenuOptions icon={lock} text="Mudar senha" font="inter-bold" />
      </View>
    </View>
  );
}
