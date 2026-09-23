/* eslint-disable global-require */
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView } from 'react-native';
import { useRoute } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import ScreenWithHeader from '../../components/ScreenWithHeader/ScreenWithHeader';
import LessonForm, { LessonFormFile } from '../../components/LessonForm/LessonForm';
import { GroupDataText } from '../GroupData/GroupDataStyle';
import { EditLessonLoadingContainer } from './EditLessonStyle';
import api from '../../services/api';

type EditLessonRouteParams = {
  lessonId: string;
};

export default function EditLesson({ navigation }: any) {
  const route = useRoute();
  const { lessonId } = route.params as EditLessonRouteParams;
  const [loading, setLoading] = useState(true);
  const [initialValues, setInitialValues] = useState<any>(null);
  const [groupId, setGroupId] = useState<string>('');
  const [existingFiles, setExistingFiles] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const postRes = await api.get(`/post/${lessonId}`);
        const post = postRes.data;
        const gId = post.groupId;
        setGroupId(gId);

        const d = new Date(post.schedule ?? post.createdAt);
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = String(d.getFullYear());
        const hours = String(d.getHours()).padStart(2, '0');
        const minutes = String(d.getMinutes()).padStart(2, '0');

        setInitialValues({
          title: post.title ?? '',
          date: `${day}/${month}/${year}`,
          hour: `${hours}:${minutes}`,
          link: post.urlLive ?? '',
          vod: post.urlRecorded ?? '',
          input: post.input ?? post.content ?? '',
        });

        try {
          const archivesRes = await api.get(`/archives/post/${lessonId}`);
          setExistingFiles(archivesRes.data);
        } catch {
          setExistingFiles([]);
        }
      } catch (error) {
        Toast.show({ type: 'error', text1: 'Erro ao carregar dados da aula.' });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [lessonId]);

  function formatDate(date: string): string {
    const [day, month, year] = date.split('/');
    return `${year}-${month}-${day}`;
  }

  const onSubmit = async (data: any, files: LessonFormFile[]) => {
    // dirty check: não mandar request se nada mudou
    const isSame =
      initialValues &&
      data.title === initialValues.title &&
      data.date === initialValues.date &&
      data.hour === initialValues.hour &&
      data.link === initialValues.link &&
      (data.vod || '') === (initialValues.vod || '') &&
      data.input === initialValues.input &&
      files.length === 0;

    if (isSame) {
      Toast.show({ type: 'info', text1: 'Nenhuma alteração detectada.' });
      return;
    }

    try {
      const formattedDate = formatDate(data.date);
      const datetimeISO = new Date(`${formattedDate}T${data.hour}:00`).toISOString();

      // só faz PATCH se houve alteração nos campos
      const hasFieldChanges =
        !initialValues ||
        data.title !== initialValues.title ||
        data.date !== initialValues.date ||
        data.hour !== initialValues.hour ||
        data.link !== initialValues.link ||
        (data.vod || '') !== (initialValues.vod || '') ||
        data.input !== initialValues.input;

      if (hasFieldChanges) {
        await api.patch(`/post/${lessonId}`, {
          title: data.title,
          input: data.input,
          schedule: datetimeISO,
          urlLive: data.link,
          urlRecorded: data.vod || undefined,
          groupId,
        });
      }

      if (files.length > 0) {
        await Promise.all(
          files.map(async (file) => {
            await api.post('/archives', {
              name: file.name,
              mimeType: file.mimeType,
              groupId,
              contentBase64: file.uri,
              type: file.mimeType,
              postId: lessonId,
            });
          }),
        );
      }

      Toast.show({ type: 'success', text1: 'Aula atualizada com sucesso!' });
      setTimeout(() => {
        if (navigation.canGoBack?.()) navigation.goBack();
      }, 500);
    } catch (error) {
      console.error('Erro ao atualizar aula:', error);
      Toast.show({ type: 'error', text1: 'Erro ao atualizar aula.' });
    }
  };

  if (loading) {
    return (
      <ScreenWithHeader headerProps={{ font: 'inter-bold', text: 'Editar aula' }}>
        <EditLessonLoadingContainer>
          <ActivityIndicator size="large" color="#EF4036" />
          <GroupDataText color="#8F8F8F" size="12px" font="inter-regular" style={{ marginTop: 8 }}>
            Carregando dados da aula...
          </GroupDataText>
        </EditLessonLoadingContainer>
      </ScreenWithHeader>
    );
  }

  return (
    <ScreenWithHeader headerProps={{ font: 'inter-bold', text: 'Editar aula' }}>
      <ScrollView
        style={{ backgroundColor: '#f2f6fa', minHeight: '100%' }}
        contentContainerStyle={{ minHeight: '100%', paddingBottom: 20 }}>
        <LessonForm
          defaultValues={initialValues}
          onSubmit={onSubmit}
          submitLabel="Salvar"
          validationMode="edit"
          existingFiles={existingFiles}
        />
      </ScrollView>
    </ScreenWithHeader>
  );
}
