/* eslint-disable global-require */
import React from 'react';
import { Image } from 'react-native';
import { GroupsAddButton } from './AddButtonStyle';

export default function AddButton({ icon, onPress }: any) {
  return (
    <GroupsAddButton onPress={onPress}>
      <Image source={icon} />
    </GroupsAddButton>
  );
}
