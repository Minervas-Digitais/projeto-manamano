/* eslint-disable global-require */
import React from 'react';
import { useFonts } from 'expo-font';
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

export default function GroupData({ navigation }: any) {
  const notificationIcon = require('../../assets/notification-icon.svg');
  const duckPhoto = require('../../assets/duck.png');
  const groupName = 'Turma 24.1';
  const [fontsLoaded] = useFonts({
    'inter-bold': require('../../fonts/Inter-Bold.ttf'),
    'inter-semiBold': require('../../fonts/Inter-SemiBold.ttf'),
    'inter-regular': require('../../fonts/Inter-Regular.ttf'),
  });
  if (!fontsLoaded) {
    return undefined;
  }

  const fakeMembers: any = [
    { user: 'Maria Joana', image: duckPhoto },
    { user: 'Maria Joana', image: duckPhoto },
    { user: 'Maria Joana', image: duckPhoto },
    { user: 'Maria Joana', image: duckPhoto },
    { user: 'Maria Joana', image: duckPhoto },
    { user: 'Maria Joana', image: duckPhoto },
  ];
  return (
    <GroupDataPage>
      <HeaderCustom
        font="inter-bold"
        text="Dados do grupo"
        icon={notificationIcon}
        onPress={() => navigation.navigate('Notification')}
      />
      <GroupDataContainer>
        <GroupDataContainerInfo>
          <GroupDataText color="#EF4036" font="inter-bold" size="20">
            {groupName}
          </GroupDataText>
          <GroupDataText color="#160E47" font="inter-semiBold" size="18">
            Descrição
          </GroupDataText>
          <GroupDataScrollView size="12vh">
            <GroupDataText color="#515151" font="inter-regular" size="13">
              Grupo dos membros do ManaMano do ano de 2024.1. Classroom: XYEYEHN Drive: link aqui
              Reuniões toda quarta às 18:00 Google meet: link aqui Grupo dos membros do ManaMano do
              ano de 2024.1. Classroom: XYEYEHN Drive: link aqui Reuniões toda quarta às 18:00
              Google meet: link aquiGrupo dos membros do ManaMano do ano de 2024.1. Classroom:
              XYEYEHN Drive: link aqui Reuniões toda quarta às 18:00 Google meet: link aqui Grupo
              dos membros do ManaMano do ano de 2024.1. Classroom: XYEYEHN Drive: link aqui Reuniões
              toda quarta às 18:00 Google meet: link aqui
            </GroupDataText>
          </GroupDataScrollView>
        </GroupDataContainerInfo>
        <GroupDataLine />
        <GroupDataContainerInfo>
          <GroupDataText color="#160E47" font="inter-semiBold" size="18">
            Membros
          </GroupDataText>

          <GroupDataScrollView gap="20px" size="40vh">
            <GroupDataText color="#3F3D3D" font="inter-bold" size="14">
              Docentes
            </GroupDataText>
            {fakeMembers?.length > 0 ? (
              fakeMembers?.map((item: any) => <GroupMembers user={item.user} image={item.image} />)
            ) : (
              <GroupDataText color="#515151" font="inter-regular" size="12">
                Vazio...
              </GroupDataText>
            )}
            <GroupDataText color="#3F3D3D" font="inter-bold" size="14">
              Colegas
            </GroupDataText>
            {fakeMembers?.length > 0 ? (
              fakeMembers?.map((item: any) => <GroupMembers user={item.user} image={item.image} />)
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
            onPress={() => {}}
            border={false}
            text="Sair do Grupo"
          />
        </GroupDataButtonView>
      </GroupDataContainer>
    </GroupDataPage>
  );
}
