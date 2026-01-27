import { useFonts } from 'expo-font';
import { View } from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import React, { useEffect, useState } from 'react';
import Toast from 'react-native-toast-message';
import { useRoute } from '@react-navigation/native';
import HeaderCustom from '../../components/HeaderCustom/HeaderCustom';
import ErrorWarning from '../../components/ErrorWarning/ErrorWarning';
import ButtonCustom from '../../components/ButtonCustom/ButtonCustom';
import api from '../../services/api';
import { storage } from '../SignIn/SignIn';
import BigInputTextCustom from '../../components/BigInputText/BigInputText';
import { GlobalNotificationContainer, toastConfig } from './GlobalNotificationPageStyle';

export default function GlobalNotificationPage({ navigation }: any) {
  const route = useRoute();
  const { id, body } = route.params as { id: string; body?: string };
  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm({});
  const [loggedIdState, setLoggedIdState] = useState('');
  const [accessTokenState, setAccessTokenState] = useState('');
  const [existingNotification, setExistingNotification] = useState<any>(null);

  useEffect(() => {
    const accessToken = storage.getString('accessToken');
    const loggedId = storage.getString('loggedId');

    if (loggedId && accessToken) {
      setAccessTokenState(accessToken);
      setLoggedIdState(loggedId);
      if (body) {
        api
          .get('/notifications/user', {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          })
          .then((response) => {
            const notification = response.data.find((notif: any) => notif.id === id);
            if (notification) {
              setExistingNotification(notification);
              setValue('input', notification.body);
            }
          });
      }

      api.get(`/user/${loggedId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
    }
  }, []);
  const onSubmit = async (data: any) => {
    try {
      let response;

      if (body && existingNotification) {
        response = await api.patch(
          `/notifications/update/${id}`,
          {
            body: data.input,
          },
          {
            headers: {
              Authorization: `Bearer ${accessTokenState}`,
            },
          },
        );
        Toast.show({
          type: 'success',
          text1: 'Comunicado atualizado com sucesso!',
        });
      } else {
        response = await api.post(
          '/notifications/global',
          {
            type: 'WARNING',
            body: data.input,
          },
          {
            headers: {
              Authorization: `Bearer ${accessTokenState}`,
            },
          },
        );
        Toast.show({
          type: 'success',
          text1: 'Comunicado enviado com sucesso!',
        });
      }

      setTimeout(() => {
        navigation.goBack();
      }, 500);
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: body ? 'Erro ao atualizar comunicado.' : 'Erro ao enviar comunicado.',
        text2: 'Tente novamente mais tarde.',
      });
    }
  };

  const [fontsLoaded] = useFonts({
    // eslint-disable-next-line global-require
    'inter-bold': require('../../fonts/Inter-Bold.ttf'),
  });
  if (!fontsLoaded) {
    return undefined;
  }
  return (
    <View style={{ flex: 1, backgroundColor: '#f2f6fa' }}>
      <HeaderCustom font="inter-bold" text={body ? 'Editar Comunicado' : 'Comunicado'} />
      <GlobalNotificationContainer>
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
              label={body ? 'Editar Comunicado' : 'Criar Comunicado'}
              imageIcon={null}
            />
          )}
        />
        {errors.input && <ErrorWarning errorText="Campo obrigatório" />}
        <Toast config={toastConfig} />
        <ButtonCustom
          onPress={handleSubmit(onSubmit)}
          backColor="#160E47"
          fontColor="white"
          text={body ? 'Atualizar' : 'Publicar'}
        />
      </GlobalNotificationContainer>
    </View>
  );
}
