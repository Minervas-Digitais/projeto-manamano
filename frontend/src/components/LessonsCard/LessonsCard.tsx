/* eslint-disable prettier/prettier */
/* eslint-disable react/jsx-indent */
/* eslint-disable global-require */
import React, { useState } from 'react';
import { useFonts } from 'expo-font';
import { Alert, Image, Linking } from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import Toast from 'react-native-toast-message';
import { toastConfig } from '../../pages/GlobalNotificationPage/GlobalNotificationPageStyle';

import {
  LessonsCardButtonContainer,
  LessonsCardContainer,
  LessonsCardInfoContainer,
} from './LessonsCardStyle';
import { GroupDataText } from '../../pages/GroupData/GroupDataStyle';

export default function LessonsCard({ date, title, urlLive }: any) {
  const [selected, setSelected] = useState(false);
  const calendar = require('../../assets/calendar-icon.svg');
  const book = require('../../assets/book-icon.svg');
  const link = require('../../assets/link-icon.svg');

  const [fontsLoaded] = useFonts({
    'inter-bold': require('../../fonts/Inter-Bold.ttf'),
    'inter-regular': require('../../fonts/Inter-Regular.ttf'),
  });
  if (!fontsLoaded) {
    return undefined;
  }

  const openLink = async () => {
    const url = urlLive;

    const supported = await Linking.canOpenURL(url);

    if (supported) {
      await Linking.openURL(url);
    } else {
      Alert.alert(`Não foi possível abrir este link: ${url}`);
    }
  };

  const copyLink = () => {
    const url = urlLive;
    Clipboard.setString(url);
    Toast.show({
      type: 'success',
      text1: 'Link Copiado!',
      visibilityTime: 1000,

    });
  };

  return (
    <LessonsCardContainer onPress={() => setSelected(!selected)} selected={selected}>
      {selected ? (
        <>
          <LessonsCardInfoContainer>
            <GroupDataText font="inter-bold" size="16px" color="#4E4E4E" numberOfLines={1}>
              {title}
            </GroupDataText>
          </LessonsCardInfoContainer>

          <LessonsCardInfoContainer>
            <Image source={calendar} />
            <GroupDataText font="inter-bold" size="12px" color="#4E4E4E">
              Começa em
              <GroupDataText font="inter-bold" size="12px" color="#160E47">
                {' '}
              </GroupDataText>
            </GroupDataText>
            <GroupDataText font="inter-bold" size="12px" color="#160E47">
              {date}
              <GroupDataText font="inter-bold" size="12px" color="#160E47" />
            </GroupDataText>
            <GroupDataText font="inter-bold" size="12px" color="#160E47" />
          </LessonsCardInfoContainer>
          <LessonsCardInfoContainer style={{ gap: '10px' }}>
            <LessonsCardButtonContainer backgroundColor="#160E47" onPress={openLink}>
              <GroupDataText font="inter-bold" size="13px" color="white">
                Entrar na aula
              </GroupDataText>
            </LessonsCardButtonContainer>
            <LessonsCardButtonContainer
              backgroundColor="none"
              border
              style={{ flexDirection: 'row' }}
              onPress={copyLink}
            >
              <Image style={{ width: 20, height: 21 }} source={link} />

              <GroupDataText font="inter-bold" size="13px" color="#160E47">
                {' '}
                Copiar link da aula
              </GroupDataText>
            </LessonsCardButtonContainer>
          </LessonsCardInfoContainer>
        </>
      ) : (
        <LessonsCardInfoContainer style={{ justifyContent: 'space-between', position: 'relative' }}>
          <LessonsCardInfoContainer style={{ width: 'fit-content', gap: '3px' }}>
            <Image source={book} />
            <GroupDataText
              font="inter-bold"
              size="16px"
              color="#4E4E4E"
              numberOfLines={1}
              style={{ zIndex: 3 }}
            >
              {title}
            </GroupDataText>
          </LessonsCardInfoContainer>
          <GroupDataText font="inter-bold" size="12px" color="#160E47">
            {date}
          </GroupDataText>
        </LessonsCardInfoContainer>
      )}
      <Toast config={toastConfig} />

    </LessonsCardContainer>
  );
}
