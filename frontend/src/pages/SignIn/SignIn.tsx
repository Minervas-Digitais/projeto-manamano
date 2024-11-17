/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-alert */
/* eslint-disable global-require */
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useFonts } from 'expo-font';
import { Image, View } from 'react-native';
import { MMKV } from 'react-native-mmkv';
import ErrorWarning from '../../components/ErrorWarning/ErrorWarning';
import { SignInContainer, SignInForm, SignInInputContainer } from './SignInStyle';
import ButtonCustom from '../../components/ButtonCustom/ButtonCustom';
import InputTextCustom from '../../components/InputText/InputTextCustom';
import BackButton from '../../components/BackButton/BackButton';
import api from '../../services/api';

export const storage = new MMKV();

export default function SignIn({ navigation }: any) {
  storage.clearAll();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({});

  const onSubmit = (data: any) => {
    api.post('/auth/login', data).then((res) => {
      if (res.data.accessToken) {
        alert(res.data.accessToken);
        alert(res.data.loggedId);
        storage.set('accessToken', res?.data.accessToken);
        storage.set('loggedId', res?.data.loggedId);
        navigation.navigate('Home');
      } else if (!res.data.accessToken) {
        alert('E-mail ou senha incorretos');
      }
    });
  };

  const iconPassword = require('../../assets/lock-icon.svg');
  const iconEmail = require('../../assets/e-mail-icon.svg');
  const manaManoLogo = require('../../assets/logo-boas-vindas.svg');

  const [fontsLoaded] = useFonts({
    'inter-bold': require('../../fonts/Inter-Bold.ttf'),
  });
  if (!fontsLoaded) {
    return undefined;
  }

  return (
    <SignInContainer>
      <SignInForm>
        <View style={{ gap: '45px' }}>
          <BackButton />

          <Image source={manaManoLogo} />
          <SignInInputContainer>
            <Controller
              control={control}
              name="email"
              rules={{
                required: true,
              }}
              render={({ field: { onChange, value } }) => (
                <InputTextCustom
                  onChangeText={onChange}
                  value={value}
                  label="E-mail"
                  imageIcon={iconEmail}
                />
              )}
            />
            {errors.email && <ErrorWarning errorText="Campo obrigatório" />}
            <Controller
              control={control}
              name="password"
              rules={{
                required: true,
              }}
              render={({ field: { onChange, value } }) => (
                <InputTextCustom
                  onChangeText={onChange}
                  value={value}
                  label="Senha"
                  imageIcon={iconPassword}
                  isPassword
                />
              )}
            />
            {errors.password && <ErrorWarning errorText="Campo obrigatório" />}
          </SignInInputContainer>
        </View>
        <ButtonCustom
          onPress={handleSubmit(onSubmit)}
          backColor="transparent"
          fontColor="#160E47"
          text="Entrar"
          border
        />
      </SignInForm>
    </SignInContainer>
  );
}
