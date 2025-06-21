/* eslint-disable no-alert */
/* eslint-disable global-require */
import React from 'react';
import { useFonts } from 'expo-font';
import { Share } from 'react-native';
import ShareIcon from '../../assets/share-icon.svg';
import Fix from '../../assets/fix-blue-icon.svg';
import Save from '../../assets/save-icon.svg';

import {
  ModalOptionsContainer,
  ModalOptionsOptionsContainer,
  ModalOptionsOptionsText,
} from './ModalOptionsStyle';

export default function ModalOptions({ postId }: any) {
  const [fontsLoaded] = useFonts({
    'inter-regular': require('../../fonts/Inter-Regular.ttf'),
  });
  if (!fontsLoaded) {
    return undefined;
  }
  return (
    <ModalOptionsContainer>
      <ModalOptionsOptionsContainer onPress={onShare}>
        <ShareIcon />
        <ModalOptionsOptionsText font="inter-regular" color="#515151" size="13px">
          Compartilhar
        </ModalOptionsOptionsText>
      </ModalOptionsOptionsContainer>

      <ModalOptionsOptionsContainer>
        <Save />
        <ModalOptionsOptionsText font="inter-regular" color="#515151" size="13px">
          Salvar
        </ModalOptionsOptionsText>
      </ModalOptionsOptionsContainer>

      <ModalOptionsOptionsContainer>
        <Fix />
        <ModalOptionsOptionsText font="inter-regular" color="#515151" size="13px">
          Fixar
        </ModalOptionsOptionsText>
      </ModalOptionsOptionsContainer>
    </ModalOptionsContainer>
  );
}
