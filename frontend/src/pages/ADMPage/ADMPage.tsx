/* eslint-disable global-require */
import { useFonts } from 'expo-font';
import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { WhiteBackground } from '../EditProfile/EditProfileStyle';
import ADMPageButton from '../../components/ADMPageButton/ADMPageButton';
import {
  ADMBlueBackground,
  ADMPageContainer,
  ADMPageTextContainer,
  ADMTextContainer,
} from './ADMPageStyle';
import { GroupDataText } from '../GroupData/GroupDataStyle';
import GroupIcon from '../../assets/white-group.svg';
import MegaphoneIcon from '../../assets/white-megaphone.svg';
import GearIcon from '../../assets/white-gear.svg';
import SearchIcon from '../../assets/white-MG.svg';

export default function ADMPage() {
  const navigation = useNavigation();

  const [fontsLoaded] = useFonts({
    'inter-bold': require('../../fonts/Inter-Bold.ttf'),
    'inter-semibold': require('../../fonts/Inter-SemiBold.ttf'),
  });
  if (!fontsLoaded) {
    return undefined;
  }
  return (
    <ADMBlueBackground>
      <ADMTextContainer>
        <GroupDataText font="inter-bold" color="#EF4036" size="20px">
          Olá,
        </GroupDataText>
        <GroupDataText font="inter-bold" color="#FFF" size="20px">
          Administrador!
        </GroupDataText>
      </ADMTextContainer>
      <WhiteBackground>
        <ADMPageTextContainer>
          <GroupDataText font="inter-bold" color="#3F3D3D" size="20px">
            Ações
          </GroupDataText>
        </ADMPageTextContainer>
        <ADMPageContainer>
          <ADMPageButton
            fontColor="white"
            icon={<SearchIcon />}
            text="Pesquisar"
            onPress={() => navigation.navigate('Search')}
          />
          <ADMPageButton
            fontColor="white"
            icon={<GroupIcon />}
            text="Criar Grupo"
            onPress={() => navigation.navigate('CreateGroup')}
          />
          <ADMPageButton
            fontColor="white"
            icon={<MegaphoneIcon />}
            text="Comunicados"
            onPress={() => navigation.navigate('GlobalNotification')}
          />
          <ADMPageButton
            fontColor="white"
            icon={<GearIcon />}
            text="Configurações"
            onPress={() => navigation.navigate('Config')}
          />
        </ADMPageContainer>
      </WhiteBackground>
    </ADMBlueBackground>
  );
}
