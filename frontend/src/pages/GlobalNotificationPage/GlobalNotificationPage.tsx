import { useFonts } from 'expo-font';
import { ToastAndroid, View } from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import { useEffect, useState } from 'react';
import HeaderCustom from '../../components/HeaderCustom/HeaderCustom';
import ErrorWarning from '../../components/ErrorWarning/ErrorWarning';
import ButtonCustom from '../../components/ButtonCustom/ButtonCustom';
import api from '../../services/api';
import { storage } from '../SignIn/SignIn';
import BigInputTextCustom from '../../components/BigInputText/BigInputText';
import { GlobalNotificationContainer, toastConfig } from './GlobalNotificationPageStyle';
import Toast from 'react-native-toast-message';

export default function GlobalNotificationPage({ navigation }: any) {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({});
  const [loggedIdState, setLoggedIdState] = useState('');
  const [accessTokenState, setAccessTokenState] = useState('');
  const [userInfo, setUserInfo] = useState(null);

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
  const onSubmit = async (data: any) => {
    try {
      const response = await api.post(
        '/notifications/global',
        {
          type: 'WARNING',
          senderId: loggedIdState,
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
      setTimeout(() => {
        navigation.goBack();
      }, 500);
    } catch (error) {
      console.error('Erro ao enviar comunicado:', error);
      Toast.show({
        type: 'error',
        text1: 'Erro ao enviar comunicado. Tente novamente mais tarde.',
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
      <HeaderCustom font="inter-bold" text="Comunicado" />
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
              label="Criar Comunicado"
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
          text="Publicar"
        />
      </GlobalNotificationContainer>
    </View>
  );
}
