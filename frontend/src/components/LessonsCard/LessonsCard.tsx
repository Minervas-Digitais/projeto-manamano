/* eslint-disable prettier/prettier */
/* eslint-disable react/jsx-indent */
/* eslint-disable global-require */
import React, { useState } from 'react';
import { useFonts } from 'expo-font';
import { Alert, Linking } from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import Toast from 'react-native-toast-message';
import { toastConfig } from '../../pages/GlobalNotificationPage/GlobalNotificationPageStyle';

import {
  LessonsCardButtonContainer,
  LessonsCardButtonContainerRow,
  LessonsCardContainer,
  LessonsCardDateText,
  LessonsCardInfoContainer,
  LessonsCardInfoContainerSpaceBetween,
  LessonsCardInfoContainerWithGap,
  LessonsCardLinkIcon,
  LessonsCardTitleContainer,
  LessonsCardTitleText,
} from './LessonsCardStyle';
import { GroupDataText } from '../../pages/GroupData/GroupDataStyle';
import CalendarIcon from '../../assets/calendar-icon.svg';
import BookIcon from '../../assets/book-icon.svg';
import LinkIcon from '../../assets/link-icon.svg';

export default function LessonsCard({ date, title, urlLive }: any) {
  const [selected, setSelected] = useState(false);

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
            <CalendarIcon />
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
          <LessonsCardInfoContainerWithGap>
            <LessonsCardButtonContainer backgroundColor="#160E47" onPress={openLink}>
              <GroupDataText font="inter-bold" size="13px" color="white">
                Entrar na aula
              </GroupDataText>
            </LessonsCardButtonContainer>
            <LessonsCardButtonContainerRow backgroundColor="none" border onPress={copyLink}>
              <LessonsCardLinkIcon>
                <LinkIcon style={{ width: 20, height: 21 }} />
              </LessonsCardLinkIcon>
              <GroupDataText font="inter-bold" size="13px" color="#160E47">
                {' '}
                Copiar link
              </GroupDataText>
            </LessonsCardButtonContainerRow>
          </LessonsCardInfoContainerWithGap>
        </>
      ) : (
        <LessonsCardInfoContainerSpaceBetween>
          <LessonsCardTitleContainer>
            <BookIcon />
            <LessonsCardTitleText numberOfLines={1}>{title}</LessonsCardTitleText>
          </LessonsCardTitleContainer>
          <LessonsCardDateText>{date}</LessonsCardDateText>
        </LessonsCardInfoContainerSpaceBetween>
      )}
      <Toast config={toastConfig} />
    </LessonsCardContainer>
  );
}
