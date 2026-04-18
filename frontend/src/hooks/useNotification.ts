import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { useEffect, useRef } from 'react';
import { Subscription } from 'expo-media-library';
import { Alert } from 'react-native';

export function useNotifications() {
  const notificationListener = useRef<Subscription | null>(null);
  const responseListener = useRef<Subscription | null>(null);

  useEffect(() => {
    notificationListener.current = Notifications.addNotificationReceivedListener((notification) => {
      console.log('Notificação recebida:', notification);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
      console.log('Resposta à notificação:', response);
    });

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
    Alert.alert('Você precisa usar um dispositivo físico para receber notificações');
    return null;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    Alert.alert('Permissão para notificações não foi concedida');
    return null;
  }

  const tokenData = await Notifications.getExpoPushTokenAsync();
  return tokenData.data;
}
