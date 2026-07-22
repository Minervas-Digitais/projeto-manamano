/* eslint-disable global-require */
import React, { useState, useCallback } from 'react';
import { Image } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import {
  SideMenuOptionsButtonsContainer,
  SideMenuOptionsButtonsText,
} from './SideMenuOptionsStyle';
import { useAuth } from '../../context/auth/useAuth';
import api from '../../services/api';

interface Notification {
  id: string;
  isRead: boolean;
}

interface SideMenuOptionsProps {
  icon: any;
  icon2?: any;
  type?: string;
  font: string;
  text: string;
  color?: string;
  onPress?: () => void;
}

export default function SideMenuOptions({
  icon,
  icon2,
  type,
  font,
  text,
  color,
  onPress,
}: SideMenuOptionsProps) {
  const [hasUnread, setHasUnread] = useState(false);
  const { accessToken, loggedId } = useAuth();

  const loadNotifications = useCallback(async () => {
    if (type !== 'notification') return;

    if (!loggedId || !accessToken) return;

    try {
      const res = await api.get<Notification[]>('notifications/user/', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const hasUnreadNotifications = res.data.some((n) => !n.isRead);
      setHasUnread(hasUnreadNotifications);
    } catch (err) {
      console.error('Erro ao carregar notificações', err);
    }
  }, [type]);

  useFocusEffect(
    useCallback(() => {
      loadNotifications();
    }, [loadNotifications]),
  );

  const chosenIcon = hasUnread ? icon2 : icon;

  return (
    <SideMenuOptionsButtonsContainer onPress={onPress}>
      {chosenIcon}
      <SideMenuOptionsButtonsText font={font} color={color}>
        {text}
      </SideMenuOptionsButtonsText>
    </SideMenuOptionsButtonsContainer>
  );
}
