/* eslint-disable react/jsx-no-useless-fragment */
/* eslint-disable global-require */
/* eslint-disable react/jsx-one-expression-per-line */
import React from 'react';
import { Image, View } from 'react-native';
import { useFonts } from 'expo-font';
import {
  NotificationContainer,
  NotificationTextContainer,
  NotificationTextRed,
  NotificationTextGrey,
  NotificationTextDateContainer,
  NotificationTextDate,
  NotificationImage,
  NotificationTextContainerWarning,
  NotificationTextGreyWarning,
} from './NotificationCardStyle';

export default function NotificationCard({ user, group, date, image, onPress, type, body }: any) {
  const megaPhone = require('../../assets/megaphone-icon.svg');

  const [fontsLoaded] = useFonts({
    'inter-semiBold': require('../../fonts/Inter-SemiBold.ttf'),
    'inter-regular': require('../../fonts/Inter-Regular.ttf'),
    'inter-bold': require('../../fonts/Inter-Bold.ttf'),
  });
  if (!fontsLoaded) {
    return undefined;
  }

  function formatRelativeDate(postDate: string): string {
    const currentDate = new Date();
    const postDateObj = new Date(postDate);
    const differenceInMilliseconds = currentDate.getTime() - postDateObj.getTime();
    const differenceInMinutes = Math.floor(differenceInMilliseconds / (1000 * 60));
    const differenceInHours = Math.floor(differenceInMinutes / 60);
    const differenceInDays = Math.floor(differenceInHours / 24);

    const hours = postDateObj.getHours();
    const minutes = postDateObj.getMinutes();
    const formattedTime = `${hours}:${minutes < 10 ? `0${minutes}` : minutes}`;

    if (differenceInMinutes < 60) {
      return `hoje, ${formattedTime}`;
    }
    if (differenceInHours < 24) {
      return `ontem, ${formattedTime}`;
    }
    if (differenceInDays < 3) {
      return `há ${differenceInDays} dia${differenceInDays !== 1 ? 's' : ''}`;
    }
    return postDateObj.toLocaleDateString('pt-BR');
  }
  const formattedDate = formatRelativeDate(date);

  return (
    <>
      {type === 'COMMENT' ? (
        <NotificationContainer onPress={onPress}>
          <NotificationTextContainer>
            <NotificationImage source={image} />
            <NotificationTextGrey font="inter-semiBold">
              <NotificationTextRed font="inter-semiBold">@{user} </NotificationTextRed>
              no grupo <NotificationTextRed font="inter-semiBold">{group}</NotificationTextRed>{' '}
              comentou no seu post! Clique para visualizar!
            </NotificationTextGrey>
          </NotificationTextContainer>
          <NotificationTextDateContainer>
            <NotificationTextDate font="inter-regular">{formattedDate}</NotificationTextDate>
          </NotificationTextDateContainer>
        </NotificationContainer>
      ) : (
        <NotificationContainer
          onPress={onPress}
          style={{ gap: 3, justifyContent: 'space-between' }}
        >
          <View>
            <NotificationTextContainerWarning height="min-content">
              <Image source={megaPhone} />
              <NotificationTextRed font="inter-bold">Comunicado: </NotificationTextRed>
            </NotificationTextContainerWarning>
            <NotificationTextContainerWarning height={39}>
              <NotificationTextGreyWarning font="inter-semiBold" numberOfLines={2}>
                {body}
              </NotificationTextGreyWarning>
            </NotificationTextContainerWarning>
          </View>
          <NotificationTextDateContainer>
            <NotificationTextDate font="inter-regular">{formattedDate}</NotificationTextDate>
          </NotificationTextDateContainer>
        </NotificationContainer>
      )}
    </>
  );
}
