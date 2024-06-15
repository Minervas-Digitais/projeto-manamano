/* eslint-disable global-require */
import React from 'react';
import { Image, View } from 'react-native';
import { useFonts } from 'expo-font';
import {
  SideMenuContainer,
  SideMenuLogoContainer,
  SideMenuPage,
  SideMenuOptionsContainer,
  SideMenuLineContainer,
  SideMenuLine,
} from './SideMenuStyle';
import SideMenuOptions from '../SideMenuOptions/SideMenuOptions';

export default function SideMenu() {
  const logoManaMano = require('../../assets/manamano-icon-small.svg');
  const profile = require('../../assets/profile-blue-icon.svg');
  const seach = require('../../assets/lupa-icon.svg');
  const group = require('../../assets/group-icon.svg');
  const saved = require('../../assets/saved-icon.svg');
  const notification = require('../../assets/notification-icon.svg');
  const speakWithUs = require('../../assets/speak-with-us-icon.svg');
  const config = require('../../assets/config-icon.svg');

  const [fontsLoaded] = useFonts({
    'inter-bold': require('../../fonts/Inter-Bold.ttf'),
  });
  if (!fontsLoaded) {
    return undefined;
  }
  return (
    <SideMenuPage>
      <SideMenuContainer>
        <SideMenuLogoContainer>
          <Image source={logoManaMano} />
        </SideMenuLogoContainer>
        <SideMenuLineContainer>
          <SideMenuLine />
        </SideMenuLineContainer>
        <SideMenuOptionsContainer>
          <SideMenuOptions icon={profile} text="Perfil" font="inter-bold" />
          <SideMenuOptions icon={seach} text="Pesquisar" font="inter-bold" />
          <SideMenuOptions icon={group} text="Grupos" font="inter-bold" />
          <SideMenuOptions icon={saved} text="Publicações salvas" font="inter-bold" />
          <SideMenuOptions icon={notification} text="Notificações" font="inter-bold" />
          <SideMenuOptions icon={speakWithUs} text="Fale conosco" font="inter-bold" />
        </SideMenuOptionsContainer>
        <SideMenuLineContainer>
          <SideMenuLine />
        </SideMenuLineContainer>
        <SideMenuOptionsContainer style={{ height: '20vh' }}>
          <SideMenuOptions icon={config} text="Configurações" font="inter-bold" />
        </SideMenuOptionsContainer>
      </SideMenuContainer>
    </SideMenuPage>
  );
}
