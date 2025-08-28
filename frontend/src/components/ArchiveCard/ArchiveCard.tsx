/* eslint-disable no-nested-ternary */
/* eslint-disable global-require */
import React from 'react';
import { useFonts } from 'expo-font';
import { View } from 'react-native';
import {
  AddRemoveArchiveIcon,
  ArchiveCardContainer,
  ArchivePressable,
  ArchiveCardText,
  Empty,
  PreviewContainer,
  FilePreviewImage,
  FileIconContainer,
  CenteredText,
} from './ArchiveCardStyle';
import AddArchiveIcon from '../../assets/add-archive.svg';
import RemoveArchiveIcon from '../../assets/remove-archive.svg';
import PaperclipSvgIcon from '../../assets/paperclip.svg';

// Função para determinar o tipo de arquivo baseado no mimeType
const getFileTypeIcon = (mimeType?: string) => {
  if (!mimeType) return <PaperclipSvgIcon />;

  if (mimeType.startsWith('image/')) {
    return '📷'; // Emoji para imagens
  }
  if (mimeType.includes('pdf')) {
    return '📄'; // Emoji para PDF
  }
  if (mimeType.includes('word') || mimeType.includes('document')) {
    return '📝'; // Emoji para documentos
  }
  if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) {
    return '📊'; // Emoji para planilhas
  }
  if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) {
    return '📋'; // Emoji para apresentações
  }
  if (mimeType.startsWith('video/')) {
    return '🎥'; // Emoji para vídeos
  }
  if (mimeType.startsWith('audio/')) {
    return '🎵'; // Emoji para áudios
  }
  return '📎'; // Emoji genérico para outros arquivos
};

// Função para renderizar prévia do arquivo
const renderFilePreview = (mimeType?: string, uri?: string) => {
  if (mimeType?.startsWith('image/') && uri) {
    return <FilePreviewImage source={{ uri: `data:${mimeType};base64,${uri}` }} />;
  }
  const icon = getFileTypeIcon(mimeType);
  return (
    <FileIconContainer>
      {typeof icon === 'string' ? (
        <ArchiveCardText font="inter-semibold" size="16px">
          {icon}
        </ArchiveCardText>
      ) : (
        icon
      )}
    </FileIconContainer>
  );
};

export default function ArchiveCard({
  archive,
  removed,
  onPress,
  onClick,
  name,
  mimeType,
  uri,
  testID
}: any) {
  const [fontsLoaded] = useFonts({
    'inter-semibold': require('../../fonts/Inter-SemiBold.ttf'),
    'inter-regular': require('../../fonts/Inter-Regular.ttf'),
  });
  if (!fontsLoaded) {
    return undefined;
  }
  const addArchive = require('../../assets/add-archive.svg');
  const removeArchive = require('../../assets/remove-archive.svg');
  const noArchive = require('../../assets/paperclip.svg');
  const magnifyingGlass = require('../../assets/magnifying-glass.svg');
  return (
    <View>
      {archive ? (
        removed ? (
          <Empty />
        ) : (
          <ArchiveCardContainer>
            <ArchivePressable>
              <PreviewContainer>
                {renderFilePreview(mimeType, uri)}
                <CenteredText
                  font="inter-semibold"
                  size="9px"
                  numberOfLines={2}
                  ellipsizeMode="tail">
                  {name}
                </CenteredText>
              </PreviewContainer>
              <AddRemoveArchiveIcon onPress={onPress} testID={testID}>
                <RemoveArchiveIcon />
              </AddRemoveArchiveIcon>
            </ArchivePressable>
          </ArchiveCardContainer>
        )
      ) : (
        <ArchiveCardContainer>
          <ArchivePressable>
            <ArchiveCardContainer>
              <PaperclipSvgIcon />
              <AddRemoveArchiveIcon onPress={onClick} testID={testID}>
                <AddArchiveIcon />
              </AddRemoveArchiveIcon>
            </ArchiveCardContainer>
          </ArchivePressable>
        </ArchiveCardContainer>
      )}
    </View>
  );
}
