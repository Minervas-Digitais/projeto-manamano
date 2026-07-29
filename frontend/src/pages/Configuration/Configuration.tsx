/* eslint-disable global-require */
import React from 'react';
import { View } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import SideMenuOptions from '../../components/SideMenuOptions/SideMenuOptions';
import IconLock from '../../assets/lock-licon.svg';
import IconNotification from '../../assets/notification-licon.svg';
import IconAbout from '../../assets/about-icon.svg';
import { RootStackParamList } from '../../navigation/types';
import ScreenWithHeader from '../../components/ScreenWithHeader/ScreenWithHeader';

export default function Config() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  return (
    <ScreenWithHeader headerProps={{ font: 'inter-bold', text: 'Configurações' }}>
      <View style={{ backgroundColor: '#F2F6FA', flex: 1 }}>
        <View style={{ gap: 25, backgroundColor: '#F2F6FA', paddingLeft: 25, paddingTop: 25 }}>
          <SideMenuOptions
            icon={<IconNotification width={20} height={20} />}
            text="Notificações"
            font="inter-bold"
            onPress={() => navigation.navigate('ConfigNotification')}
          />
          <SideMenuOptions
            icon={<IconAbout width={20} height={20} />}
            text="Sobre"
            font="inter-bold"
            onPress={() => navigation.navigate('About')}
          />
          <SideMenuOptions
            icon={<IconLock width={22} height={22} />}
            text="Mudar senha"
            font="inter-bold"
            onPress={() => navigation.navigate('ChangePassword')}
          />
        </View>
      </View>
    </ScreenWithHeader>
  );
}
