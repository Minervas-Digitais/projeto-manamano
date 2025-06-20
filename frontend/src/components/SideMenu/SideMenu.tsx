/* eslint-disable global-require */
import React from 'react';
import { Dimensions, Image, TouchableOpacity } from 'react-native';
import { useFonts } from 'expo-font';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
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
import LogoManaMano from '../../assets/manamano-icon-small.svg';
import ProfileIcon from '../../assets/profile-blue-icon.svg';
import SearchIcon from '../../assets/lupa-icon.svg';
import GroupIcon from '../../assets/group-icon.svg';
import SavedIcon from '../../assets/saved-icon.svg';
import NotificationIcon from '../../assets/notification-icon.svg';
import SpeakWithUsIcon from '../../assets/speak-with-us-icon.svg';
import ConfigIcon from '../../assets/config-icon.svg';
import OutIcon from '../../assets/out-icon.svg';
import NotificationIcon2 from '../../assets/notification-unread-icon.svg';
import { RootStackParamList } from '../../navigation/types';

export default function SideMenu({ display, onPress }: any) {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { width, height } = Dimensions.get('window');

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
          <LogoManaMano width={40} height={40} />
        </SideMenuLogoContainer>
        <SideMenuLineContainer>
          <SideMenuLine />
        </SideMenuLineContainer>
        <SideMenuOptionsContainer>
          <SideMenuOptions
            icon={<ProfileIcon width={24} height={24} />}
            text="Perfil"
            font="inter-bold"
            onPress={() => navigation.navigate('Profile')}
          />
          <SideMenuOptions
            icon={<SearchIcon width={24} height={24} />}
            text="Pesquisar"
            font="inter-bold"
            onPress={() => navigation.navigate('Search')}
          />
          <SideMenuOptions
            icon={<GroupIcon width={24} height={24} />}
            text="Grupos"
            font="inter-bold"
            onPress={() => navigation.navigate('Groups')}
          />
          <SideMenuOptions
            icon={<SavedIcon width={24} height={24} />}
            text="Publicações salvas"
            font="inter-bold"
          />
          <SideMenuOptions
            icon={<NotificationIcon width={24} height={24} />}
            icon2={<NotificationIcon2 width={24} height={24} />}
            type="notification"
            text="Notificações"
            font="inter-bold"
            onPress={() => navigation.navigate('Notification')}
          />
          <SideMenuOptions
            icon={<SpeakWithUsIcon width={24} height={24} />}
            text="Fale conosco"
            font="inter-bold"
            onPress={() => navigation.navigate('GetInTouch')}
          />
        </SideMenuOptionsContainer>
        <SideMenuLineContainer>
          <SideMenuLine />
        </SideMenuLineContainer>
        <SideMenuOptionsContainer style={{ height: height * 0.2 }}>
          <SideMenuOptions
            icon={<ConfigIcon width={24} height={24} />}
            text="Configurações"
            font="inter-bold"
            onPress={() => navigation.navigate('Config')}
          />
          <SideMenuOptions
            icon={<OutIcon width={24} height={24} />}
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
