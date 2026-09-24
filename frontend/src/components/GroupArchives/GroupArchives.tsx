/* eslint-disable global-require */
import React from 'react';
import { useFonts } from 'expo-font';
import Toast from 'react-native-toast-message';
import { TouchableOpacity, Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';

import {
  ArchiveButtonContainer,
  ArchivePreviewImage,
  ArchiveIconContainer,
  ArchiveFileName,
  ArchiveFileType,
} from './GroupArchivesStyle';
import PaperclipSvgIcon from '../../assets/paperclip.svg';

// Função para determinar o tipo de arquivo baseado no mimeType (igual ao ArchiveCard)
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

// Função para renderizar prévia do arquivo (igual ao ArchiveCard)
const renderFilePreview = (mimeType?: string, uri?: string) => {
  if (mimeType?.startsWith('image/') && !mimeType.includes('svg') && uri) {
    return <ArchivePreviewImage source={{ uri: `data:${mimeType};base64,${uri}` }} />;
  }
  const icon = getFileTypeIcon(mimeType);
  return (
    <ArchiveIconContainer>
      {typeof icon === 'string' ? (
        <ArchiveFileName font="inter-semibold">{icon}</ArchiveFileName>
      ) : (
        icon
      )}
    </ArchiveIconContainer>
  );
};

interface GroupArchivesProps {
  archive: {
    id: string;
    name: string;
    uri: string;
    mimeType: string;
  };
}

export default function GroupArchives({ archive }: GroupArchivesProps) {
  const [fontsLoaded] = useFonts({
    'inter-semibold': require('../../fonts/Inter-SemiBold.ttf'),
    'inter-regular': require('../../fonts/Inter-Regular.ttf'),
  });

  if (!fontsLoaded) {
    return null;
  }

  const getFileTypeName = () => {
    if (archive.mimeType?.startsWith('image/')) return 'Imagem';
    if (archive.mimeType?.includes('pdf')) return 'PDF';
    if (archive.mimeType?.includes('link') || archive.mimeType?.includes('url')) return 'Link';
    if (archive.mimeType?.includes('document') || archive.mimeType?.includes('text/')) {
      return 'Documento';
    }
    return 'Arquivo';
  };

  const saveFile = async () => {
    if (!archive || !archive.uri || !archive.name || !archive.mimeType) {
      Toast.show({ type: 'error', text1: 'Erro', text2: 'Arquivo inválido para download' });
      return;
    }

    try {
      let base64 = archive.uri ?? null;
      const tempUri = FileSystem.cacheDirectory + archive.name;

      if (base64 && base64.startsWith('data:')) {
        [, base64] = base64.split(',');
      }

      // Se tivermos apenas URI local (file://) e não base64, copiar para cache
      if ((!base64 || base64.length === 0) && archive.uri && archive.uri.startsWith('file://')) {
        await FileSystem.copyAsync({ from: archive.uri, to: tempUri });
      } else if (base64) {
        // escrever o base64 no cache (garante arquivo físico)
        await FileSystem.writeAsStringAsync(tempUri, base64, {
          encoding: FileSystem.EncodingType.Base64,
        });
      } else if (archive.uri) {
        // fallback: tentar ler e gravar o conteúdo do content:// para cache
        try {
          const read = await FileSystem.readAsStringAsync(archive.uri, {
            encoding: FileSystem.EncodingType.Base64,
          });
          await FileSystem.writeAsStringAsync(tempUri, read, {
            encoding: FileSystem.EncodingType.Base64,
          });
        } catch (e) {
          Toast.show({
            type: 'warning',
            text1: 'Erro ao salvar arquivo',
            text2: 'Não foi possível ler o arquivo original para salvar.',
          });
        }
      }

      const mediaType = archive.mimeType.split('/')[0];

      // IMAGENS / VÍDEOS
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

      // --- PDFs e outros (comportamento distinto por plataforma)
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
          // cria o arquivo dentro da pasta escolhida
          const createdUri = await FileSystem.StorageAccessFramework.createFileAsync(
            permissions.directoryUri,
            archive.name,
            archive.mimeType,
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
        } catch (e) {
          Toast.show({
            type: 'error',
            text1: 'Erro',
            text2: 'Não foi possível salvar o arquivo via Storage Access Framework.',
          });
        }
      } else {
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
            mimeType: archive.mimeType,
            dialogTitle: archive.name,
          });
        } catch (e) {
          Toast.show({
            type: 'error',
            text1: 'Erro',
            text2: 'Não foi possível exportar o arquivo.',
          });
        }
      }
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Erro', text2: 'Não foi possível salvar o arquivo.' });
    }
  };

  return (
    <TouchableOpacity onPress={saveFile}>
      <ArchiveButtonContainer>
        {renderFilePreview(archive.mimeType, archive.uri)}
        <ArchiveFileName font="inter-semibold" numberOfLines={1}>
          {archive.name || 'Arquivo sem nome'}
        </ArchiveFileName>
        <ArchiveFileType font="inter-regular">{getFileTypeName()}</ArchiveFileType>
      </ArchiveButtonContainer>
    </TouchableOpacity>
  );
}
