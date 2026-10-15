/* eslint-disable global-require */
import React, { useRef, useState, useEffect } from 'react';
import { TouchableOpacity, View, Dimensions, ActivityIndicator } from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import { format } from 'date-fns';
import { Buffer } from 'buffer';
import * as DocumentPicker from 'expo-document-picker';
import Toast from 'react-native-toast-message';

import { StatusBar } from 'expo-status-bar';
import { TextInputMask } from 'react-native-masked-text';
import { useAuth } from '../../context/auth/useAuth';
import useFetch from '../../hooks/useFetch';
import LoadingState from '../../components/LoadingState/LoadingState';
import ErrorState from '../../components/ErrorState/ErrorState';
import DropdownComponent from '../../components/DropdownButton/DropdownCustom';
import { useSideMenu } from '../../context/SideMenuContext';
import {
  BlueBackground,
  BottomPart,
  EditImageButton,
  MiddlePart,
  NamePart,
  PencilButton,
  ProfilePic,
  UpperPart,
  WhiteBackground,
} from './EditProfileStyle';
import InputTextCustom from '../../components/InputText/InputTextCustom';
import ErrorWarning from '../../components/ErrorWarning/ErrorWarning';
import ButtonCustom from '../../components/ButtonCustom/ButtonCustom';
import { district, ethnicity, expertise } from './EditProfileData';
import BigInputTextCustom from '../../components/BigInputText/BigInputText';
import api from '../../services/api';
import Menu from '../../assets/menuw-icon.svg';
import BackButton from '../../components/BackButton/BackButton';
import EditButton from '../../assets/edit-button.svg';
import CalendarIcon from '../../assets/calendar-icon.svg';

export default function EditProfile() {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
  } = useForm({
    defaultValues: {
      phone: '',
      fullName: '',
      birthday: '',
      email: '',
      enterprise: '',
      bio: '',
      ethnicity: '',
      expertise: '',
      neighborhood: '',
    },
    mode: 'onSubmit',
  });
  const { width, height } = Dimensions.get('window');
  const defaultAvatar = require('../../assets/user-profile.png');
  const { loggedId } = useAuth();
  const onSubmit = async (data: any) => {
    try {
      const formattedData = { ...data };

      if (formattedData.birthday) {
        const [day, month, year] = formattedData.birthday.split('/');

        formattedData.birthday = new Date(`${year}-${month}-${day}`).toISOString();
      }

      if (!loggedId) {
        Toast.show({
          type: 'error',
          text1: 'Erro',
          text2: 'Você precisa estar logado para salvar as alterações.',
        });
        return;
      }

      await api.patch('/user', formattedData);

      Toast.show({
        type: 'success',
        text1: 'Perfil atualizado!',
        text2: 'Suas alterações foram salvas com sucesso.',
      });
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        'Não foi possível salvar suas alterações. Tente novamente.';

      Toast.show({
        type: 'error',
        text1: 'Erro ao salvar',
        text2: Array.isArray(message) ? message.join('\n') : message,
      });
    }
  };

  const phoneInputRef = useRef<TextInputMask | null>(null);

  const validatePhoneNumber = () => {
    if (!phoneInputRef.current) {
      return 'Telefone inválido';
    }

    const rawValue = (phoneInputRef.current as any).getRawValue();

    if (!rawValue || rawValue.length < 11) {
      return 'Telefone inválido';
    }

    return true;
  };

  const { toggleMenu } = useSideMenu();
  const [profileData, setProfileData] = useState<any>(null);

  const defaultProfImage = require('../../assets/test-profile-icon.png');

  const pickFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['image/*'],
        multiple: false,
      });

      if (result.assets && result.assets.length > 0) {
        const file = result.assets[0];

        const image = {
          uri: file.uri,
          name: file.name,
          type: file.mimeType || 'image/jpeg',
        };

        if (!loggedId) {
          Toast.show({
            type: 'error',
            text1: 'Você precisa estar logado para atualizar a imagem.',
          });
          return;
        }

        const formData = new FormData();
        formData.append('file', image as any);

        await api.patch('/user/profile-picture', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        setProfileData((prev: any) => ({
          ...prev,
          profileImage: { uri: image.uri },
        }));

        Toast.show({
          type: 'success',
          text1: 'Imagem atualizada com sucesso!',
        });
      } else {
        Toast.show({
          type: 'error',
          text1: 'Nenhum arquivo selecionado.',
        });
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Erro ao enviar imagem.',
      });
    }
  };

  const formatDateToDDMMYYYY = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, 'dd/MM/yyyy'); // Using date-fns for formatting (optional)
  };

  const userQuery = useFetch(
    () => api.get(`/user/${loggedId}`).then((response) => response.data),
    [loggedId],
    { enabled: !!loggedId },
  );

  const imageQuery = useFetch(
    () =>
      api
        .get(`/user/${loggedId}/profile-picture`, { responseType: 'arraybuffer' })
        .then((imageResponse) => {
          const imageStr = Buffer.from(imageResponse.data, 'binary').toString('base64');
          return { uri: `data:image/jpeg;base64,${imageStr}` };
        }),
    [loggedId],
    { enabled: !!loggedId },
  );

  useEffect(() => {
    const userData = userQuery.data;
    if (!userData) {
      return;
    }

    const profileInfo = {
      profileImage: defaultProfImage,
      phone: userData.phone || '',
      fullName: userData.fullName || '',
      email: userData.email || '',
      ethnicity: userData.ethnicity || '',
      birthday: userData.birthday ? formatDateToDDMMYYYY(userData.birthday) : '',
      bio: userData.bio || '',
      expertise: userData.expertise || '',
      neighborhood: userData.neighborhood || '',
      enterprise: userData.enterprise || '',
    };

    setProfileData((prev: any) => ({
      ...profileInfo,
      profileImage: prev?.profileImage ?? profileInfo.profileImage,
    }));

    setValue('phone', profileInfo.phone);
    setValue('fullName', profileInfo.fullName);
    setValue('email', profileInfo.email);
    setValue('birthday', profileInfo.birthday);
    setValue('enterprise', profileInfo.enterprise);
    setValue('bio', profileInfo.bio);
    setValue('ethnicity', profileInfo.ethnicity);
    setValue('expertise', profileInfo.expertise);
    setValue('neighborhood', profileInfo.neighborhood);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userQuery.data, setValue]);

  useEffect(() => {
    if (imageQuery.data) {
      setProfileData((prev: any) => ({
        ...prev,
        profileImage: imageQuery.data,
      }));
    } else if (imageQuery.error && !imageQuery.data) {
      setProfileData((prev: any) => ({
        ...prev,
        profileImage: defaultAvatar,
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageQuery.data, imageQuery.error]);

  const pageHeader = (
    <View
      style={{
        position: 'absolute',
        top: height * 0.054,
        left: width * 0.058,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 24,
        zIndex: 10,
      }}>
      <TouchableOpacity onPress={toggleMenu}>
        <Menu width={24} height={24} />
      </TouchableOpacity>
      <BackButton />
    </View>
  );

  if (userQuery.loading && !userQuery.data) {
    return (
      <BlueBackground>
        {pageHeader}
        <LoadingState />
      </BlueBackground>
    );
  }

  if (!!userQuery.error && !userQuery.data) {
    return (
      <BlueBackground>
        {pageHeader}
        <ErrorState text="Erro ao carregar os dados do perfil." onRetry={userQuery.refetch} />
      </BlueBackground>
    );
  }

  const onInvalid = (validationErrors: any) => {
    Toast.show({
      type: 'error',
      text1: 'Verifique os campos',
      text2: Object.values(validationErrors)
        .map((error: any) => error?.message)
        .filter(Boolean)
        .join('\n'),
    });
  };

  return (
    <BlueBackground>
      <StatusBar />
      {pageHeader}
      <WhiteBackground>
        <UpperPart>
          <EditImageButton
            testID="edit-profile-picture-button"
            onPress={() => {
              pickFile();
            }}
          />
          <ProfilePic source={profileData ? profileData.profileImage : defaultProfImage} />
          <PencilButton>
            <TouchableOpacity onPress={() => {}}>
              <EditButton width={24} height={24} />
            </TouchableOpacity>
          </PencilButton>
          <Controller
            control={control}
            name="phone"
            render={({ field: { onChange, value } }) => (
              <InputTextCustom
                onChangeText={onChange}
                value={value}
                label="Telefone"
                imageIcon={null}
                type="cel-phone"
                innerRef={(input: TextInputMask) => {
                  phoneInputRef.current = input;
                }}
              />
            )}
            rules={{
              required: 'Telefone obrigatório!',
              validate: validatePhoneNumber,
            }}
          />
          {errors.phone && <ErrorWarning errorText={errors.phone.message} />}
        </UpperPart>
        <View style={{ gap: width * 0.035, marginBottom: 10 }}>
          <NamePart>
            <Controller
              control={control}
              name="fullName"
              rules={{
                required: 'Campo obrigatório',
                pattern: {
                  value: /^[A-Za-zÀ-ÿ\s]+$/,
                  message: 'Apenas letras são permitidas',
                },
              }}
              render={({ field: { onChange, value } }) => (
                <>
                  <InputTextCustom
                    onChangeText={onChange}
                    value={value}
                    label="Nome"
                    imageIcon={null}
                  />
                  {errors.fullName && <ErrorWarning errorText={errors.fullName.message} />}
                </>
              )}
            />
          </NamePart>
          <MiddlePart>
            <Controller
              control={control}
              name="birthday"
              rules={{
                required: 'Campo obrigatório',
                validate: (value) => {
                  if (!value || value.length !== 10) {
                    return 'Data de nascimento inválida';
                  }

                  const [day, month, year] = value.split('/').map(Number);

                  const date = new Date(year, month - 1, day);

                  const isValid =
                    date.getFullYear() === year &&
                    date.getMonth() === month - 1 &&
                    date.getDate() === day;

                  return isValid || 'Data de nascimento inválida';
                },
              }}
              render={({ field: { onChange, value } }) => (
                <>
                  <InputTextCustom
                    onChangeText={(text: string) => {
                      onChange(text);
                    }}
                    value={value}
                    label="Data de Nascimento"
                    imageIcon={<CalendarIcon width={15} height={15} />}
                    type="datetime"
                    options={{ format: 'DD/MM/YYYY' }}
                  />

                  {errors.birthday && <ErrorWarning errorText={errors.birthday.message} />}
                </>
              )}
            />
          </MiddlePart>
          <BottomPart>
            <Controller
              control={control}
              name="email"
              rules={{
                required: 'Campo obrigatório',
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: 'Endereço de e-mail inválido',
                },
              }}
              render={({ field: { onChange, value } }) => (
                <>
                  <InputTextCustom
                    onChangeText={onChange}
                    value={value}
                    label="E-mail"
                    imageIcon={null}
                  />
                  {errors.email && <ErrorWarning errorText={errors.email.message} />}
                </>
              )}
            />
            <Controller
              control={control}
              name="ethnicity"
              rules={{
                required: 'Campo obrigatório',
              }}
              render={({ field: { onChange, value } }) => (
                <>
                  <DropdownComponent
                    data={ethnicity}
                    label="Etnia"
                    onChange={onChange}
                    value={value}
                  />

                  {errors.ethnicity && <ErrorWarning errorText={errors.ethnicity.message} />}
                </>
              )}
            />
            <Controller
              control={control}
              name="expertise"
              rules={{
                required: 'Campo obrigatório',
              }}
              render={({ field: { onChange, value } }) => (
                <>
                  <DropdownComponent
                    data={expertise}
                    label="Especialidade"
                    onChange={onChange}
                    value={value}
                  />
                  {errors.expertise && <ErrorWarning errorText={errors.expertise.message} />}
                </>
              )}
            />
            <Controller
              control={control}
              name="neighborhood"
              rules={{
                required: 'Campo obrigatório',
              }}
              render={({ field: { onChange, value } }) => (
                <>
                  <DropdownComponent
                    data={district}
                    label="Bairro"
                    onChange={onChange}
                    value={value}
                  />
                  {errors.neighborhood && <ErrorWarning errorText={errors.neighborhood.message} />}
                </>
              )}
            />
            <Controller
              control={control}
              name="bio"
              rules={{
                maxLength: { value: 500, message: 'Excedido o máximo de caracteres' },
              }}
              render={({ field: { onChange, value } }) => (
                <BigInputTextCustom
                  onChangeText={(text: string) => {
                    onChange(text);
                  }}
                  value={value}
                  label="Bio"
                  imageIcon={null}
                />
              )}
            />
            {errors.bio && <ErrorWarning errorText={errors.bio.message} />}
            <Controller
              control={control}
              name="enterprise"
              rules={{
                required: 'Campo obrigatório',
              }}
              render={({ field: { onChange, value } }) => (
                <>
                  <InputTextCustom
                    onChangeText={onChange}
                    value={value}
                    label="Empreendimento"
                    imageIcon={null}
                  />
                  {errors.enterprise && <ErrorWarning errorText={errors.enterprise.message} />}
                </>
              )}
            />
            {isSubmitting ? (
              <ActivityIndicator size="small" color="#32936F" />
            ) : (
              <ButtonCustom
                onPress={handleSubmit(onSubmit, onInvalid)}
                backColor="#32936F"
                fontColor="white"
                text="Salvar"
              />
            )}
          </BottomPart>
        </View>
      </WhiteBackground>
    </BlueBackground>
  );
}
