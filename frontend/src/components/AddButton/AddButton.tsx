/* eslint-disable global-require */
import React from 'react';
import { Image } from 'react-native';
import { GroupsAddButton } from './AddButtonStyle';

export default function AddButton({ icon }: any) {
  return (
    <GroupsAddButton>
      <Image source={icon} />
    </GroupsAddButton>
  );
}
