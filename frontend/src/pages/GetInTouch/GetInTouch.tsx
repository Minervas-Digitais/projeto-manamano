/* eslint-disable global-require */
import { useFonts } from 'expo-font';
import { Controller, useForm } from 'react-hook-form';
import { Alert, View } from 'react-native';
import React, { useEffect, useState } from 'react';
import HeaderCustom from '../../components/HeaderCustom/HeaderCustom';
import { SignInForm, SignInInputContainer } from '../SignIn/SignInStyle';
import InputTextCustom from '../../components/InputText/InputTextCustom';
import ButtonCustom from '../../components/ButtonCustom/ButtonCustom';
import ErrorWarning from '../../components/ErrorWarning/ErrorWarning';
import { RedText, SemiBoldRedText } from './GetInTouchStyle';
import BigInputTextCustom from '../../components/BigInputText/BigInputText';
import secureStorage from '../../services/secureStorage';
import api from '../../services/api';
import ArrowIcon from '../../assets/arrow-icon.svg';

export default function GetInTouch() {
  const [loggedIdState, setLoggedIdState] = useState('');
  const [accessTokenState, setAccessTokenState] = useState('');
  useEffect(() => {
    const fetchData = async () => {
      const accessToken = await secureStorage.getItem('accessToken');
      const loggedId = await secureStorage.getItem('loggedId');
      if (loggedId && accessToken) {
        setAccessTokenState(accessToken);
        setLoggedIdState(loggedId);
        api.get(`/user/${loggedId}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
      }
    };

    fetchData();
  }, []);
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({});
  const onSubmit = async (data: any) => {
    try {
      const response = await api.post(
        '/mail',
        {
          userId: loggedIdState,
          subject: data.subject,
          text: data.getintouch,
        },
        {
          headers: {
            Authorization: `Bearer ${accessTokenState}`,
          },
        },
      );
      Alert.alert('Mensagem enviada com sucesso!');
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      Alert.alert('Erro ao enviar mensagem. Tente novamente mais tarde.');
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
        flex: 1,
        backgroundColor: '#f2f6fa',
        display: loggedIdState && accessTokenState ? 'flex' : 'none',
      }}>
      <HeaderCustom font="inter-bold" text="Fale Conosco" />
      <SignInForm>
        <SignInInputContainer style={{ gap: 30 }}>
          <Controller
            control={control}
            name="subject"
            rules={{
              required: true,
            }}
            render={({ field: { onChange, value } }) => (
              <InputTextCustom
                onChangeText={onChange}
                value={value}
                label="Assunto"
                imageIcon={null}
              />
            )}
          />
          {errors.subject && <ErrorWarning errorText="Campo obrigatório" />}
          <Controller
            control={control}
            name="getintouch"
            rules={{
              required: true,
            }}
            render={({ field: { onChange, value } }) => (
              <BigInputTextCustom
                onChangeText={onChange}
                value={value}
                label="Mensagem"
                imageIcon={null}
              />
            )}
          />
          {errors.getintouch && <ErrorWarning errorText="Campo obrigatório" />}
          <ButtonCustom
            onPress={handleSubmit(onSubmit)}
            backColor="#160E47"
            fontColor="white"
            text="Enviar"
            rightIcon={ArrowIcon}
          />
          <RedText font="inter-regular">
            * Sua mensagem será
            <SemiBoldRedText font="inter-semibold"> encaminhada </SemiBoldRedText>
            para o <SemiBoldRedText font="inter-semibold">e-mail do ManaMano.</SemiBoldRedText>{' '}
            Portanto, caso necessário,{' '}
            <SemiBoldRedText font="inter-semibold">
              confira seu e-mail para obter respostas.{' '}
            </SemiBoldRedText>
          </RedText>
        </SignInInputContainer>
      </SignInForm>
    </View>
  );
}
