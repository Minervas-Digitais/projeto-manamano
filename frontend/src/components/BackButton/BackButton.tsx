/* eslint-disable global-require */
import React from 'react';
import { useNavigation } from '@react-navigation/native';
import { TouchableOpacity, Image } from 'react-native';

export default function BackButton() {
  const navigation = useNavigation();
  const backButton = require('../../assets/back-button-icon.svg');
  return (
    <TouchableOpacity onPress={() => navigation.goBack()}>
      <Image source={backButton} />
    </TouchableOpacity>
  );
}
