/* eslint-disable import/no-duplicates */
/* eslint-disable global-require */
/* eslint-disable react/jsx-closing-bracket-location */
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
  const { loggedId } = useAuth();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const {
    control,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm({
    mode: 'onChange',
  });

  const onSubmit = async (data: any) => {
    try {
      await api.patch('/user/change-password', {
        oldPassword: data.oldpassword,
        newPassword: data.newpassword,
      });
      Toast.show({
        type: 'success',
        text1: 'Sucesso',
        text2: 'Senha atualizada com sucesso!',
      });
      navigation.navigate('Config');
    } catch (error: any) {
      const backendMessage = error?.response?.data?.message;
      const errorMessage = Array.isArray(backendMessage)
        ? backendMessage.join('\n')
        : backendMessage || 'Erro ao mudar senha. Tente novamente mais tarde.';

      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: errorMessage,
      });
    }
  };

  return (
    <ScreenWithHeader headerProps={{ font: 'inter-bold', text: 'Mudar Senha' }}>
      <View
        style={{
          flex: 1,
          backgroundColor: '#f2f6fa',
          display: loggedId ? 'flex' : 'none',
        }}>
        <SignInForm>
          <SignInInputContainer>
            <Controller
              control={control}
              name="oldpassword"
              rules={{
                required: 'Campo obrigatório',
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
            {errors.oldpassword && (
              <ErrorWarning errorText={errors.oldpassword.message || 'Campo obrigatório'} />
            )}
            <Controller
              control={control}
              name="newpassword"
              rules={{
                required: 'Campo obrigatório',
                minLength: {
                  value: 8,
                  message: 'A senha deve ter no mínimo 8 caracteres',
                },
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
            {errors.newpassword && (
              <ErrorWarning errorText={errors.newpassword.message || 'Campo obrigatório'} />
            )}
            <Controller
              control={control}
              name="confirmedpassword"
              rules={{
                required: 'Campo obrigatório',
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
            {errors.confirmedpassword && (
              <ErrorWarning
                errorText={errors.confirmedpassword.message || 'Senhas não coincidem'}
              />
            )}
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
