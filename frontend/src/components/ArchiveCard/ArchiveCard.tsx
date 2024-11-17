/* eslint-disable no-nested-ternary */
/* eslint-disable global-require */
import React from 'react';
import { useFonts } from 'expo-font';
import { View, Image } from 'react-native';
import {
  AddRemoveArchiveIcon,
  ArchiveCardContainer,
  ArchivePressable,
  Empty,
  MagnifyingGlassIcon,
  PaperclipIcon,
} from './ArchiveCardStyle';

export default function ArchiveCard({ archive, removed, onPress }: any) {
  const addArchive = require('../../assets/add-archive.svg');
  const removeArchive = require('../../assets/remove-archive.svg');
  const noArchive = require('../../assets/paperclip.svg');
  const magnifyingGlass = require('../../assets/magnifying-glass.svg');
  const [fontsLoaded] = useFonts({
    'inter-semibold': require('../../fonts/Inter-SemiBold.ttf'),
    'inter-regular': require('../../fonts/Inter-Regular.ttf'),
  });
  if (!fontsLoaded) {
    return undefined;
  }
  return (
    <View>
      {archive ? (
        removed ? (
          <Empty />
        ) : (
          <ArchiveCardContainer>
            <ArchivePressable
              onPress={() => {
                alert('link');
              }}>
              <ArchiveCardContainer>
                <MagnifyingGlassIcon source={magnifyingGlass} />
                <AddRemoveArchiveIcon onPress={onPress}>
                  <Image source={removeArchive} />
                </AddRemoveArchiveIcon>
              </ArchiveCardContainer>
            </ArchivePressable>
          </ArchiveCardContainer>
        )
      ) : (
        <ArchiveCardContainer>
          <ArchivePressable
            onPress={() => {
              alert('link');
            }}>
            <ArchiveCardContainer>
              <PaperclipIcon source={noArchive} />
              <AddRemoveArchiveIcon>
                <Image source={addArchive} />
              </AddRemoveArchiveIcon>
            </ArchiveCardContainer>
          </ArchivePressable>
        </ArchiveCardContainer>
      )}
    </View>
  );
}
