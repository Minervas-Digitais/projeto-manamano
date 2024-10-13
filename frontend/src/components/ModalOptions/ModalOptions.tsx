/* eslint-disable global-require */
import React from 'react';
import { useFonts } from 'expo-font';
import { Image } from 'react-native';

import {
  ModalOptionsContainer,
  ModalOptionsOptionsContainer,
  ModalOptionsOptionsText,
} from './ModalOptionsStyle';

export default function ModalOptions() {
  const share = require('../../assets/share-icon.svg');
  const fix = require('../../assets/fix-blue-icon.svg');
  const save = require('../../assets/save-icon.svg');

  const [fontsLoaded] = useFonts({
    'inter-regular': require('../../fonts/Inter-Regular.ttf'),
  });
  if (!fontsLoaded) {
    return undefined;
  }
  return (
    <ModalOptionsContainer>
      <ModalOptionsOptionsContainer>
        <Image source={share} />
        <ModalOptionsOptionsText font="inter-regular" color="#515151" size="13px">
          Compartilhar
        </ModalOptionsOptionsText>
      </ModalOptionsOptionsContainer>

      <ModalOptionsOptionsContainer>
        <Image source={save} />
        <ModalOptionsOptionsText font="inter-regular" color="#515151" size="13px">
          Salvar
        </ModalOptionsOptionsText>
      </ModalOptionsOptionsContainer>

      <ModalOptionsOptionsContainer>
        <Image source={fix} />
        <ModalOptionsOptionsText font="inter-regular" color="#515151" size="13px">
          Fixar
        </ModalOptionsOptionsText>
      </ModalOptionsOptionsContainer>
    </ModalOptionsContainer>
  );
}
