/* eslint-disable global-require */
import React, { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import {
  ConfigNotificationContainer,
  NotificationInfoContainer,
  NotificationScrollContainer,
  NotificationInfoText,
  NotificationBodyContainer,
} from './NotificationStyle';
import ButtonCustom from '../../components/ButtonCustom/ButtonCustom';
import NotificationCard from '../../components/NotificationCard/NotificationCard';
import secureStorage from '../../services/secureStorage';
import api from '../../services/api';
import ModalOptionsNotification from '../../components/ModalOptionsNotification/ModalOptionsNotification';
import DotsMenuIcon from '../../assets/dots-menu-big.svg';
import DeleteConfirmation from '../../components/DeleteAllConfirmation/DeleteAllConfirmation';
import DeleteOneConfirmation from '../../components/DeleteOneConfirmation/DeleteOneConfirmation';
import NoNotification from '../../assets/no-notification-icon.svg';
import ScreenWithHeader from '../../components/ScreenWithHeader/ScreenWithHeader';
import { useAuth } from '../../context/auth/useAuth';

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
  savedPost?: string[];
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
  const [notification, setNotification] = useState<INotification[]>([]);
  const [display, setDisplay] = useState(false);
  const [userInfo, setUserInfo] = useState<IUser | null>(null);
  const [admin, setAdmin] = useState(false);
  const [deleteModal, setDeleteModal] = useState({
    visible: false,
    notifId: '',
  });

  const fetchNotifications = useCallback(async () => {
    if (!loggedId) return;
    api
      .get('/notifications/user')
      .then((res) => setNotification(res.data))
      .catch((err) => console.log(err));
  }, [loggedId]);

  useEffect(() => {
    const fetchUserInfo = async () => {
      if (loggedId) {
        try {
          const response = await api.get(`/user/${loggedId}`);

          const userData: IUser = response.data;
          setUserInfo(userData);

          if (userData.sysRole === 'ADMIN') {
            setAdmin(true);
          } else {
            setAdmin(false);
          }
        } catch (error) {
          console.error('Erro ao buscar informações do usuário:', error);
        }
      }
    };

    fetchUserInfo();
  }, [loggedId]);
  useEffect(() => {
    // fetchNotifications();
    const interval = setInterval(fetchNotifications, 1000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  useFocusEffect(
    useCallback(() => {
      fetchNotifications();
      secureStorage.removeItem('body').catch(console.error);
      secureStorage.removeItem('displayNotif').catch(console.error);
    }, [fetchNotifications]),
  );

  const onPressActions = (body: string, id: string, type: string, idContent?: string) => {
    secureStorage.setItem('body', body).catch(console.error);
    setNotification((prev) =>
      prev?.map((notif) => (notif.id === id ? { ...notif, isRead: true } : notif)),
    );
    api
      .patch(`/notifications/${id}`, {})
      // .then((res) => console.log(JSON.stringify(res.data)))
      .catch((err) => console.log('Erro ao atualizar a notificação:', err));

    if (type === 'WARNING') {
      navigation.navigate('NotificationPage');
    }
    if (type !== 'WARNING') {
      console.log(idContent);
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
      setNotification((prev) => prev.filter((n: any) => n.id !== deleteModal.notifId));
      Alert.alert('Sucesso', 'Notificação excluída com sucesso!');
    } catch (error: any) {
      Alert.alert(
        'Erro',
        error?.response?.data?.message || 'Não foi possível excluir a notificação.',
      );
      console.error('Erro ao excluir notificação:', error);
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
          <NotificationScrollContainer>
            {notification && notification.length > 0 ? (
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

            <ButtonCustom
              onPress={() => {
                navigation.navigate('Home');
              }}
              backColor="#EF4036"
              fontColor="#ffff"
              text="Retornar para a tela inicial"
              border={false}
            />
          </NotificationScrollContainer>
        </NotificationBodyContainer>
      </ConfigNotificationContainer>
    </ScreenWithHeader>
  );
}
