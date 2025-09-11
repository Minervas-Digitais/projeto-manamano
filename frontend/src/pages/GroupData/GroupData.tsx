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
  GroupDataContainer,
  GroupDataContainerInfo,
  GroupDataScrollView,
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

export default function GroupData({ navigation }: any) {
  const route = useRoute();
  const { height: screenHeight } = Dimensions.get('window');

  const { groupId } = route.params as { groupId: string };
  const duckPhoto = require('../../assets/duck.png');
  const [groupInfo, setGroupInfo] = useState<any>();
  const [groupParticipant, setGroupParticipant] = useState<any>();
  const [loggedIdState, setLoggedIdState] = useState('');
  const [accessTokenState, setAccessTokenState] = useState('');

  useEffect(() => {
    const accessToken = storage.getString('accessToken');
    // const groupId = storage.getString('groupId');
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
        .get(`/participant/group/${groupId}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        })
        .then((res) => {
          setGroupParticipant(res.data);
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
    // const groupId = storage.getString('groupId');
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
  return (
    <GroupDataPage>
      <HeaderCustom
        font="inter-bold"
        text="Dados do grupo"
        icon={<NotificationIcon />}
        onPress={() => navigation.navigate('Notification')}
      />
      <GroupDataContainer>
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
          <GroupDataScrollView size={`${screenHeight * 0.12}px`}>
            <GroupDataText color="#515151" font="inter-regular" size="13px">
              {groupInfo?.description || 'Erro carregar os dados'}
            </GroupDataText>
          </GroupDataScrollView>
        </GroupDataContainerInfo>
        <GroupDataLine />
        <GroupDataContainerInfo>
          <GroupDataText color="#160E47" font="inter-semiBold" size="18px">
            Membros
          </GroupDataText>
          <GroupDataScrollView gap="20px" size={`${screenHeight * 0.4}px`}>
            <GroupDataText color="#3F3D3D" font="inter-bold" size="14px">
              Docentes
            </GroupDataText>
            {groupParticipant?.length > 0 ? (
              groupParticipant?.map((item: any) => {
                if (item.role !== 'MEMBER') {
                  return <GroupMembers user={item.user.fullName} image={duckPhoto} />;
                }
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
                  return <GroupMembers user={item.user.fullName} image={duckPhoto} />;
                }
              })
            ) : (
              <GroupDataText color="#515151" font="inter-regular" size="12">
                Vazio...
              </GroupDataText>
            )}
          </GroupDataScrollView>
        </GroupDataContainerInfo>
        <GroupDataButtonView>
          <ButtonCustom
            backColor="#EF4036"
            fontColor="#FFFFFF"
            onPress={() => {
              handleRemoveParticipant();
            }}
            border={false}
            text="Sair do Grupo"
          />
        </GroupDataButtonView>
      </GroupDataContainer>
    </GroupDataPage>
  );
}
