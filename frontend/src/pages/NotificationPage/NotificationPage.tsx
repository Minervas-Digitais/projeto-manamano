/* eslint-disable no-alert */
/* eslint-disable global-require */
import React, { useEffect, useState } from 'react';
import { Image, View } from 'react-native';
import { NotificationPageContainer } from './NotificationPageStyle';
import {
  NotificationTextContainerWarning,
  NotificationTextGreyWarning,
  NotificationTextRed,
} from '../../components/NotificationCard/NotificationCardStyle';
import localStorage from '../../services/localStorage';
import MegaPhone from '../../assets/megaphone-icon.svg';
import ScreenWithHeader from '../../components/ScreenWithHeader/ScreenWithHeader';

export default function NotificationPage() {
  useEffect(() => {
    const content = localStorage.getString('body');
    if (content) {
      setBody(content);
    }
  }, []);

  const [body, setBody] = useState('Erro ao carregar o conteúdo');

  return (
    <ScreenWithHeader headerProps={{ font: 'inter-bold', text: 'Notificação' }}>
      <NotificationPageContainer>
        <View>
          <NotificationTextContainerWarning height="min-content" style={{}}>
            <MegaPhone />
            <NotificationTextRed font="inter-bold">Comunicado: </NotificationTextRed>
          </NotificationTextContainerWarning>
          <NotificationTextContainerWarning height={39}>
            <NotificationTextGreyWarning font="inter-semiBold">{body}</NotificationTextGreyWarning>
          </NotificationTextContainerWarning>
        </View>
      </NotificationPageContainer>
    </ScreenWithHeader>
  );
}
