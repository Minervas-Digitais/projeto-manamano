/* eslint-disable consistent-return */
/* eslint-disable array-callback-return */
/* eslint-disable global-require */
import React, { useEffect, useState } from 'react';
import { TouchableOpacity, View, ActivityIndicator, Text } from 'react-native';
import { useRoute } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import {
  GroupDataPage,
  GroupDataText,
  GroupDataScrollView,
  GroupDataContainerInfo,
  GroupDataScrollContent,
  GroupDataScrollContentInner,
  GroupDataLine,
  GroupDataButtonView,
} from './GroupDataStyle';
import ScreenWithHeader from '../../components/ScreenWithHeader/ScreenWithHeader';
import ButtonCustom from '../../components/ButtonCustom/ButtonCustom';
import GroupMembers from '../../components/GroupMembers/GroupMembers';
import api from '../../services/api';
import NotificationIcon from '../../assets/notification-icon.svg';
import EditIcon from '../../assets/edit-icon.svg';
import TrashCan from '../../assets/trash-can.svg';
import DeleteOneConfirmation from '../../components/DeleteOneConfirmation/DeleteOneConfirmation';
import { useAuth } from '../../context/auth/useAuth';

export default function GroupData({ navigation }: any) {
  const route = useRoute();
  const { loggedId } = useAuth();

  const { groupId } = route.params as { groupId: string };
  const duckPhoto = require('../../assets/duck.png');
  const [groupInfo, setGroupInfo] = useState<any>();
  const [groupParticipant, setGroupParticipant] = useState<any>([]);
  const [userRole, setUserRole] = useState<string>('MEMBER');
  const [loggedUserParticipantRole, setLoggedUserParticipantRole] = useState<string>('MEMBER');
  const [membersPage, setMembersPage] = useState(1);
  const [hasMoreMembers, setHasMoreMembers] = useState(true);
  const [loadingMoreMembers, setLoadingMoreMembers] = useState(false);
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
    const fetchData = async () => {
      if (groupId && loggedId) {
        api.get(`/group/${groupId}`).then((res) => {
          setGroupInfo(res.data);
        });
        api
          .get(`/user/${loggedId}`)
          .then((res) => {
            setUserRole(res.data.sysRole);
          })
          .catch((err) => {
            console.error('Erro ao buscar dados do usuário:', err);
          });

        api
          .get(`/participant/group/${groupId}/users`, { params: { page: 1, limit: 20 } })
          .then((res) => {
            const { data, meta } = res.data;
            setGroupParticipant(data);
            setHasMoreMembers(meta.page < meta.lastPage);
            setMembersPage(meta.page);
            const loggedUserParticipant = data.find(
              (participant: any) => participant.userId === loggedId,
            );
            if (loggedUserParticipant) {
              setLoggedUserParticipantRole(loggedUserParticipant.role);
            }
          });
      }
    };

    fetchData();
  }, [loggedId, groupId]);

  function handleRemoveParticipant() {
    api.delete(`/participant/group/${groupId}`).then(() => {
      navigation.navigate('Home');
    });
  }

  const handleDeleteParticipant = async (participantUserId: string) => {
    if (participantUserId !== loggedId) {
      Toast.show({
        type: 'error',
        text1: 'Ação indisponível',
        text2: 'O backend atual não possui rota para remover outros participantes.',
      });
      return;
    }

    try {
      await api.delete(`/participant/group/${groupId}`);

      // Recarregar participantes após remoção
      const response = await api.get(`/participant/group/${groupId}/users`, {
        params: { page: 1, limit: 20 },
      });
      const { data, meta } = response.data;
      setGroupParticipant(data);
      setHasMoreMembers(meta.page < meta.lastPage);
      setMembersPage(meta.page);
      setDeleteModal({ visible: false, participantId: '', participantName: '' });
    } catch (error) {
      console.error('Erro ao remover participante:', error);
    }
  };

  const handleLoadMoreMembers = async () => {
    if (loadingMoreMembers || !hasMoreMembers) return;
    setLoadingMoreMembers(true);
    try {
      const nextPage = membersPage + 1;
      const res = await api.get(`/participant/group/${groupId}/users`, {
        params: { page: nextPage, limit: 20 },
      });
      const { data, meta } = res.data;
      setGroupParticipant((prev: any[]) => [...prev, ...data]);
      setHasMoreMembers(meta.page < meta.lastPage);
      setMembersPage(meta.page);
    } catch (e) {
      console.error('Erro ao carregar mais membros:', e);
    } finally {
      setLoadingMoreMembers(false);
    }
  };

  const canRemoveParticipants = (): boolean =>
    userRole === 'ADMIN' ||
    loggedUserParticipantRole === 'ADMIN' ||
    loggedUserParticipantRole === 'MODERATOR' ||
    loggedUserParticipantRole === 'INSTRUCTOR';

  return (
    <ScreenWithHeader
      headerProps={{
        font: 'inter-bold',
        text: 'Dados do grupo',
        icon: <NotificationIcon />,
        onPress: () => navigation.navigate('Notification'),
      }}>
      <GroupDataPage>
        <GroupDataScrollView contentContainerStyle={{ paddingBottom: 20 }}>
          <GroupDataContainerInfo>
            <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
              <GroupDataText color="#EF4036" font="inter-bold" size="20px">
                {groupInfo?.name || 'Erro'}
              </GroupDataText>
              <TouchableOpacity
                testID="edit-group-button"
                onPress={() => navigation.navigate('EditGroup')}>
                <EditIcon />
              </TouchableOpacity>
            </View>
            <GroupDataText color="#160E47" font="inter-bold" size="18px">
              Descrição
            </GroupDataText>
            <GroupDataScrollContent>
              <GroupDataScrollContentInner>
                <GroupDataText color="#515151" font="inter-regular" size="13px">
                  {groupInfo?.description || 'Erro carregar os dados'}
                </GroupDataText>
              </GroupDataScrollContentInner>
            </GroupDataScrollContent>
          </GroupDataContainerInfo>
          <GroupDataLine />
          <GroupDataContainerInfo>
            <GroupDataText color="#160E47" font="inter-semiBold" size="18px">
              Membros
            </GroupDataText>
            <GroupDataScrollContent>
              <GroupDataScrollContentInner gap="20px">
                <GroupDataText color="#3F3D3D" font="inter-bold" size="14px">
                  Docentes
                </GroupDataText>
                {groupParticipant?.length > 0 ? (
                  groupParticipant?.map((item: any) => {
                    if (item.role === 'INSTRUCTOR') {
                      return (
                        <View
                          key={item.userId}
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
                    if (item.role === 'STUDENT' || item.role === 'MEMBER') {
                      return (
                        <View
                          key={item.userId}
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
                {hasMoreMembers && (
                  <TouchableOpacity
                    onPress={handleLoadMoreMembers}
                    disabled={loadingMoreMembers}
                    style={{
                      backgroundColor: '#EF4036',
                      padding: 12,
                      borderRadius: 8,
                      marginTop: 16,
                      alignItems: 'center',
                      opacity: loadingMoreMembers ? 0.6 : 1,
                    }}>
                    {loadingMoreMembers ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <Text style={{ color: '#fff', fontFamily: 'inter-bold' }}>Carregar mais</Text>
                    )}
                  </TouchableOpacity>
                )}
              </GroupDataScrollContentInner>
            </GroupDataScrollContent>
          </GroupDataContainerInfo>
        </GroupDataScrollView>
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
    </ScreenWithHeader>
  );
}
