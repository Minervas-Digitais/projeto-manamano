/* eslint-disable no-nested-ternary */
/* eslint-disable global-require */
import React from 'react';
import { useFonts } from 'expo-font';
import { View, Image } from 'react-native';
import {
  RemoveArchiveIcon,
  NewPostArchiveContainer,
  NewPostArchivePressable,
  ArchiveCardText,
  Empty,
} from './NewPostArchiveStyle';

export default function NewPostArchive({ removed, onPress, name }: any) {
  const trashCanIcon = require('../../assets/padlock-icon.svg');

  const [fontsLoaded] = useFonts({
    'inter-semibold': require('../../fonts/Inter-SemiBold.ttf'),
    'inter-regular': require('../../fonts/Inter-Regular.ttf'),
  });
  if (!fontsLoaded) {
    return undefined;
  }
  return (
    <View>
      {removed ? (
        <Empty />
      ) : (
        <NewPostArchiveContainer>
          <NewPostArchivePressable>
            <ArchiveCardText numberOfLines={3} font="inter-semibold" size="12px">
              {name}
            </ArchiveCardText>
            <RemoveArchiveIcon onPress={onPress}>
              <Image source={trashCanIcon} />
            </RemoveArchiveIcon>
          </NewPostArchivePressable>
        </NewPostArchiveContainer>
      )}
    </View>
  );
}
