/* eslint-disable global-require */

import { useFonts } from 'expo-font';
import { View } from 'react-native';
import HeaderCustom from '../../components/HeaderCustom/HeaderCustom';
import NotificationButton from '../../components/NotificationButton/NotificationButton';

export default function ConfigNotification() {
  const [fontsLoaded] = useFonts({
    'inter-bold': require('../../fonts/Inter-Bold.ttf'),
  });
  if (!fontsLoaded) {
    return undefined;
  }
  return (
    <View style={{ flex: 1, backgroundColor: '#f2f6fa', gap: 40 }}>
      <HeaderCustom font="inter-bold" text="Notificações" />
      <NotificationButton font="inter-bold" text="Desabilitar notificação pop-up" />
      <NotificationButton font="inter-bold" text="Silenciar notificação do Sistema" />
      <NotificationButton font="inter-bold" text="Silenciar notificação dos grupos" />
    </View>
  );
}
