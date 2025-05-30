/* eslint-disable global-require */
import React from 'react';
import { useFonts } from 'expo-font';
import { Pressable, View, Alert } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';
import * as IntentLauncher from 'expo-intent-launcher';

import {
  AttachmentContainer,
  AttachmentText,
  AttachmentType,
  VerticalSeparator,
} from './PostAttachmentStyle';
import LinkIcon from '../../assets/link-icon.svg';
import ArchiveIcon from '../../assets/archive-icon.svg';

export default function PostAttachment({ archive, text, file }: any) {
  const [fontsLoaded] = useFonts({
    'inter-semibold': require('../../fonts/Inter-SemiBold.ttf'),
    'inter-regular': require('../../fonts/Inter-Regular.ttf'),
  });
  if (!fontsLoaded) {
    return null;
  }

  const saveFile = async () => {
    if (!file || !file.contentBase64 || !file.name || !file.mimeType) {
      console.error('Arquivo inválido para download');
      Alert.alert('Erro', 'Arquivo inválido para download');
      return;
    }

    // Limpa prefixo data URI
    let base64 = file.contentBase64;
    if (base64.startsWith('data:')) {
      base64 = base64.split(',')[1];
    }

    // Salva temporariamente no cache
    const tempUri = FileSystem.cacheDirectory + file.name;
    try {
      await FileSystem.writeAsStringAsync(tempUri, base64, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const mediaType = file.mimeType.split('/')[0];
      if (mediaType === 'image' || mediaType === 'video') {
        // Imagem ou vídeo: salva na galeria
        const { status } = await MediaLibrary.requestPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permissão negada', 'Não foi possível acessar a galeria.');
          return;
        }
        const asset = await MediaLibrary.createAssetAsync(tempUri);
        await MediaLibrary.createAlbumAsync('manamano', asset, false);
        Alert.alert('Sucesso', 'Imagem/Vídeo salvo na galeria!');
      } else {
        // PDF ou outros: usa Storage Access Framework para salvar em pasta externa
        const contentUri = await FileSystem.getContentUriAsync(tempUri);
        await IntentLauncher.startActivityAsync('android.intent.action.CREATE_DOCUMENT', {
          data: contentUri,
          type: file.mimeType,
          flags: 1, // FLAG_ACTIVITY_NEW_DOCUMENT
          extra: {
            'android.intent.extra.TITLE': file.name,
          },
        });
      }
    } catch (error) {
      console.error('Erro ao salvar o arquivo:', error);
      Alert.alert('Erro', 'Não foi possível salvar o arquivo.');
    }
  };
  return (
    <Pressable onPress={saveFile}>
      <AttachmentContainer>
        {archive ? <ArchiveIcon /> : <LinkIcon />}
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
