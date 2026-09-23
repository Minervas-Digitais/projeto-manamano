/* eslint-disable global-require */
import React from 'react';
import { useFonts } from 'expo-font';
import { Pressable, View, Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';
import Toast from 'react-native-toast-message';

import {
  AttachmentContainer,
  AttachmentImagePreview,
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
    if (!file || (!file.contentBase64 && !file.uri) || !file.name || !file.mimeType) {
      console.error('Arquivo inválido para download', file);
      Toast.show({ type: 'error', text1: 'Erro', text2: 'Arquivo inválido para download' });
      return;
    }

    try {
      let base64 = file.contentBase64 ?? null;
      const tempUri = FileSystem.cacheDirectory + file.name;

      if (base64 && base64.startsWith('data:')) {
        base64 = base64.split(',')[1];
      }

      // Se tivermos apenas URI local (file://) e não base64, copiar para cache
      if ((!base64 || base64.length === 0) && file.uri && file.uri.startsWith('file://')) {
        await FileSystem.copyAsync({ from: file.uri, to: tempUri });
      } else if (base64) {
        // escrever o base64 no cache (garante arquivo físico)
        await FileSystem.writeAsStringAsync(tempUri, base64, {
          encoding: FileSystem.EncodingType.Base64,
        });
      } else if (file.uri) {
        // fallback: tentar ler e gravar o conteúdo do content:// para cache
        try {
          const read = await FileSystem.readAsStringAsync(file.uri, {
            encoding: FileSystem.EncodingType.Base64,
          });
          await FileSystem.writeAsStringAsync(tempUri, read, {
            encoding: FileSystem.EncodingType.Base64,
          });
        } catch (e) {
          console.warn('Não foi possível ler uri original; prosseguindo sem copiar:', e);
        }
      }

      const mediaType = file.mimeType.split('/')[0];

      // --- IMAGENS / VÍDEOS: só criar asset (não criar álbum) ---
      if (mediaType === 'image' || mediaType === 'video') {
        const { status } = await MediaLibrary.requestPermissionsAsync();
        if (status !== 'granted') {
          Toast.show({
            type: 'error',
            text1: 'Permissão negada',
            text2: 'Não foi possível acessar a galeria.',
          });
          return;
        }

        // cria apenas o asset — NÃO chama createAlbumAsync
        await MediaLibrary.createAssetAsync(tempUri);
        // asset salvo; o sistema colocará na galeria padrão (Recents, Camera Roll etc.)
        Toast.show({
          type: 'success',
          text1: 'Arquivo baixado',
          text2: 'Imagem/Vídeo salvo na galeria!',
        });
        return;
      }

      // --- PDFs e outros (comportamento distinto por plataforma) ---
      if (Platform.OS === 'android') {
        // usar Storage Access Framework: pede pasta EXISTENTE e cria o arquivo lá
        if (!FileSystem.StorageAccessFramework) {
          Toast.show({
            type: 'error',
            text1: 'Erro',
            text2: 'StorageAccessFramework não disponível nesta versão do Expo.',
          });
          return;
        }

        const permissions =
          await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
        if (!permissions.granted) {
          Toast.show({
            type: 'error',
            text1: 'Permissão negada',
            text2: 'Não foi possível acessar a pasta de destino.',
          });
          return;
        }

        try {
          // cria o arquivo dentro da pasta escolhida — NÃO cria pastas extras
          const createdUri = await FileSystem.StorageAccessFramework.createFileAsync(
            permissions.directoryUri,
            file.name,
            file.mimeType,
          );

          // obter os dados base64 (se não tivermos base64, ler do tempUri)
          let dataToWriteBase64 = base64;
          if (!dataToWriteBase64) {
            dataToWriteBase64 = await FileSystem.readAsStringAsync(tempUri, {
              encoding: FileSystem.EncodingType.Base64,
            });
          }

          await FileSystem.writeAsStringAsync(createdUri, dataToWriteBase64, {
            encoding: FileSystem.EncodingType.Base64,
          });

          Toast.show({
            type: 'success',
            text1: 'Arquivo baixado',
            text2: 'Arquivo salvo com sucesso!',
          });
          return;
        } catch (e) {
          console.error('Erro ao criar/escrever arquivo via SAF:', e);
          Toast.show({
            type: 'error',
            text1: 'Erro',
            text2: 'Não foi possível salvar o arquivo via Storage Access Framework.',
          });
          return;
        }
      } else {
        // iOS: gravar em cache e abrir share sheet (usuário escolhe onde salvar - Files, etc.)
        try {
          const canShare = await Sharing.isAvailableAsync();
          if (!canShare) {
            Toast.show({
              type: 'error',
              text1: 'Erro',
              text2: 'Compartilhamento não disponível neste dispositivo.',
            });
            return;
          }
          await Sharing.shareAsync(tempUri, {
            mimeType: file.mimeType,
            dialogTitle: file.name,
          });
          return;
        } catch (e) {
          console.error('Erro ao compartilhar o arquivo no iOS:', e);
          Toast.show({
            type: 'error',
            text1: 'Erro',
            text2: 'Não foi possível exportar o arquivo.',
          });
          return;
        }
      }
    } catch (error) {
      console.error('Erro ao salvar o arquivo:', error);
      Toast.show({ type: 'error', text1: 'Erro', text2: 'Não foi possível salvar o arquivo.' });
    }
  };
  const isPreviewableImage =
    archive && file?.mimeType?.startsWith('image/') && !file.mimeType.includes('svg');
  let imageUri: string | null = null;
  if (isPreviewableImage) {
    if (file?.contentBase64) {
      imageUri = file.contentBase64.startsWith('data:')
        ? file.contentBase64
        : `data:${file.mimeType};base64,${file.contentBase64}`;
    } else if (file?.uri) {
      imageUri = file.uri;
    }
  }

  let icon: React.ReactNode;
  if (isPreviewableImage && imageUri) {
    icon = <AttachmentImagePreview source={{ uri: imageUri }} />;
  } else if (archive) {
    icon = <ArchiveIcon />;
  } else {
    icon = <LinkIcon />;
  }

  return (
    <Pressable onPress={saveFile}>
      <AttachmentContainer>
        {icon}
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
