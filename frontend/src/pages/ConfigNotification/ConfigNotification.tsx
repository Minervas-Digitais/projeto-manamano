import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, Alert } from 'react-native';
import HeaderCustom from '../../components/HeaderCustom/HeaderCustom';
import NotificationButton from '../../components/NotificationButton/NotificationButton';
import api from '../../services/api';
import { useFonts } from 'expo-font';
import { storage } from '../SignIn/SignIn';

export default function ConfigNotification() {
    const [fontsLoaded] = useFonts({
        'inter-bold': require('../../fonts/Inter-Bold.ttf'),
    });

    const [loggedIdState, setLoggedIdState] = useState('');
    const [accessTokenState, setAccessTokenState] = useState('');
    const [loading, setLoading] = useState(true);
    const [settings, setSettings] = useState({
        disablePopup: false,
        muteSystem: false,
        muteGroups: false,
    });
    const [userName, setUserName] = useState('');


    useEffect(() => {
        const accessToken = storage.getString('accessToken');
        const loggedId = storage.getString('loggedId');
        if (loggedId && accessToken) {
            setAccessTokenState(accessToken);
            setLoggedIdState(loggedId);
            api
                .get(`/user/${loggedId}`, {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                })
                .then((res) => setUserName(res.data.fullName));
        }
    }, []);

    useEffect(() => {
        if (!accessTokenState || !loggedIdState) return;
        console.log('Token:', accessTokenState);
        console.log('User ID:', loggedIdState);
        const fetchPostUser = async () => {
            try {
                const response = await api.get(`user/${loggedIdState}/notification-settings`, {
                    headers: {
                        Authorization: `Bearer ${accessTokenState}`,
                    },
                });

                setSettings(response.data);
                setLoading(false);
            } catch (error) {
                console.error('Erro ao carregar configurações', error);
                Alert.alert('Erro', 'Não foi possível carregar as configurações.');
                setLoading(false);
            }
        };
        fetchPostUser();
    }, [accessTokenState, loggedIdState]);

    const handleToggle = async (key: keyof typeof settings) => {
        const newSettings = { ...settings, [key]: !settings[key] };
        setSettings(newSettings);

        try {
            await api.patch(`/user/${loggedIdState}/notification-settings`, newSettings, {
                headers: { Authorization: `Bearer ${accessTokenState}` },
            });
        } catch (error) {
            Alert.alert('Erro', 'Não foi possível salvar a configuração.');
            setSettings(settings);
        }
    };

    if (!fontsLoaded || loading) {
        return <></>;
    }

    return (
        <View style={{ flex: 1, backgroundColor: '#f2f6fa', gap: 40, padding: 20 }}>
            <HeaderCustom font="inter-bold" text="Notificações" />
            <NotificationButton
                font="inter-bold"
                text="Desabilitar notificação pop-up"
                isActive={settings.disablePopup}
                onToggle={() => handleToggle('disablePopup')}
            />
            <NotificationButton
                font="inter-bold"
                text="Silenciar notificação do Sistema"
                isActive={settings.muteSystem}
                onToggle={() => handleToggle('muteSystem')}
            />
            <NotificationButton
                font="inter-bold"
                text="Silenciar notificação dos grupos"
                isActive={settings.muteGroups}
                onToggle={() => handleToggle('muteGroups')}
            />
        </View>
    );
}
