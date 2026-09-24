import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Toast from 'react-native-toast-message';
import { useEffect, useRef } from 'react';
import { Subscription } from 'expo-media-library';
import { Alert } from 'react-native';

export function useNotifications() {
  const notificationListener = useRef<Subscription | null>(null);
  const responseListener = useRef<Subscription | null>(null);

  useEffect(() => {
    notificationListener.current = Notifications.addNotificationReceivedListener(() => {});

    responseListener.current = Notifications.addNotificationResponseReceivedListener(() => {});
    return () => {
      if (notificationListener.current)
        Notifications.removeNotificationSubscription(notificationListener.current);
      if (responseListener.current)
        Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  return {};
}

export async function registerForPushNotificationsAsync() {
  if (!Device.isDevice) {
    Toast.show({
      type: 'warning',
      text1: 'Erro ao receber notificações',
      text2: 'Você precisa usar um dispositivo físico para receber notificações.',
    });
    return null;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    Toast.show({
      type: 'warning',
      text1: 'Erro de permissão',
      text2: 'Permissão não concedida para notificações.',
    });
    return null;
  }

  const tokenData = await Notifications.getExpoPushTokenAsync();
  return tokenData.data;
}
