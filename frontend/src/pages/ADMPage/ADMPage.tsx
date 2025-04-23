/* eslint-disable global-require */
import { useFonts } from 'expo-font';
import { useNavigation } from '@react-navigation/native';
import { WhiteBackground } from '../EditProfile/EditProfileStyle';
import ADMPageButton from '../../components/ADMPageButton/ADMPageButton';
import {
  ADMBlueBackground,
  ADMPageContainer,
  ADMPageTextContainer,
  ADMTextContainer,
} from './ADMPageStyle';
import { GroupDataText } from '../GroupData/GroupDataStyle';

export default function ADMPage() {
  const searchIcon = require('../../assets/white-MG.svg');
  const gearIcon = require('../../assets/white-gear.svg');
  const megaphoneIcon = require('../../assets/white-megaphone.svg');
  const groupIcon = require('../../assets/white-group.svg');
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
            icon={searchIcon}
            text="Pesquisar"
            onPress={() => navigation.navigate('Search')}
          />
          <ADMPageButton
            fontColor="white"
            icon={groupIcon}
            text="Criar Grupo"
            onPress={() => navigation.navigate('CreateGroup')}
          />
          <ADMPageButton fontColor="white" icon={megaphoneIcon} text="Comunicados" />
          <ADMPageButton
            fontColor="white"
            icon={gearIcon}
            text="Configurações"
            onPress={() => navigation.navigate('Configurações')}
          />
        </ADMPageContainer>
      </WhiteBackground>
    </ADMBlueBackground>
  );
}
