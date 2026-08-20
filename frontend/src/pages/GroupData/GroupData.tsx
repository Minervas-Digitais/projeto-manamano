/* eslint-disable consistent-return */
/* eslint-disable array-callback-return */
/* eslint-disable global-require */
import React, { useEffect, useState } from 'react';
import { TouchableOpacity, View, Dimensions } from 'react-native';
import { useRoute } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import {
  GroupDataPage,
  GroupDataText,
  GroupDataScrollView,
  GroupDataContainerInfo,
  GroupDataScrollContent,
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
  const { height: screenHeight } = Dimensions.get('window');

  const { groupId } = route.params as { groupId: string };
  const duckPhoto = require('../../assets/duck.png');
  const [groupInfo, setGroupInfo] = useState<any>();
  const [groupParticipant, setGroupParticipant] = useState<any>();
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

        api.get(`/participant/group/${groupId}`).then((res) => {
          setGroupParticipant(res.data);
          const loggedUserParticipant = res.data.find(
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
      const response = await api.get(`/participant/group/${groupId}`);
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
                  if (item.role === 'MEMBER') {
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
    </ScreenWithHeader>
  );
}
