import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, View, Platform } from 'react-native';
import { useRoute } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';
import ScreenWithHeader from '../../components/ScreenWithHeader/ScreenWithHeader';
import api from '../../services/api';
import { GroupDataText } from '../GroupData/GroupDataStyle';
import ArchiveIcon from '../../assets/archive-icon.svg';
import {
  LessonFileCard,
  LessonFileIconContainer,
  LessonFileName,
  LessonFilePreviewImage,
  LessonFileType,
  LessonFilesContainer,
  LessonFilesEmptyContainer,
  LessonFilesGrid,
  LessonFilesList,
  LessonFilesLoadingContainer,
} from './LessonFilesStyle';

type Archive = {
  id: string;
  name: string;
  mimeType: string;
  contentBase64: string;
  type: string;
  userId: string;
  groupId: string;
  postId: string;
};

export default function LessonFiles() {
  const route = useRoute();
  const { postId, title } = route.params as { postId: string; title?: string };
  const [archives, setArchives] = useState<Archive[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchArchives = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get(`/archives/post/${postId}`);
      setArchives(response.data);
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Erro ao carregar arquivos da aula.',
      });
      setArchives([]);
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    fetchArchives();
  }, [fetchArchives]);

  const handlePressFile = async (archive: Archive) => {
    const file = {
      name: archive.name,
      mimeType: archive.mimeType,
      contentBase64: archive.contentBase64,
      uri: archive.contentBase64,
    };
    if (!file.contentBase64 || !file.name || !file.mimeType) {
      Toast.show({ type: 'error', text1: 'Erro', text2: 'Arquivo inválido para download' });
      return;
    }
    try {
      let base64 = file.contentBase64;
      const tempUri = FileSystem.cacheDirectory + file.name;
      if (base64.startsWith('data:')) base64 = base64.split(',')[1];
      await FileSystem.writeAsStringAsync(tempUri, base64, {
        encoding: FileSystem.EncodingType.Base64,
      });
      const mediaType = file.mimeType.split('/')[0];
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
        await MediaLibrary.createAssetAsync(tempUri);
        Toast.show({
          type: 'success',
          text1: 'Arquivo baixado',
          text2: 'Imagem/Vídeo salvo na galeria!',
        });
        return;
      }
      if (Platform.OS === 'android') {
        if (!FileSystem.StorageAccessFramework) {
          Toast.show({
            type: 'error',
            text1: 'Erro',
            text2: 'StorageAccessFramework não disponível.',
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
        const createdUri = await FileSystem.StorageAccessFramework.createFileAsync(
          permissions.directoryUri,
          file.name,
          file.mimeType,
        );
        await FileSystem.writeAsStringAsync(createdUri, base64, {
          encoding: FileSystem.EncodingType.Base64,
        });
        Toast.show({
          type: 'success',
          text1: 'Arquivo baixado',
          text2: 'Arquivo salvo com sucesso!',
        });
        return;
      }
      const canShare = await Sharing.isAvailableAsync();
      if (!canShare) {
        Toast.show({
          type: 'error',
          text1: 'Erro',
          text2: 'Compartilhamento não disponível.',
        });
        return;
      }
      await Sharing.shareAsync(tempUri, { mimeType: file.mimeType, dialogTitle: file.name });
    } catch (error) {
      console.error('Erro ao salvar arquivo:', error);
      Toast.show({ type: 'error', text1: 'Erro', text2: 'Não foi possível salvar o arquivo.' });
    }
  };

  if (loading) {
    return (
      <ScreenWithHeader headerProps={{ font: 'inter-bold', text: title || 'Conteúdos da aula' }}>
        <LessonFilesLoadingContainer>
          <ActivityIndicator size="large" color="#EF4036" />
          <GroupDataText
            color="#8F8F8F"
            size="12px"
            font="inter-regular"
            style={{ marginTop: 8, textAlign: 'center' }}>
            Carregando arquivos...
          </GroupDataText>
        </LessonFilesLoadingContainer>
      </ScreenWithHeader>
    );
  }

  return (
    <ScreenWithHeader headerProps={{ font: 'inter-bold', text: title || 'Conteúdos da aula' }}>
      <LessonFilesContainer>
        {archives.length === 0 ? (
          <LessonFilesEmptyContainer>
            <GroupDataText color="#8F8F8F" size="14px" font="inter-regular">
              Nenhum arquivo encontrado para esta aula.
            </GroupDataText>
          </LessonFilesEmptyContainer>
        ) : (
          <>
            <View style={{ paddingBottom: 12, alignItems: 'center' }}>
              <GroupDataText color="#8F8F8F" size="12px" font="inter-regular">
                Toque no card para baixar/visualizar
              </GroupDataText>
            </View>
            <LessonFilesList>
              <LessonFilesGrid>
                {archives.map((archive) => {
                  const isPreviewableImage =
                    archive.mimeType?.startsWith('image/') && !archive.mimeType.includes('svg');
                  let imageUri: string | null = null;
                  if (isPreviewableImage) {
                    imageUri = archive.contentBase64.startsWith('data:')
                      ? archive.contentBase64
                      : `data:${archive.mimeType};base64,${archive.contentBase64}`;
                  }
                  return (
                    <LessonFileCard
                      key={archive.id}
                      onPress={() => handlePressFile(archive)}
                      testID={`lesson-file-${archive.id}`}>
                      {isPreviewableImage && imageUri ? (
                        <LessonFilePreviewImage source={{ uri: imageUri }} />
                      ) : (
                        <LessonFileIconContainer>
                          <ArchiveIcon width={32} height={32} />
                        </LessonFileIconContainer>
                      )}
                      <View style={{ alignItems: 'center', width: '100%' }}>
                        <LessonFileName numberOfLines={2} ellipsizeMode="tail">
                          {archive.name}
                        </LessonFileName>
                        <LessonFileType>{archive.mimeType.split('/').pop()}</LessonFileType>
                      </View>
                    </LessonFileCard>
                  );
                })}
              </LessonFilesGrid>
            </LessonFilesList>
          </>
        )}
      </LessonFilesContainer>
    </ScreenWithHeader>
  );
}
