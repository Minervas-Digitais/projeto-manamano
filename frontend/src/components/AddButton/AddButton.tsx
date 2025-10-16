/* eslint-disable global-require */
import React from 'react';
import { Image } from 'react-native';
import { GroupsAddButton } from './AddButtonStyle';

export default function AddButton({ icon, onPress, testID }: any) {
  return <GroupsAddButton testID={testID} onPress={onPress}>{icon}</GroupsAddButton>;
}
