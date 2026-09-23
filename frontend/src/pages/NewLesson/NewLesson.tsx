/* eslint-disable global-require */
import React, { useEffect, useState } from 'react';
import { ScrollView } from 'react-native';
import { useRoute } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import ScreenWithHeader from '../../components/ScreenWithHeader/ScreenWithHeader';
import LessonForm, { LessonFormFile } from '../../components/LessonForm/LessonForm';
import api from '../../services/api';
import { useAuth } from '../../context/auth/useAuth';

export default function NewLesson({ navigation }: any) {
  const route = useRoute();
  const { loggedId } = useAuth();
  const { groupId } = route.params as {
    groupId: string;
  };
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    if (!loggedId) return;
    const fetchCategories = async () => {
      try {
        const response = await api.get(`/category/group/${groupId}`);
        setCategories(response.data);
      } catch (error) {
        Toast.show({
          type: 'error',
          text1: 'Categoria não encontrada.',
        });
      }
    };
    fetchCategories();
  }, [loggedId, groupId]);

  function formatDate(date: string): string {
    const [day, month, year] = date.split('/');
    return `${year}-${month}-${day}`;
  }

  const onSubmit = async (data: any, files: LessonFormFile[]) => {
    const selectedCategory = categories.find((category) => category.name === 'Aulas');

    if (!selectedCategory) {
      Toast.show({
        type: 'error',
        text1: 'Categoria "Aulas" não encontrada.',
      });
      return;
    }
    try {
      const formattedDate = formatDate(data.date);
      const datetimeISO = new Date(`${formattedDate}T${data.hour}:00`).toISOString();

      const response = await api.post('/post', {
        type: 'CLASS',
        input: data.input,
        categoryId: selectedCategory.id,
        groupId,
        schedule: datetimeISO,
        title: data.title,
        urlLive: data.link,
        urlRecorded: data.vod || undefined,
      });
      const { id } = response.data;
      await Promise.all(
        files.map(async (file) => {
          await api.post('/archives', {
            name: file.name,
            mimeType: file.mimeType,
            groupId,
            contentBase64: file.uri,
            type: file.mimeType,
            postId: id,
          });
        }),
      );
      Toast.show({
        type: 'success',
        text1: 'Aula criada com sucesso!',
      });

      setTimeout(() => {
        if (navigation.canGoBack?.()) navigation.goBack();
      }, 500);
    } catch (error) {
      console.error('Erro ao enviar post:', error);
      Toast.show({
        type: 'error',
        text1: 'Erro ao criar aula. Tente novamente mais tarde.',
      });
    }
  };

  return (
    <ScreenWithHeader headerProps={{ font: 'inter-bold', text: 'Publicação' }}>
      <ScrollView
        style={{ backgroundColor: '#f2f6fa', minHeight: '100%' }}
        contentContainerStyle={{ minHeight: '100%' }}>
        <LessonForm onSubmit={onSubmit} submitLabel="Publicar" validationMode="create" />
      </ScrollView>
    </ScreenWithHeader>
  );
}
