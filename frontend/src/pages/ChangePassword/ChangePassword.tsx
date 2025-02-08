/* eslint-disable global-require */
import { useFonts } from 'expo-font';
import { View } from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import { useEffect, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import HeaderCustom from '../../components/HeaderCustom/HeaderCustom';
import InputTextCustom from '../../components/InputText/InputTextCustom';
import ErrorWarning from '../../components/ErrorWarning/ErrorWarning';
import { SignInForm, SignInInputContainer } from '../SignIn/SignInStyle';
import ButtonCustom from '../../components/ButtonCustom/ButtonCustom';
import { storage } from '../SignIn/SignIn';
import api from '../../services/api';

export default function ChangePassword() {
  const navigation = useNavigation();
  const iconPassword = require('../../assets/lock-icon.svg');
  const [loggedIdState, setLoggedIdState] = useState('');
  const [accessTokenState, setAccessTokenState] = useState('');
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
  const {
    control,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm({});
  const onSubmit = async (data: any) => {
    try {
      const response = await api.patch(
        `/user/${loggedIdState}/change-password`,
        {
          id: loggedIdState,
          oldPassword: data.oldpassword,
          newPassword: data.newpassword,
        },
        {
          headers: {
            Authorization: `Bearer ${accessTokenState}`,
          },
        },
      );
      alert('Senha atualizada com sucesso!');
      navigation.navigate('Configurações');
    } catch (error) {
      console.error('Erro ao mudar senha:', error);
      alert('Erro ao mudar senha. Tente novamente mais tarde.');
    }
  };
  const [fontsLoaded] = useFonts({
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
      <HeaderCustom font="inter-bold" text="Mudar Senha" />
      <SignInForm>
        <SignInInputContainer>
          <Controller
            control={control}
            name="oldpassword"
            rules={{
              required: true,
            }}
            render={({ field: { onChange, value } }) => (
              <InputTextCustom
                onChangeText={onChange}
                value={value}
                label="Digite a senha atual"
                imageIcon={iconPassword}
                isPassword
              />
            )}
          />
          {errors.oldpassword && <ErrorWarning errorText="Campo obrigatório" />}
          <Controller
            control={control}
            name="newpassword"
            rules={{
              required: true,
            }}
            render={({ field: { onChange, value } }) => (
              <InputTextCustom
                onChangeText={onChange}
                value={value}
                label="Digite a nova senha"
                imageIcon={iconPassword}
                isPassword
              />
            )}
          />
          {errors.newpassword && <ErrorWarning errorText="Campo obrigatório" />}
          <Controller
            control={control}
            name="confirmedpassword"
            rules={{
              required: true,
              validate: (value) => value === getValues('newpassword') || 'Senhas não coincidem',
            }}
            render={({ field: { onChange, value } }) => (
              <InputTextCustom
                onChangeText={onChange}
                value={value}
                label="Confirme a nova senha"
                imageIcon={iconPassword}
                isPassword
              />
            )}
          />
          {errors.confirmedpassword && <ErrorWarning errorText="Senhas não coincidem" />}
        </SignInInputContainer>
        <View style={{ marginBottom: 100 }}>
          <ButtonCustom
            onPress={handleSubmit(onSubmit)}
            backColor="#160E47"
            fontColor="white"
            text="Confirmar"
          />
        </View>
      </SignInForm>
    </View>
  );
}
