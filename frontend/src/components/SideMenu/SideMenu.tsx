/* eslint-disable global-require */
import React from 'react';
import { Image, TouchableOpacity } from 'react-native';
import { useFonts } from 'expo-font';
import { useNavigation } from '@react-navigation/native';
import {
  SideMenuContainer,
  SideMenuLogoContainer,
  SideMenuPage,
  SideMenuOptionsContainer,
  SideMenuLineContainer,
  SideMenuLine,
  SideMenuContainerShadow,
} from './SideMenuStyle';
import SideMenuOptions from '../SideMenuOptions/SideMenuOptions';

export default function SideMenu({ display, onPress }: any) {
  const logoManaMano = require('../../assets/manamano-icon-small.svg');
  const profile = require('../../assets/profile-blue-icon.svg');
  const seach = require('../../assets/lupa-icon.svg');
  const group = require('../../assets/group-icon.svg');
  const saved = require('../../assets/saved-icon.svg');
  const notification = require('../../assets/notification-icon.svg');
  const speakWithUs = require('../../assets/speak-with-us-icon.svg');
  const config = require('../../assets/config-icon.svg');
  const out = require('../../assets/out-icon.svg');

  const navigation = useNavigation();

  const [fontsLoaded] = useFonts({
    'inter-bold': require('../../fonts/Inter-Bold.ttf'),
  });
  if (!fontsLoaded) {
    return undefined;
  }
  return (
    <SideMenuPage display={display}>
      <SideMenuContainer>
        <SideMenuLogoContainer onPress={() => navigation.navigate('Home')}>
          <Image source={logoManaMano} />
        </SideMenuLogoContainer>
        <SideMenuLineContainer>
          <SideMenuLine />
        </SideMenuLineContainer>
        <SideMenuOptionsContainer>
          <SideMenuOptions
            icon={profile}
            text="Perfil"
            font="inter-bold"
            onPress={() => navigation.navigate('Profile')}
          />
          <SideMenuOptions icon={seach} text="Pesquisar" font="inter-bold" />
          <SideMenuOptions
            icon={group}
            text="Grupos"
            font="inter-bold"
            onPress={() => navigation.navigate('Groups')}
          />
          <SideMenuOptions icon={saved} text="Publicações salvas" font="inter-bold" />
          <SideMenuOptions
            icon={notification}
            text="Notificações"
            font="inter-bold"
            onPress={() => navigation.navigate('Notification')}
          />
          <SideMenuOptions
            icon={speakWithUs}
            text="Fale conosco"
            font="inter-bold"
            onPress={() => navigation.navigate('FaleConosco')}
          />
        </SideMenuOptionsContainer>
        <SideMenuLineContainer>
          <SideMenuLine />
        </SideMenuLineContainer>
        <SideMenuOptionsContainer style={{ height: '20vh' }}>
          <SideMenuOptions
            icon={config}
            text="Configurações"
            font="inter-bold"
            onPress={() => navigation.navigate('Configurações')}
          />
          <SideMenuOptions
            icon={out}
            text="Sair"
            font="inter-bold"
            onPress={() => navigation.navigate('WelcomeScreen')}
            color="#EF4036"
          />
        </SideMenuOptionsContainer>
      </SideMenuContainer>
      <TouchableOpacity activeOpacity={0} onPress={onPress}>
        <SideMenuContainerShadow />
      </TouchableOpacity>
    </SideMenuPage>
  );
}
