/* eslint-disable global-require */
import React from 'react';
import { useNavigation } from '@react-navigation/native';
import { TouchableOpacity } from 'react-native';
import { BackButtonIcon } from './BackButtonStyle';

export default function BackButton() {
  const navigation = useNavigation();
  return (
    <TouchableOpacity onPress={() => navigation.goBack()}>
      <BackButtonIcon />
    </TouchableOpacity>
  );
}
