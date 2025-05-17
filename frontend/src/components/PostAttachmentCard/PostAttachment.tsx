/* eslint-disable global-require */
import React from 'react';
import { useFonts } from 'expo-font';
import { Pressable, View } from 'react-native';
import * as FileSystem from 'expo-file-system';
import {
  AttachmentArchiveIcon,
  AttachmentContainer,
  AttachmentLinkIcon,
  AttachmentText,
  AttachmentType,
  VerticalSeparator,
} from './PostAttachmentStyle';

export default function PostAttachment({ archive, text, file }: any) {
  const linkIcon = require('../../assets/link-icon.svg');
  const archiveIcon = require('../../assets/archive-icon.svg');
  const [fontsLoaded] = useFonts({
    'inter-semibold': require('../../fonts/Inter-SemiBold.ttf'),
    'inter-regular': require('../../fonts/Inter-Regular.ttf'),
  });
  if (!fontsLoaded) {
    return undefined;
  }
  const downloadFile = async () => {
    if (!file || !file.contentBase64 || !file.name) {
      console.error('Arquivo inválido para download');
      return;
    }

    // Definir o caminho do arquivo no armazenamento local
    const fileUri = `${FileSystem.documentDirectory}${file.name}`;

    try {
      // Converte base64 para arquivo
      await FileSystem.writeAsStringAsync(fileUri, file.contentBase64, {
        encoding: FileSystem.EncodingType.Base64,
      });

      console.log('Arquivo salvo localmente em:', fileUri);
    } catch (error) {
      console.error('Erro ao baixar o arquivo:', error);
    }
  };

  return (
    <Pressable onPress={downloadFile}>
      <AttachmentContainer>
        {archive ? (
          <AttachmentArchiveIcon source={archiveIcon} />
        ) : (
          <AttachmentLinkIcon source={linkIcon} />
        )}
        <VerticalSeparator />
        <View style={{ flexDirection: 'column' }}>
          <AttachmentText font="inter-semibold" size="12px">
            {text}
          </AttachmentText>

          {archive ? (
            <AttachmentType font="inter-regular">Arquivo</AttachmentType>
          ) : (
            <AttachmentType font="inter-regular">Link</AttachmentType>
          )}
        </View>
      </AttachmentContainer>
    </Pressable>
  );
}
