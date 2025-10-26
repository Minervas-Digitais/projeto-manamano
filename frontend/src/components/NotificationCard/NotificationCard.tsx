/* eslint-disable react/jsx-no-useless-fragment */
/* eslint-disable global-require */
/* eslint-disable react/jsx-one-expression-per-line */
import React, { useState } from 'react';
import { Image, TouchableOpacity, View } from 'react-native';
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
import { PostCardTag } from '../PostCard/PostCardStyle';
import ModalOptionsNotification from '../ModalOptionsNotification/ModalOptionsNotification';
import MegaPhone from '../../assets/megaphone-icon.svg';
import Fixed from '../../assets/fixed-icon.svg';
import DotsMenuIcon from '../../assets/dotsMenuBig.svg';

export default function NotificationCard({
  user,
  group,
  date,
  image,
  onPress,
  type,
  body,
  isread,
  confirm,
  idNotif,
  admin,
}: any) {
  const [display, setDisplay] = useState(false);

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
  function getFirstName(fullName: string): string {
    if (!fullName) return '';
    return fullName.trim().split(' ')[0];
  }
  const userfirstName = getFirstName(user);

  return (
    <View style={{ width: '100%' }}>
      {type === 'COMMENT' ? (
        <NotificationContainer onPress={onPress} isread={isread}>
          <ModalOptionsNotification display={display} id={idNotif} />
          <NotificationTextContainer>
            <NotificationImage source={image} />
            <NotificationTextGrey font="inter-semiBold">
              <NotificationTextRed font="inter-semiBold">
                @
                {userfirstName.length > 12
                  ? `${userfirstName.substring(0, 12)}...`
                  : userfirstName}{' '}
              </NotificationTextRed>
              no grupo{' '}
              <NotificationTextRed font="inter-semiBold">
                {(group || '').length > 20 ? `${(group || '').substring(0, 20)}...` : group || ''}
              </NotificationTextRed>{' '}
              comentou no seu post! Clique para visualizar!
            </NotificationTextGrey>
            <TouchableOpacity
              onPress={() => setDisplay(!display)}
              testID={`options-menu-${idNotif}`}>
              <DotsMenuIcon />
            </TouchableOpacity>
          </NotificationTextContainer>
          <NotificationTextDateContainer>
            <NotificationTextDate font="inter-regular">{formattedDate}</NotificationTextDate>
          </NotificationTextDateContainer>
        </NotificationContainer>
      ) : (
        <View />
      )}

      {type === 'WARNING' ? (
        <NotificationContainer
          onPress={onPress}
          style={{ gap: 3, justifyContent: 'space-between' }}
          isread={isread}>
          <ModalOptionsNotification
            admin={admin}
            type={type}
            display={display}
            id={idNotif}
            body={body}
          />

          <View>
            <NotificationTextContainerWarning height="min-content">
              <View style={{ flexDirection: 'row', gap: 5 }}>
                <MegaPhone />
                <NotificationTextRed font="inter-bold">Comunicado: </NotificationTextRed>
              </View>

              <TouchableOpacity
                onPress={() => setDisplay(!display)}
                testID={`options-menu-${idNotif}`}>
                <DotsMenuIcon />
              </TouchableOpacity>
            </NotificationTextContainerWarning>
            <NotificationTextContainerWarning height="39px">
              <NotificationTextGreyWarning font="inter-semiBold" numberOfLines={2}>
                {body}
              </NotificationTextGreyWarning>
            </NotificationTextContainerWarning>
          </View>
          <NotificationTextDateContainer>
            <NotificationTextDate font="inter-regular">{formattedDate}</NotificationTextDate>
          </NotificationTextDateContainer>
        </NotificationContainer>
      ) : (
        <View />
      )}

      {type === 'FIXED' ? (
        <NotificationContainer
          onPress={onPress}
          style={{ gap: 3, justifyContent: 'space-between' }}
          isread={isread}>
          <ModalOptionsNotification display={display} id={idNotif} />
          <View>
            <NotificationTextContainerWarning height="min-content">
              <View
                style={{
                  flexDirection: 'row',
                  gap: 3,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <Fixed />
                <NotificationTextRed font="inter-bold">Publicação fixada: </NotificationTextRed>
              </View>
              <TouchableOpacity onPress={() => setDisplay(!display)}>
                <DotsMenuIcon />
              </TouchableOpacity>
            </NotificationTextContainerWarning>
            <NotificationTextContainerWarning height="39px">
              <NotificationTextGrey font="inter-semiBold">
                Uma publicação foi fixada no grupo{' '}
                <NotificationTextRed font="inter-semiBold" numberOfLines={1}>
                  {group}
                </NotificationTextRed>
                . Clique para visualizar!
              </NotificationTextGrey>
            </NotificationTextContainerWarning>
          </View>
          <NotificationTextDateContainer>
            <NotificationTextDate font="inter-regular">{formattedDate}</NotificationTextDate>
          </NotificationTextDateContainer>
        </NotificationContainer>
      ) : (
        <View />
      )}
    </View>
  );
}
