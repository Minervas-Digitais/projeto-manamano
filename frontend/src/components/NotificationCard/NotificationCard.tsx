/* eslint-disable global-require */
/* eslint-disable react/jsx-one-expression-per-line */
import React from 'react';
import { useFonts } from 'expo-font';
import {
  NotificationContainer,
  NotificationTextContainer,
  NotificationTextRed,
  NotificationTextGrey,
  NotificationTextDateContainer,
  NotificationTextDate,
  NotificationImage,
} from './NotificationCardStyle';

export default function NotificationCard({ user, group, date, image, onPress }: any) {
  const [fontsLoaded] = useFonts({
    'inter-semiBold': require('../../fonts/Inter-SemiBold.ttf'),
    'inter-regular': require('../../fonts/Inter-Regular.ttf'),
  });
  if (!fontsLoaded) {
    return undefined;
  }
  return (
    <NotificationContainer onPress={onPress}>
      <NotificationTextContainer>
        <NotificationImage source={image} />
        <NotificationTextGrey font="inter-semiBold">
          <NotificationTextRed font="inter-semiBold">@{user} </NotificationTextRed>
          no grupo <NotificationTextRed font="inter-semiBold">{group}</NotificationTextRed> comentou
          no seu post! Clique para visualizar!
        </NotificationTextGrey>
      </NotificationTextContainer>
      <NotificationTextDateContainer>
        <NotificationTextDate font="inter-regular">{date}</NotificationTextDate>
      </NotificationTextDateContainer>
    </NotificationContainer>
  );
}
