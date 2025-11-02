/* eslint-disable global-require */
import { useFonts } from 'expo-font';
import React, { useEffect, useRef, useState } from 'react';
import * as DocumentPicker from 'expo-document-picker';
import { ScrollView, View, Dimensions } from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import * as FileSystem from 'expo-file-system';
import { useRoute } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import HeaderCustom from '../../components/HeaderCustom/HeaderCustom';
import BigInputTextCustom from '../../components/BigInputText/BigInputText';
import ButtonCustom from '../../components/ButtonCustom/ButtonCustom';
import ErrorWarning from '../../components/ErrorWarning/ErrorWarning';
import { MiddlePart, NamePart } from '../EditProfile/EditProfileStyle';
import InputTextCustom from '../../components/InputText/InputTextCustom';
import { LinkPart, NewLessonContainer } from './NewLessonStyle';
import ArchiveCard from '../../components/ArchiveCard/ArchiveCard';
import { storage } from '../SignIn/SignIn';
import api from '../../services/api';
import { toastConfig } from '../GlobalNotificationPage/GlobalNotificationPageStyle';
import ArrowIcon from '../../assets/arrow-icon.svg';
import LinkIcon from '../../assets/input-link-icon.svg';
import CalendarIcon from '../../assets/calendar-icon.svg';

interface InputRef {
  getRawValue: () => string;
  isValid: () => boolean;
}

export default function NewLesson({ navigation }: any) {
  const route = useRoute();
  const { groupId } = route.params as { groupId: string };
  const [loggedIdState, setLoggedIdState] = useState('');
  const [accessTokenState, setAccessTokenState] = useState('');
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
    if (!accessTokenState) return;
    const fetchCategories = async () => {
      try {
        const response = await api.get(`category/group/${groupId}`, {
          headers: {
            Authorization: `Bearer ${accessTokenState}`,
          },
        });
        setCategories(response.data);
      } catch (error) {
        Toast.show({
          type: 'error',
          text1: 'Categoria não encontrada.',
        });
      }
    };
    fetchCategories();
  }, [accessTokenState, groupId]);

  useEffect(() => {
    const accessToken = storage.getString('accessToken');
    const loggedId = storage.getString('loggedId');
    if (loggedId && accessToken) {
      setAccessTokenState(accessToken);
      setLoggedIdState(loggedId);
      api.get(`/user/${loggedId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
    }
  }, []);
  function formatDate(date: string): string {
    const [day, month, year] = date.split('/');
    return `${year}-${month}-${day}`;
  }
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
      const response = await api.post(
        '/post',
        {
          type: 'CLASS',
          userId: loggedIdState,
          input: data.input,
          categoryId: selectedCategory.id,
          groupId,
          schedule: datetimeISO,
          title: data.title,
          urlLive: data.link,
          urlRecorded: data.vod,
        },
        {
          headers: {
            Authorization: `Bearer ${accessTokenState}`,
          },
        },
      );
      const { id } = response.data;
      await Promise.all(
        files.map(async (file) => {
          await api.post(
            '/archives',
            {
              name: file.name,
              userId: loggedIdState,
              mimeType: file.mimeType,
              groupId,
              contentBase64: file.uri,
              type: file.mimeType,
              postId: id,
            },
            {
              headers: {
                Authorization: `Bearer ${accessTokenState}`,
              },
            },
          );
        }),
      );
      Toast.show({
        type: 'success',
        text1: 'Aula criada com sucesso!',
      });
      setFiles([]);
      setTimeout(() => {
        navigation.goBack();
      }, 500);
    } catch (error) {
      setFiles([]);
      console.error('Erro ao enviar post:', error);
      Toast.show({
        type: 'error',
        text1: 'Erro ao criar aula. Tente novamente mais tarde.',
      });
    }
  };

  const dateRef = useRef<InputRef | null>(null);
  const hourRef = useRef<InputRef | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({});
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
  const [fontsLoaded] = useFonts({
    'inter-regular': require('../../fonts/Inter-Regular.ttf'),
    'inter-semibold': require('../../fonts/Inter-SemiBold.ttf'),
    'inter-bold': require('../../fonts/Inter-Bold.ttf'),
  });
  if (!fontsLoaded) {
    return undefined;
  }
  const { width } = Dimensions.get('window');
  return (
    <ScrollView
      style={{ backgroundColor: '#f2f6fa', minHeight: '100%' }}
      contentContainerStyle={{ minHeight: '100%' }}>
      {' '}
      <HeaderCustom font="inter-bold" text="Publicação" />
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
                  innerRef={(value: any) => (dateRef.current = value)}
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
                  innerRef={(value: null) => (hourRef.current = value)}
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
                imageIcon={LinkIcon}
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
          {errors.description && <ErrorWarning errorText="Campo obrigatório" />}
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
          <Toast config={toastConfig} />
          <ButtonCustom
            testID="btn-publish"
            onPress={handleSubmit(onSubmit)}
            backColor="#160E47"
            fontColor="white"
            text="Publicar"
            rightIcon={<ArrowIcon />}
          />
        </LinkPart>
      </NewLessonContainer>
    </ScrollView>
  );
}
