/* eslint-disable global-require */
import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { useFonts } from 'expo-font';
import Toast from 'react-native-toast-message';
import HeaderCustom from '../../components/HeaderCustom/HeaderCustom';
import NotificationButton from '../../components/NotificationButton/NotificationButton';
import api from '../../services/api';
import secureStorage from '../../services/secureStorage';

export default function ConfigNotification() {
  const [fontsLoaded] = useFonts({
    'inter-bold': require('../../fonts/Inter-Bold.ttf'),
  });

  const [accessTokenState, setAccessTokenState] = useState('');
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState({
    disablePopup: false,
    muteSystem: false,
    muteGroups: false,
  });

  useEffect(() => {
    const fetchData = async () => {
      const accessToken = await secureStorage.getItem('accessToken');
      if (accessToken) {
        setAccessTokenState(accessToken);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (!accessTokenState) return;
    const fetchPostUser = async () => {
      try {
        const response = await api.get('notifications/notification-settings', {
          headers: {
            Authorization: `Bearer ${accessTokenState}`,
          },
        });

        setSettings(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Erro ao carregar configurações', error);
        Toast.show({
          type: 'error',
          text1: 'Erro',
          text2: 'Não foi possível carregar as configurações.',
        });
        setLoading(false);
      }
    };
    fetchPostUser();
  }, [accessTokenState]);

  const handleToggle = async (key: keyof typeof settings) => {
    const newSettings = { ...settings, [key]: !settings[key] };
    setSettings(newSettings);

    try {
      await api.patch('/notifications/notification-settings', newSettings, {
        headers: { Authorization: `Bearer ${accessTokenState}` },
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: 'Não foi possível salvar a configuração.',
      });
      setSettings(settings);
    }
  };

  if (!fontsLoaded || loading) {
    return <></>;
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#f2f6fa', gap: 40 }}>
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
