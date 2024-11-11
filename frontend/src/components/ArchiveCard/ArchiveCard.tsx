/* eslint-disable global-require */
import React from 'react';
import { useFonts } from 'expo-font';
import {
  AddRemoveArchiveIcon,
  ArchiveCardContainer,
  ArchivePressable,
  MagnifyingGlassIcon,
  PaperclipIcon,
} from './ArchiveCardStyle';

export default function ArchiveCard({ archive }: any) {
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
    <ArchivePressable
      onPress={() => {
        alert('link');
      }}>
      <ArchiveCardContainer>
        {archive ? (
          <ArchiveCardContainer>
            <MagnifyingGlassIcon source={magnifyingGlass} />
            <AddRemoveArchiveIcon source={removeArchive} />
          </ArchiveCardContainer>
        ) : (
          <ArchiveCardContainer>
            <PaperclipIcon source={noArchive} />
            <AddRemoveArchiveIcon source={addArchive} />
          </ArchiveCardContainer>
        )}
      </ArchiveCardContainer>
    </ArchivePressable>
  );
}
