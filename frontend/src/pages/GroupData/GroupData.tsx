/* eslint-disable consistent-return */
/* eslint-disable array-callback-return */
/* eslint-disable global-require */
import React, { useEffect, useState } from 'react';
import { useFonts } from 'expo-font';
import { TouchableOpacity, View, Dimensions } from 'react-native';
import { useRoute } from '@react-navigation/native';
import {
  GroupDataPage,
  GroupDataText,
  GroupDataScrollView,
  GroupDataContainerInfo,
  GroupDataScrollContent,
  GroupDataLine,
  GroupDataButtonView,
} from './GroupDataStyle';
import HeaderCustom from '../../components/HeaderCustom/HeaderCustom';
import ButtonCustom from '../../components/ButtonCustom/ButtonCustom';
import GroupMembers from '../../components/GroupMembers/GroupMembers';
import { storage } from '../SignIn/SignIn';
import api from '../../services/api';
import NotificationIcon from '../../assets/notification-icon.svg';
import EditIcon from '../../assets/edit-icon.svg';
import TrashCan from '../../assets/trash-can.svg';
import DeleteOneConfirmation from '../../components/DeleteOneConfirmation/DeleteOneConfirmation';

export default function GroupData({ navigation }: any) {
  const route = useRoute();
  const { height: screenHeight } = Dimensions.get('window');

  const { groupId } = route.params as { groupId: string };
  const duckPhoto = require('../../assets/duck.png');
  const [groupInfo, setGroupInfo] = useState<any>();
  const [groupParticipant, setGroupParticipant] = useState<any>();
  const [loggedIdState, setLoggedIdState] = useState('');
  const [accessTokenState, setAccessTokenState] = useState('');
  const [userRole, setUserRole] = useState<string>('MEMBER');
  const [loggedUserParticipantRole, setLoggedUserParticipantRole] = useState<string>('MEMBER');
  const [deleteModal, setDeleteModal] = useState({
    visible: false,
    participantId: '',
    participantName: '',
  });
  const [leaveGroupModal, setLeaveGroupModal] = useState(false);
  const [selectedParticipant, setSelectedParticipant] = useState<any>(null);
  const setDeleteModalVisible = (visible: boolean) => {
    if (visible && selectedParticipant) {
      setDeleteModal({
        visible,
        participantId: selectedParticipant.userId,
        participantName: selectedParticipant.user.fullName,
      });
    } else {
      setDeleteModal({
        visible,
        participantId: '',
        participantName: '',
      });
    }
  };

  useEffect(() => {
    const accessToken = storage.getString('accessToken');
    const loggedId = storage.getString('loggedId');

    if (groupId && accessToken && loggedId) {
      setLoggedIdState(loggedId);
      setAccessTokenState(accessToken);

      api
        .get(`/group/${groupId}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        })
        .then((res) => {
          setGroupInfo(res.data);
        });

      api
        .get(`/user/${loggedId}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        })
        .then((res) => {
          setUserRole(res.data.sysRole);
        })
        .catch((err) => {
          console.error('Erro ao buscar dados do usuário:', err);
        });

      api
        .get(`/participant/group/${groupId}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        })
        .then((res) => {
          setGroupParticipant(res.data);
          const loggedUserParticipant = res.data.find(
            (participant: any) => participant.user.id === loggedId,
          );
          if (loggedUserParticipant) {
            setLoggedUserParticipantRole(loggedUserParticipant.role);
          }
        });
    }
  }, []);

  const [fontsLoaded] = useFonts({
    'inter-bold': require('../../fonts/Inter-Bold.ttf'),
    'inter-semiBold': require('../../fonts/Inter-SemiBold.ttf'),
    'inter-regular': require('../../fonts/Inter-Regular.ttf'),
  });
  if (!fontsLoaded) {
    return undefined;
  }

  function handleRemoveParticipant() {
    api
      .delete(`/participant/${loggedIdState},${groupId}`, {
        headers: {
          Authorization: `Bearer ${accessTokenState}`,
        },
      })
      .then((res) => {
        navigation.navigate('Home');
      });
  }

  const handleDeleteParticipant = async (participantUserId: string) => {
    try {
      await api.delete(`/participant/${participantUserId},${groupId}`, {
        headers: {
          Authorization: `Bearer ${accessTokenState}`,
        },
      });

      // Recarregar participantes após remoção
      const response = await api.get(`/participant/group/${groupId}`, {
        headers: {
          Authorization: `Bearer ${accessTokenState}`,
        },
      });
      setGroupParticipant(response.data);
      setDeleteModal({ visible: false, participantId: '', participantName: '' });
    } catch (error) {
      console.error('Erro ao remover participante:', error);
    }
  };

  const canRemoveParticipants = (): boolean =>
    userRole === 'ADMIN' ||
    loggedUserParticipantRole === 'ADMIN' ||
    loggedUserParticipantRole === 'MODERATOR';

  return (
    <GroupDataPage>
      <HeaderCustom
        font="inter-bold"
        text="Dados do grupo"
        icon={<NotificationIcon />}
        onPress={() => navigation.navigate('Notification')}
      />
      <GroupDataScrollView contentContainerStyle={{ paddingBottom: 20 }}>
        <GroupDataContainerInfo>
          <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
            <GroupDataText color="#EF4036" font="inter-bold" size="20px">
              {groupInfo?.name || 'Erro'}
            </GroupDataText>
            <TouchableOpacity onPress={() => navigation.navigate('EditGroup')}>
              <EditIcon />
            </TouchableOpacity>
          </View>
          <GroupDataText color="#160E47" font="inter-bold" size="18px">
            Descrição
          </GroupDataText>
          <GroupDataScrollContent size={`${screenHeight * 0.12}px`}>
            <GroupDataText color="#515151" font="inter-regular" size="13px">
              {groupInfo?.description || 'Erro carregar os dados'}
            </GroupDataText>
          </GroupDataScrollContent>
        </GroupDataContainerInfo>
        <GroupDataLine />
        <GroupDataContainerInfo>
          <GroupDataText color="#160E47" font="inter-semiBold" size="18px">
            Membros
          </GroupDataText>
          <GroupDataScrollContent gap="20px" size={`${screenHeight * 0.4}px`}>
            <GroupDataText color="#3F3D3D" font="inter-bold" size="14px">
              Docentes
            </GroupDataText>
            {groupParticipant?.length > 0 ? (
              groupParticipant?.map((item: any) => {
                if (item.role !== 'MEMBER') {
                  return (
                    <View
                      key={item.user.id}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}>
                      <TouchableOpacity
                        onPress={() => {
                          navigation.navigate('VisitorProfile', { id: item.userId });
                        }}
                        style={{ flex: 1 }}>
                        <GroupMembers user={item.user.fullName} image={duckPhoto} />
                      </TouchableOpacity>
                      {canRemoveParticipants() && (
                        <TouchableOpacity
                          onPress={() => {
                            setSelectedParticipant(item);
                            setDeleteModalVisible(true);
                          }}
                          style={{ marginLeft: 10, padding: 10 }}>
                          <TrashCan />
                        </TouchableOpacity>
                      )}
                    </View>
                  );
                }
                return null;
              })
            ) : (
              <GroupDataText color="#515151" font="inter-regular" size="12px">
                Vazio...
              </GroupDataText>
            )}
            <GroupDataText color="#3F3D3D" font="inter-bold" size="14px">
              Colegas
            </GroupDataText>
            {groupParticipant?.length > 0 ? (
              groupParticipant?.map((item: any) => {
                if (item.role === 'MEMBER') {
                  return (
                    <View
                      key={item.user.id}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}>
                      <TouchableOpacity
                        onPress={() => {
                          navigation.navigate('VisitorProfile', { id: item.userId });
                        }}
                        style={{ flex: 1 }}>
                        <GroupMembers user={item.user.fullName} image={duckPhoto} />
                      </TouchableOpacity>
                      {canRemoveParticipants() && (
                        <TouchableOpacity
                          onPress={() => {
                            setSelectedParticipant(item);
                            setDeleteModalVisible(true);
                          }}
                          style={{ marginLeft: 10, padding: 10 }}>
                          <TrashCan />
                        </TouchableOpacity>
                      )}
                    </View>
                  );
                }
                return null;
              })
            ) : (
              <GroupDataText color="#515151" font="inter-regular" size="12">
                Vazio...
              </GroupDataText>
            )}
          </GroupDataScrollContent>
        </GroupDataContainerInfo>
        <GroupDataButtonView>
          <ButtonCustom
            backColor="#EF4036"
            fontColor="#FFFFFF"
            onPress={() => {
              setLeaveGroupModal(true);
            }}
            border={false}
            text="Sair do Grupo"
          />
        </GroupDataButtonView>
      </GroupDataScrollView>
      <DeleteOneConfirmation
        visible={deleteModal.visible}
        text={`Tem certeza que deseja remover ${deleteModal.participantName} do grupo?`}
        onConfirm={() => {
          handleDeleteParticipant(deleteModal.participantId);
          setDeleteModal({ visible: false, participantId: '', participantName: '' });
        }}
        onCancel={() => {
          setDeleteModal({ visible: false, participantId: '', participantName: '' });
        }}
      />
      <DeleteOneConfirmation
        visible={leaveGroupModal}
        text="Tem certeza que deseja sair do grupo?"
        onConfirm={() => {
          handleRemoveParticipant();
          setLeaveGroupModal(false);
        }}
        onCancel={() => {
          setLeaveGroupModal(false);
        }}
      />
    </GroupDataPage>
  );
}
