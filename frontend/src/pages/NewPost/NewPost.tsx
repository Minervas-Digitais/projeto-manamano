/* eslint-disable global-require */
import { useFonts } from 'expo-font';
import React, { useEffect, useRef, useState } from 'react';
import { useRoute } from '@react-navigation/native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { View, ScrollView, Dimensions } from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import Toast from 'react-native-toast-message';
import HeaderCustom from '../../components/HeaderCustom/HeaderCustom';
import CategoryButton from '../../components/CategoryButton/CategoryButton';
import { GroupPageCategoryContainer, GroupPageCategoryList } from '../GroupPage/GroupPageStyle';
import { GroupDataText } from '../GroupData/GroupDataStyle';
import {
  BottomPartContainer,
  LinkIcon,
  NewEventInputContainer,
  NewPostContainer,
  NewPostInputContainer,
  NewPostInputTextContainer,
} from './NewPostStyle';
import BigInputTextCustom from '../../components/BigInputText/BigInputText';
import ButtonCustom from '../../components/ButtonCustom/ButtonCustom';
import ErrorWarning from '../../components/ErrorWarning/ErrorWarning';
import { MiddlePart, NamePart } from '../EditProfile/EditProfileStyle';
import InputTextCustom from '../../components/InputText/InputTextCustom';
import api from '../../services/api';
import { storage } from '../SignIn/SignIn';
import NewPostArchive from '../../components/NewPostArchive/NewPostArchive';
import { toastConfig } from '../GlobalNotificationPage/GlobalNotificationPageStyle';
import ArrowIcon from '../../assets/arrow-icon.svg';
import linkIcon from '../../assets/comment-link-icon.svg';
import AttachmentIcon from '../../assets/add-attachment-icon.svg';
import CalendarIcon from '../../assets/calendar-icon.svg';

export default function NewPost({ navigation }: any) {
  const { width, height } = Dimensions.get('window');
  const route = useRoute();
  const { groupId } = route.params as { groupId: string };
  console.log('groupId no paramns', groupId);

  const [files, setFiles] = useState<
    { id: number; name: string; uri: string; mimeType?: string }[]
  >([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategoryType, setSelectedCategoryType] = useState<string | null>(null);
  const [filterPosts, setFilterPosts] = useState('Geral');
  const dateRef = useRef(null);
  const hourRef = useRef(null);
  const [loggedIdState, setLoggedIdState] = useState('');
  const [accessTokenState, setAccessTokenState] = useState('');
  const [visibility, setVisibility] = useState({});
  const handleClick = (id) => {
    setFiles((prevFiles) => prevFiles.filter((file) => file.id !== id));
    setVisibility((prevState) => {
      const updatedState = { ...prevState };
      delete updatedState[id];
      return updatedState;
    });
  };

  useEffect(() => {
    const selectedCategory = categories.find((category) => category.name === filterPosts);
    setSelectedCategoryType(selectedCategory ? selectedCategory.type : null);
  }, [filterPosts, categories]);
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
      // .then((res) => console.log(JSON.stringify(res.data)));
    }
  }, []);
  useEffect(() => {
    if (!accessTokenState) return;
    const fetchCategories = async () => {
      try {
        console.log('groupId:', groupId);

        const response = await api.get(`category/group/${groupId}`, {
          headers: {
            Authorization: `Bearer ${accessTokenState}`,
          },
        });
        console.log('Categorias carregadas:', response.data);

        setCategories(response.data);
      } catch (error) {
        console.error('Erro ao buscar categorias', error);
        Toast.show({
          type: 'error',
          text1: 'Erro ao buscar categorias.',
        });
      }
    };
    fetchCategories();
  }, [accessTokenState, groupId]);
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({});
  function formatDate(date: string): string {
    const [day, month, year] = date.split('/');
    return `${year}-${month}-${day}`;
  }
  const onSubmit = async (data: any) => {
    const selectedCategory = categories.find((category) => category.name === filterPosts);
    if (!selectedCategory) {
      Toast.show({
        type: 'error',
        text1: 'Categoria não encontrada.',
      });
      return;
    }
    const categoryId = selectedCategory.id;
    if (selectedCategoryType !== 'EVENT') {
      try {
        const response = await api.post(
          '/post',
          {
            type: 'NORMAL',
            userId: loggedIdState,
            input: data.input,
            categoryId,
            groupId,
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
          text1: 'Publicação enviada com sucesso!',
        });
        setFiles([]);
        setTimeout(() => {
          navigation.goBack();
        }, 500);
      } catch (error) {
        console.error('Erro ao enviar publicação:', error);
        setFiles([]);
        Toast.show({
          type: 'error',
          text1: 'Erro ao enviar publicação. Tente novamente mais tarde.',
        });
      }
    } else {
      const formattedDate = formatDate(data.date);
      const datetimeISO = `${formattedDate}T${data.hour}:00.000Z`;
      try {
        const response = await api.post(
          '/post',
          {
            type: 'EVENT',
            userId: loggedIdState,
            input: data.input,
            categoryId,
            groupId,
            schedule: datetimeISO,
            title: data.title,
          },
          {
            headers: {
              Authorization: `Bearer ${accessTokenState}`,
            },
          },
        );
        Toast.show({
          type: 'success',
          text1: 'Publicação enviada com sucesso!',
        });
        setTimeout(() => {
          navigation.goBack();
        }, 500);
      } catch (error) {
        console.error('Erro ao enviar publicação:', error);
        Toast.show({
          type: 'error',
          text1: 'Erro ao enviar publicação. Tente novamente mais tarde.',
        });
      }
    }
  };
  const validateDate = () => {
    const inputDate = new Date(dateRef.current.getRawValue());
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    if (!dateRef.current.isValid() || inputDate < currentDate) {
      return 'Data inválida';
    }
    return true;
  };
  const validateHour = () => {
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
  return (
    <View
      style={{
        backgroundColor: '#f2f6fa',
        height: '100%',
        display: loggedIdState && accessTokenState ? 'flex' : 'none',
      }}>
      <HeaderCustom font="inter-bold" text="Publicação" />
      <NewPostContainer>
        <GroupPageCategoryContainer>
          <GroupDataText color="#4E4E4E" font="inter-semiBold" size="18px">
            Categoria
          </GroupDataText>
          <GroupPageCategoryList>
            {categories
              .filter((category) => category.name !== 'Aulas')
              .map((category) => (
                <CategoryButton
                  categoryName={category.name}
                  onPress={() => setFilterPosts(category.name)}
                  filter={filterPosts}
                />
              ))}
          </GroupPageCategoryList>
        </GroupPageCategoryContainer>
        {selectedCategoryType !== 'EVENT' ? (
          <NewPostInputContainer>
            <NewPostInputTextContainer>
              <Controller
                control={control}
                name="input"
                rules={{
                  required: true,
                }}
                render={({ field: { onChange, value } }) => (
                  <BigInputTextCustom onChangeText={onChange} value={value} imageIcon={null} />
                )}
              />
              {errors.input && <ErrorWarning errorText="Campo obrigatório" />}
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <ScrollView
                  horizontal
                  contentContainerStyle={{
                    flexDirection: 'row',
                    flexGrow: 1,
                    gap: 10,
                    maxWidth: 300,
                  }}>
                  {files.map((item: any) => (
                    <NewPostArchive
                      key={item.id}
                      name={item.name}
                      archive
                      removed={visibility[item.id]}
                      onPress={() => handleClick(item.id)}
                    />
                  ))}
                </ScrollView>
                <LinkIcon onPress={pickFile}>
                  <AttachmentIcon />
                </LinkIcon>
              </View>
              <Toast config={toastConfig} />
            </NewPostInputTextContainer>
            <View style={{ paddingBottom: 30 }}>
              <ButtonCustom
                onPress={handleSubmit(onSubmit)}
                backColor="#160E47"
                fontColor="white"
                text="Publicar"
                rightIcon={<ArrowIcon />}
              />
            </View>
          </NewPostInputContainer>
        ) : (
          <NewEventInputContainer>
            <NamePart>
              <Controller
                control={control}
                name="title"
                rules={{
                  required: 'Campo obrigatório',
                }}
                render={({ field: { onChange, value } }) => (
                  <InputTextCustom
                    onChangeText={onChange}
                    value={value}
                    label="Título"
                    imageIcon={null}
                  />
                )}
              />
              {errors.title && <ErrorWarning errorText={errors.title.message} />}
            </NamePart>
            <MiddlePart>
              <View style={{ flex: 1, marginRight: `${width * 0.03135}` }}>
                <Controller
                  control={control}
                  name="date"
                  rules={{
                    required: 'Campo Obrigatório',
                    validate: validateDate,
                  }}
                  render={({ field: { onChange, value } }) => (
                    <InputTextCustom
                      onChangeText={onChange}
                      value={value}
                      label="Data"
                      imageIcon={<CalendarIcon />}
                      type="datetime"
                      options={{ format: 'DD/MM/YYYY' }}
                      innerRef={(value) => (dateRef.current = value)}
                    />
                  )}
                />
                {errors.date && <ErrorWarning errorText={errors.date.message} />}
              </View>
              <View style={{ flex: 1, marginLeft: `${width * 0.03135}` }}>
                <Controller
                  control={control}
                  name="hour"
                  rules={{
                    required: 'Campo Obrigatório',
                    validate: validateHour,
                  }}
                  render={({ field: { onChange, value } }) => (
                    <InputTextCustom
                      onChangeText={onChange}
                      value={value}
                      label="Horário"
                      imageIcon={null}
                      type="datetime"
                      options={{ format: 'HH:mm' }}
                      innerRef={(value) => (hourRef.current = value)}
                    />
                  )}
                />
                {errors.hour && <ErrorWarning errorText={errors.hour.message} />}
              </View>
            </MiddlePart>
            <Toast config={toastConfig} />
            <BottomPartContainer>
              <Controller
                control={control}
                name="input"
                rules={{
                  required: true,
                }}
                render={({ field: { onChange, value } }) => (
                  <BigInputTextCustom
                    onChangeText={onChange}
                    value={value}
                    imageIcon={null}
                    label="Descrição"
                  />
                )}
              />
              {errors.input && <ErrorWarning errorText="Campo obrigatório" />}
              <ButtonCustom
                onPress={handleSubmit(onSubmit)}
                backColor="#160E47"
                fontColor="white"
                text="Publicar"
                rightIcon={<ArrowIcon />}
              />
            </BottomPartContainer>
          </NewEventInputContainer>
        )}
      </NewPostContainer>
    </View>
  );
}
