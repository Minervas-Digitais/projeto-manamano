/* eslint-disable global-require */
import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import Toast from 'react-native-toast-message';
import NotificationButton from '../../components/NotificationButton/NotificationButton';
import api from '../../services/api';
import { useAuth } from '../../context/auth/useAuth';
import ScreenWithHeader from '../../components/ScreenWithHeader/ScreenWithHeader';

export default function ConfigNotification() {
  const { accessToken } = useAuth();
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState({
    disablePopup: false,
    muteSystem: false,
    muteGroups: false,
  });

  useEffect(() => {
    if (!accessToken) return;
    const fetchPostUser = async () => {
      try {
        const response = await api.get('notifications/notification-settings', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
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
  }, [accessToken]);

  const handleToggle = async (key: keyof typeof settings) => {
    const newSettings = { ...settings, [key]: !settings[key] };
    setSettings(newSettings);

    try {
      await api.patch('/notifications/notification-settings', newSettings, {
        headers: { Authorization: `Bearer ${accessToken}` },
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

  if (loading) {
    return <></>;
  }

  return (
    <ScreenWithHeader headerProps={{ font: 'inter-bold', text: 'Notificações' }}>
      <View style={{ flex: 1, backgroundColor: '#f2f6fa', gap: 40 }}>
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
    </ScreenWithHeader>
  );
}
