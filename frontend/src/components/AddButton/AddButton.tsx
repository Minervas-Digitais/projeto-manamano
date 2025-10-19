/* eslint-disable global-require */
import React from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { GroupsAddButton } from './AddButtonStyle';

export default function AddButton({ icon, onPress, testID }: any) {
  const { height } = Dimensions.get('window');
  const bottomPosition = height * 0.15;

  return (
    <GroupsAddButton testID={testID} onPress={onPress} style={{ bottom: bottomPosition }}>
      <LinearGradient
        colors={['#1A0E47FF', '#170E47E3', '#160E47D1', '#170E47C7']}
        locations={[0, 0.85, 1, 1]}
        style={StyleSheet.absoluteFill}
      />
      <View style={{ zIndex: 1 }}>{icon}</View>
    </GroupsAddButton>
  );
}
