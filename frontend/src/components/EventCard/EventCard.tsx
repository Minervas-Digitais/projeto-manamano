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
} from '../LessonsCard/LessonsCardStyle';
import { GroupDataText } from '../../pages/GroupData/GroupDataStyle';

export default function EventCard({ date, title, description }: any) {
  const calendar = require('../../assets/calendar-icon.svg');
  const link = require('../../assets/link-icon.svg');

  const [fontsLoaded] = useFonts({
    'inter-bold': require('../../fonts/Inter-Bold.ttf'),
    'inter-regular': require('../../fonts/Inter-Regular.ttf'),
  });
  if (!fontsLoaded) {
    return undefined;
  }

  return (
    <LessonsCardContainer onPress={() => {}} selected>
      <LessonsCardInfoContainer>
        <Image source={calendar} />

        <GroupDataText font="inter-bold" size="12px" color="#160E47">
          {' '}
          {date}
          <GroupDataText font="inter-bold" size="12px" color="#160E47" />
        </GroupDataText>
        <GroupDataText font="inter-bold" size="12px" color="#160E47" />
      </LessonsCardInfoContainer>
      <LessonsCardInfoContainer>
        <GroupDataText font="inter-bold" size="16px" color="#4E4E4E" numberOfLines={1}>
          {title}
        </GroupDataText>
      </LessonsCardInfoContainer>
      <LessonsCardInfoContainer>
        <GroupDataText font="inter-bold" size="12px" color="#4E4E4E" numberOfLines={1}>
          {description}
        </GroupDataText>
      </LessonsCardInfoContainer>

      <Toast config={toastConfig} />
    </LessonsCardContainer>
  );
}
