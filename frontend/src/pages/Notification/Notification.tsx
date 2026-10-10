/* eslint-disable global-require */
import React, { useState, useCallback } from 'react';
import { RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import {
  ConfigNotificationContainer,
  NotificationInfoContainer,
  NotificationScrollContainer,
  NotificationInfoText,
  NotificationBodyContainer,
} from './NotificationStyle';
import NotificationCard from '../../components/NotificationCard/NotificationCard';
import secureStorage from '../../services/secureStorage';
import api from '../../services/api';
import ModalOptionsNotification from '../../components/ModalOptionsNotification/ModalOptionsNotification';
import DotsMenuIcon from '../../assets/dots-menu-big.svg';
import DeleteOneConfirmation from '../../components/DeleteOneConfirmation/DeleteOneConfirmation';
import NoNotification from '../../assets/no-notification-icon.svg';
import ScreenWithHeader from '../../components/ScreenWithHeader/ScreenWithHeader';
import { useAuth } from '../../context/auth/useAuth';
import useFetch from '../../hooks/useFetch';
import LoadingState from '../../components/LoadingState/LoadingState';
import ErrorState from '../../components/ErrorState/ErrorState';
import StaleDataBanner from '../../components/StaleDataBanner/StaleDataBanner';

export interface IUser {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  birthday?: string;
  ethnicity?: string;
  neighborhood?: string;
  expertise?: string;
  enterprise?: string;
  bio?: string;
  createdAt: string;
  updatedAt: string;
  sysRole: 'ADMIN' | 'USER' | string;
}

export interface INotification {
  id: string;
  senderName: string;
  groupName: string;
  body: string;
  type: 'COMMENT' | 'WARNING' | 'FIXED' | string;
  idContent: string | null;
  isRead: boolean;
  createdAt: string;
}

export default function Notification({ navigation }: any) {
  const duckPhoto = require('../../assets/duck.png');
  const { loggedId } = useAuth();
  const [display, setDisplay] = useState(false);
  const [deleteModal, setDeleteModal] = useState({
    visible: false,
    notifId: '',
  });

  const notificationQuery = useFetch<INotification[]>(
    async () => {
      const res = await api.get('/notifications/user');
      return Array.isArray(res.data) ? res.data : [];
    },
    [loggedId],
    {
      enabled: !!loggedId,
    },
  );

  const userQuery = useFetch<IUser>(
    async () => (await api.get(`/user/${loggedId}`)).data,
    [loggedId],
    // Falha aqui só afeta o título/admin; o erro principal da tela é o das notificações
    { enabled: !!loggedId },
  );

  const notification = notificationQuery.data ?? [];
  const admin = userQuery.data?.sysRole === 'ADMIN';

  useFocusEffect(
    useCallback(() => {
      secureStorage.removeItem('body').catch(() => {});
      secureStorage.removeItem('displayNotif').catch(() => {});
    }, []),
  );

  const onPressActions = (body: string, id: string, type: string, idContent?: string) => {
    secureStorage.setItem('body', body).catch(() => {});
    notificationQuery.mutate((prev) =>
      (prev ?? []).map((notif) => (notif.id === id ? { ...notif, isRead: true } : notif)),
    );
    api.patch(`/notifications/${id}`, {}).catch(() => {});

    if (type === 'WARNING') {
      navigation.navigate('NotificationPage');
    }
    if (type !== 'WARNING') {
      navigation.navigate('Post', { postId: idContent });
    }
  };

  // Function to handle delete icon/button press
  const handleDeletePress = (notifId: string) => {
    setDeleteModal({ visible: true, notifId });
  };

  // Function to confirm deletion
  const handleConfirmDelete = async () => {
    try {
      await api.delete(`/notifications/${deleteModal.notifId}`);
      notificationQuery.mutate((prev) =>
        (prev ?? []).filter((n: any) => n.id !== deleteModal.notifId),
      );
      Toast.show({
        type: 'success',
        text1: 'Notificação excluída',
        text2: 'A notificação foi excluída com sucesso.',
      });
    } catch (error: any) {
      Toast.show({
        type: 'warning',
        text1: 'Erro ao excluir notificação',
        text2: error?.response?.data?.message || 'Não foi possível excluir a notificação.',
      });
    }
    setDeleteModal({ visible: false, notifId: '' });
  };

  // Function to cancel deletion
  const handleCancelDelete = () => {
    setDeleteModal({ visible: false, notifId: '' });
  };

  return (
    <ScreenWithHeader
      headerProps={{
        icon: <DotsMenuIcon />,
        text: admin ? 'Comunicados' : 'Notificação',
        font: 'inter-bold',
        onPress: () => setDisplay(!display),
      }}>
      <DeleteOneConfirmation
        visible={deleteModal.visible}
        text="Tem certeza que deseja excluir a notificação?"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />

      <ConfigNotificationContainer>
        <ModalOptionsNotification
          display={display}
          type="header"
          style={{ top: 8, right: 25, zIndex: 11 }}
          height="80px"
          admin={admin}
        />
        <NotificationBodyContainer>
          <NotificationScrollContainer
            refreshControl={
              <RefreshControl
                refreshing={notificationQuery.refreshing}
                onRefresh={() => notificationQuery.refresh()}
                colors={['#EF4036']}
                tintColor="#EF4036"
              />
            }>
            {notificationQuery.stale && (
              <StaleDataBanner
                refreshing={notificationQuery.refreshing}
                onRefresh={() => notificationQuery.refresh()}
                style={{ alignSelf: 'stretch', marginTop: 10, marginBottom: 0 }}
              />
            )}
            {notificationQuery.loading ? (
              <LoadingState text="Carregando notificações..." />
            ) : !!notificationQuery.error && notificationQuery.data === undefined ? (
              <ErrorState
                inline
                text="Não foi possível carregar suas notificações."
                onRetry={notificationQuery.refetch}
              />
            ) : notification.length > 0 ? (
              notification.map((item: any) => (
                <NotificationCard
                  key={item.id}
                  user={item.senderName}
                  group={item.groupName}
                  image={duckPhoto}
                  onPress={() => onPressActions(item.body, item.id, item.type, item.idContent)}
                  type={item.type}
                  body={item.body}
                  date={item.createdAt}
                  isread={item.isRead}
                  idNotif={item.id}
                  confirm={false}
                  admin={admin}
                  onDelete={admin ? () => handleDeletePress(item.id) : undefined}
                />
              ))
            ) : (
              <>
                <NoNotification />
                <NotificationInfoContainer>
                  <NotificationInfoText font="inter-bold">
                    Você não possui notificações no momento
                  </NotificationInfoText>
                </NotificationInfoContainer>
              </>
            )}
          </NotificationScrollContainer>
        </NotificationBodyContainer>
      </ConfigNotificationContainer>
    </ScreenWithHeader>
  );
}
