/* eslint-disable global-require */
import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import Toast from 'react-native-toast-message';
import NotificationButton from '../../components/NotificationButton/NotificationButton';
import api from '../../services/api';
import useFetch from '../../hooks/useFetch';
import ErrorState from '../../components/ErrorState/ErrorState';
import { useAuth } from '../../context/auth/useAuth';
import ScreenWithHeader from '../../components/ScreenWithHeader/ScreenWithHeader';

export default function ConfigNotification() {
  const { loggedId } = useAuth();
  const [settings, setSettings] = useState({
    disablePopup: false,
    muteSystem: false,
    muteGroups: false,
  });

  const settingsQuery = useFetch(
    () => api.get('notifications/notification-settings').then((response) => response.data),
    [loggedId],
    { enabled: !!loggedId },
  );

  useEffect(() => {
    if (settingsQuery.data) {
      setSettings(settingsQuery.data);
    }
  }, [settingsQuery.data]);

  const handleToggle = async (key: keyof typeof settings) => {
    const newSettings = { ...settings, [key]: !settings[key] };
    setSettings(newSettings);

    try {
      await api.patch('/notifications/notification-settings', newSettings);
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: 'Não foi possível salvar a configuração.',
      });
      setSettings(settings);
    }
  };

  return (
    <ScreenWithHeader headerProps={{ font: 'inter-bold', text: 'Notificações' }}>
      <View style={{ flex: 1, backgroundColor: '#f2f6fa', gap: 40 }}>
        {settingsQuery.loading && !settingsQuery.data ? (
          <ActivityIndicator
            testID="settings-loading"
            size="large"
            color="#EF4036"
            style={{ marginTop: 40 }}
          />
        ) : !!settingsQuery.error && !settingsQuery.data ? (
          <ErrorState
            inline
            text="Não foi possível carregar as configurações."
            onRetry={settingsQuery.refetch}
          />
        ) : (
          <>
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
          </>
        )}
      </View>
    </ScreenWithHeader>
  );
}
