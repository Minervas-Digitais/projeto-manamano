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
import useFetch from '../../hooks/useFetch';
import ErrorState from '../../components/ErrorState/ErrorState';
import LoadingState from '../../components/LoadingState/LoadingState';
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
  const [extraMembers, setExtraMembers] = useState<any[]>([]);
  const [membersPage, setMembersPage] = useState(1);
  const [hasMoreMembers, setHasMoreMembers] = useState(false);
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

  const groupQuery = useFetch(
    () => api.get(`/group/${groupId}`).then((res) => res.data),
    [loggedId, groupId],
    { enabled: !!groupId && !!loggedId },
  );
  const groupInfo = groupQuery.data;

  const userRoleQuery = useFetch(
    () => api.get(`/user/${loggedId}`).then((res) => res.data),
    [loggedId],
    {
      enabled: !!loggedId,
      onError: (_error, { hadData }) => {
        // Sem dados não avisa: o ErrorState da tela já cobre a falha
        if (hadData) {
          Toast.show({
            type: 'error',
            text1: 'Erro',
            text2: 'Erro ao atualizar os dados do usuário.',
          });
        }
      },
    },
  );
  const userRole = userRoleQuery.data?.sysRole ?? 'MEMBER';

  const membersQuery = useFetch(
    () =>
      api
        .get(`/participant/group/${groupId}/users`, { params: { page: 1, limit: 20 } })
        .then((res) => res.data),
    [loggedId, groupId],
    { enabled: !!groupId && !!loggedId },
  );

  // Recarga no focus volta com a página 1
  useEffect(() => {
    setExtraMembers([]);
    const meta = membersQuery.data?.meta;
    setMembersPage(meta?.page ?? 1);
    setHasMoreMembers((meta?.page ?? 1) < (meta?.lastPage ?? 1));
  }, [membersQuery.data]);

  const groupParticipant = [...(membersQuery.data?.data ?? []), ...extraMembers];
  const loggedUserParticipantRole =
    groupParticipant.find((participant: any) => participant.userId === loggedId)?.role ?? 'MEMBER';

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
        text2:
          'Você só pode sair do grupo você mesmo. Peça a um administrador para remover outro participante.',
      });
      return;
    }

    try {
      await api.delete(`/participant/group/${groupId}`);

      membersQuery.refetch();
      setDeleteModal({ visible: false, participantId: '', participantName: '' });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: 'Não foi possível remover o participante. Tente novamente mais tarde.',
      });
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
      setExtraMembers((prev: any[]) => [...prev, ...(Array.isArray(data) ? data : [])]);
      setHasMoreMembers(meta.page < meta.lastPage);
      setMembersPage(meta.page);
    } catch (e) {
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: 'Não foi possível carregar mais membros. Tente novamente mais tarde.',
      });
    } finally {
      setLoadingMoreMembers(false);
    }
  };

  const canRemoveParticipants = (): boolean =>
    userRole === 'ADMIN' ||
    loggedUserParticipantRole === 'ADMIN' ||
    loggedUserParticipantRole === 'MODERATOR' ||
    loggedUserParticipantRole === 'INSTRUCTOR';

  if (!!groupQuery.error && !groupInfo) {
    return (
      <ScreenWithHeader
        headerProps={{
          font: 'inter-bold',
          text: 'Dados do grupo',
          icon: <NotificationIcon />,
          onPress: () => navigation.navigate('Notification'),
        }}>
        <ErrorState
          text="Não foi possível carregar os dados do grupo."
          onRetry={groupQuery.refetch}
        />
      </ScreenWithHeader>
    );
  }

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
                {membersQuery.loading && !groupParticipant.length ? (
                  <LoadingState inline />
                ) : !!membersQuery.error && !groupParticipant.length ? (
                  <ErrorState
                    inline
                    text="Não foi possível carregar os membros."
                    onRetry={membersQuery.refetch}
                  />
                ) : groupParticipant?.length > 0 ? (
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
                {membersQuery.loading && !groupParticipant.length ? (
                  <LoadingState inline />
                ) : !!membersQuery.error && !groupParticipant.length ? (
                  <ErrorState
                    inline
                    text="Não foi possível carregar os membros."
                    onRetry={membersQuery.refetch}
                  />
                ) : groupParticipant?.length > 0 ? (
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
