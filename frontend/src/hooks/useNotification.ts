import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { useEffect, useRef, useState } from 'react';
import { Subscription } from 'expo-media-library';

export function useNotifications() {
    const [expoPushToken, setExpoPushToken] = useState('');
    const notificationListener = useRef<Subscription | null>(null);
    const responseListener = useRef<Subscription | null>(null);

    useEffect(() => {
        registerForPushNotificationsAsync().then(token => {
            if (token) {
                setExpoPushToken(token);
            }
        });

        // Notificações recebidas
        notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
            console.log('Notificação recebida:', notification);
        });

        // Usuário toca na notificação
        responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
            console.log('Resposta à notificação:', response);
        });

        return () => {
            if (notificationListener.current)
                Notifications.removeNotificationSubscription(notificationListener.current);
            if (responseListener.current)
                Notifications.removeNotificationSubscription(responseListener.current);
        };
    }, []);

    return { expoPushToken };
}

async function registerForPushNotificationsAsync() {
    if (!Device.isDevice) {
        alert('Você precisa usar um dispositivo físico para receber notificações');
        return;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
    }

    if (finalStatus !== 'granted') {
        alert('Permissão para notificações não foi concedida');
        return;
    }

    const tokenData = await Notifications.getExpoPushTokenAsync();
    return tokenData.data;
}
