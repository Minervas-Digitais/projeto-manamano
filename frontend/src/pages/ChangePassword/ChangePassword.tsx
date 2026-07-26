/* eslint-disable import/no-duplicates */
/* eslint-disable global-require */
/* eslint-disable react/jsx-closing-bracket-location */
import { useFonts } from 'expo-font';
import { View } from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import React from 'react';
import Toast from 'react-native-toast-message';
import InputTextCustom from '../../components/InputText/InputTextCustom';
import ErrorWarning from '../../components/ErrorWarning/ErrorWarning';
import { SignInForm, SignInInputContainer } from '../SignIn/SignInStyle';
import ButtonCustom from '../../components/ButtonCustom/ButtonCustom';
import { useAuth } from '../../context/auth/useAuth';
import api from '../../services/api';
import IconPassword from '../../assets/lock-icon.svg';
import { RootStackParamList } from '../../navigation/types';
import ScreenWithHeader from '../../components/ScreenWithHeader/ScreenWithHeader';

export default function ChangePassword() {
  const { loggedId, accessToken } = useAuth();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const {
    control,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm({});

  const onSubmit = async (data: any) => {
    try {
      await api.patch(
        '/user/change-password',
        {
          oldPassword: data.oldpassword,
          newPassword: data.newpassword,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );
      Toast.show({
        type: 'success',
        text1: 'Sucesso',
        text2: 'Senha atualizada com sucesso!',
      });
      navigation.navigate('Config');
    } catch (error) {
      console.error('Erro ao mudar senha:', error);
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: 'Erro ao mudar senha. Tente novamente mais tarde.',
      });
    }
  };

  const [fontsLoaded] = useFonts({
    'inter-bold': require('../../fonts/Inter-Bold.ttf'),
  });

  if (!fontsLoaded) {
    return undefined;
  }

  return (
    <ScreenWithHeader headerProps={{ font: 'inter-bold', text: 'Mudar Senha' }}>
      <View
        style={{
          flex: 1,
          backgroundColor: '#f2f6fa',
          display: loggedId && accessToken ? 'flex' : 'none',
        }}>
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
                  imageIcon={<IconPassword />}
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
                  imageIcon={<IconPassword />}
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
                  imageIcon={<IconPassword />}
                  isPassword
                />
              )}
            />
            {errors.confirmedpassword && <ErrorWarning errorText="Senhas não coincidem" />}
          </SignInInputContainer>
          <ButtonCustom
            onPress={handleSubmit(onSubmit)}
            backColor="#160E47"
            fontColor="white"
            text="Salvar"
          />
        </SignInForm>
      </View>
    </ScreenWithHeader>
  );
}
