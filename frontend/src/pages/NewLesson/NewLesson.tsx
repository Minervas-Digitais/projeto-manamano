/* eslint-disable global-require */
import React, { useEffect, useRef, useState } from 'react';
import * as DocumentPicker from 'expo-document-picker';
import { ScrollView, View, Dimensions } from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import * as FileSystem from 'expo-file-system';
import { useRoute } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import BigInputTextCustom from '../../components/BigInputText/BigInputText';
import ButtonCustom from '../../components/ButtonCustom/ButtonCustom';
import ErrorWarning from '../../components/ErrorWarning/ErrorWarning';
import { MiddlePart, NamePart } from '../EditProfile/EditProfileStyle';
import InputTextCustom from '../../components/InputText/InputTextCustom';
import { LinkPart, NewLessonContainer } from './NewLessonStyle';
import ArchiveCard from '../../components/ArchiveCard/ArchiveCard';
import api from '../../services/api';
import ArrowIcon from '../../assets/arrow-icon.svg';
import LinkIcon from '../../assets/input-link-icon.svg';
import CalendarIcon from '../../assets/calendar-icon.svg';
import ScreenWithHeader from '../../components/ScreenWithHeader/ScreenWithHeader';
import { useAuth } from '../../context/auth/useAuth';

interface InputRef {
  getRawValue: () => string;
  isValid: () => boolean;
}

export default function NewLesson({ navigation }: any) {
  const route = useRoute();
  const { loggedId } = useAuth();
  const { groupId, editData } = route.params as {
    groupId: string;
    editData?: {
      id: string;
      title: string;
      date: string | Date;
      urlLive: string;
      urlVOD: string;
      input: string;
    };
  };
  const isEditMode = !!editData;
  const [categories, setCategories] = useState<any[]>([]);
  const [files, setFiles] = useState<
    { id: number; name: string; uri: string; mimeType?: string }[]
  >([]);
  const [visibility, setVisibility] = useState<{ [key: number]: boolean }>({});
  const handleClick = (id: number) => {
    setFiles((prevFiles) => prevFiles.filter((file) => file.id !== id));
    setVisibility((prevState) => {
      const updatedState = { ...prevState };
      delete updatedState[id];
      return updatedState;
    });
  };
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

  const getInitialValues = () => {
    if (!isEditMode || !editData) return {};
    const d = new Date(editData.date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = String(d.getFullYear());
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return {
      title: editData.title,
      date: `${day}/${month}/${year}`,
      hour: `${hours}:${minutes}`,
      link: editData.urlLive,
      vod: editData.urlVOD,
      input: editData.input,
    };
  };

  const onSubmit = async (data: any) => {
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

      if (isEditMode && editData) {
        await api.patch(`/post/${editData.id}`, {
          title: data.title,
          input: data.input,
          schedule: datetimeISO,
          urlLive: data.link,
          urlRecorded: data.vod,
          groupId,
        });

        await Promise.all(
          files.map(async (file) => {
            await api.post('/archives', {
              name: file.name,
              mimeType: file.mimeType,
              groupId,
              contentBase64: file.uri,
              type: file.mimeType,
              postId: editData.id,
            });
          }),
        );

        Toast.show({
          type: 'success',
          text1: 'Aula atualizada com sucesso!',
        });
      } else {
        const response = await api.post('/post', {
          type: 'CLASS',
          input: data.input,
          categoryId: selectedCategory.id,
          groupId,
          schedule: datetimeISO,
          title: data.title,
          urlLive: data.link,
          urlRecorded: data.vod,
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
      }

      setFiles([]);
      setTimeout(() => {
        navigation.goBack();
      }, 500);
    } catch (error) {
      setFiles([]);
      console.error('Erro ao enviar post:', error);
      Toast.show({
        type: 'error',
        text1: isEditMode
          ? 'Erro ao atualizar aula.'
          : 'Erro ao criar aula. Tente novamente mais tarde.',
      });
    }
  };

  const dateRef = useRef<InputRef | null>(null);
  const hourRef = useRef<InputRef | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<any>({
    defaultValues: getInitialValues() as any,
  });
  const validateDate = () => {
    if (!dateRef.current) return 'Data inválida';
    const inputDate = new Date(dateRef.current.getRawValue());
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    if (!dateRef.current.isValid() || inputDate < currentDate) {
      return 'Data inválida';
    }
    return true;
  };
  const validateHour = () => {
    if (!dateRef.current) return 'Data inválida';
    if (!hourRef.current) return 'Hora inválida';
    const inputDate = new Date(dateRef.current.getRawValue());
    const currentDate = new Date();
    const currentHours = currentDate.getHours();
    const currentMinutes = currentDate.getMinutes();
    const currentHourMin = `${currentHours}:${currentMinutes}`;
    const inputDateHours = new Date(hourRef.current.getRawValue());
    const inputHours = inputDateHours.getHours();
    const inputMinutes = inputDateHours.getMinutes();
    const inputHourMin = `${inputHours}:${inputMinutes}`;
    currentDate.setHours(0, 0, 0, 0);
    if (!hourRef.current.isValid()) {
      return 'Hora inválida';
    }
    if (inputDate.getTime() === currentDate.getTime() && currentHourMin > inputHourMin) {
      return 'Esta hora já passou';
    }
    return true;
  };
  const pickFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        multiple: true,
      });

      if (result.assets && result.assets.length > 0) {
        const newFiles = await Promise.all(
          result.assets.map(async (file) => {
            const base64 = await FileSystem.readAsStringAsync(file.uri, {
              encoding: FileSystem.EncodingType.Base64,
            });
            return {
              id: Date.now() + Math.random(),
              name: file.name,
              uri: base64,
              mimeType: file.mimeType,
            };
          }),
        );
        setFiles((prevFiles) => [...prevFiles, ...newFiles]);
        setVisibility((prevState) => {
          const updatedVisibility = { ...prevState };
          newFiles.forEach((file) => {
            updatedVisibility[file.id] = false;
          });
          return updatedVisibility;
        });
      } else {
        Toast.show({
          type: 'error',
          text1: 'Nenhum arquivo selecionado.',
        });
      }
    } catch (error) {
      console.error('Erro ao selecionar os arquivos: ', error);
      Toast.show({
        type: 'error',
        text1: 'Erro ao selecionar os arquivos.',
      });
    }
  };
  const { width } = Dimensions.get('window');
  return (
    <ScreenWithHeader
      headerProps={{ font: 'inter-bold', text: isEditMode ? 'Editar aula' : 'Publicação' }}>
      <ScrollView
        style={{ backgroundColor: '#f2f6fa', minHeight: '100%' }}
        contentContainerStyle={{ minHeight: '100%' }}>
        {' '}
        <NewLessonContainer>
          <NamePart>
            <Controller
              control={control}
              name="title"
              rules={{
                required: 'Campo obrigatório',
              }}
              render={({ field: { onChange, value } }) => (
                <InputTextCustom
                  testID="input-title"
                  onChangeText={onChange}
                  value={value}
                  label="Título da aula"
                  imageIcon={null}
                />
              )}
            />
            {errors.title && <ErrorWarning errorText={errors.title.message} />}
          </NamePart>
          <MiddlePart>
            <View style={{ flex: 1, marginRight: width * 0.03135 }}>
              <Controller
                control={control}
                name="date"
                rules={{
                  required: 'Campo Obrigatório',
                  validate: validateDate,
                }}
                render={({ field: { onChange, value } }) => (
                  <InputTextCustom
                    testID="input-date"
                    onChangeText={onChange}
                    value={value}
                    label="Data"
                    imageIcon={<CalendarIcon />}
                    type="datetime"
                    options={{ format: 'DD/MM/YYYY' }}
                    innerRef={(input: any) => {
                      dateRef.current = input;
                    }}
                  />
                )}
              />
              {errors.date && <ErrorWarning errorText={errors.date.message} />}
            </View>
            <View style={{ flex: 1, marginLeft: width * 0.03135 }}>
              <Controller
                control={control}
                name="hour"
                rules={{
                  required: 'Campo Obrigatório',
                  validate: validateHour,
                }}
                render={({ field: { onChange, value } }) => (
                  <InputTextCustom
                    testID="input-hour"
                    onChangeText={onChange}
                    value={value}
                    label="Horário"
                    imageIcon={null}
                    type="datetime"
                    options={{ format: 'HH:mm' }}
                    innerRef={(input: null) => {
                      hourRef.current = input;
                    }}
                  />
                )}
              />
              {errors.hour && <ErrorWarning errorText={errors.hour.message} />}
            </View>
          </MiddlePart>
          <LinkPart>
            <Controller
              control={control}
              name="link"
              rules={{
                required: 'Campo obrigatório',
              }}
              render={({ field: { onChange, value } }) => (
                <InputTextCustom
                  testID="input-link"
                  onChangeText={onChange}
                  value={value}
                  label="Link"
                  imageIcon={<LinkIcon />}
                />
              )}
            />
            {errors.link && <ErrorWarning errorText={errors.link.message} />}
            <Controller
              control={control}
              name="vod"
              rules={{
                required: 'Campo obrigatório',
              }}
              render={({ field: { onChange, value } }) => (
                <InputTextCustom
                  testID="input-vod"
                  onChangeText={onChange}
                  value={value}
                  label="Aula gravada"
                  imageIcon={<LinkIcon />}
                />
              )}
            />
            {errors.vod && <ErrorWarning errorText={errors.vod.message} />}
            <Controller
              control={control}
              name="input"
              rules={{
                required: true,
              }}
              render={({ field: { onChange, value } }) => (
                <BigInputTextCustom
                  testID="input-description"
                  onChangeText={onChange}
                  value={value}
                  imageIcon={null}
                  label="Descrição da aula"
                />
              )}
            />
            {(errors as any).input && <ErrorWarning errorText="Campo obrigatório" />}
            <ScrollView
              showsHorizontalScrollIndicator={false}
              horizontal
              style={{ flex: 1, paddingTop: 10, paddingBottom: 10 }}
              contentContainerStyle={{ alignItems: 'center' }}>
              {files.map((item) => (
                <ArchiveCard
                  key={item.id}
                  name={item.name}
                  mimeType={item.mimeType}
                  uri={item.uri}
                  testID={`file-item-${item.id}`}
                  archive
                  removed={visibility[item.id]}
                  onPress={() => handleClick(item.id)}
                />
              ))}
              <ArchiveCard testID="btn-add-file" onClick={pickFile} />
            </ScrollView>
            <ButtonCustom
              testID="btn-publish"
              onPress={handleSubmit(onSubmit)}
              backColor="#160E47"
              fontColor="white"
              text={isEditMode ? 'Salvar' : 'Publicar'}
              rightIcon={<ArrowIcon />}
            />
          </LinkPart>
        </NewLessonContainer>
      </ScrollView>
    </ScreenWithHeader>
  );
}
