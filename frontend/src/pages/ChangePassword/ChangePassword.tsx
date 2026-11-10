import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { isAxiosError } from 'axios';
import Toast from 'react-native-toast-message';
import InputTextCustom from '../../components/InputText/InputTextCustom';
import ErrorWarning from '../../components/ErrorWarning/ErrorWarning';
import { SignInForm, SignInInputContainer } from '../SignIn/SignInStyle';
import ButtonCustom from '../../components/ButtonCustom/ButtonCustom';
import { useAuth } from '../../context/auth/useAuth';
import api from '../../services/api';
import authStore from '../../store/authStore';
import IconPassword from '../../assets/lock-icon.svg';
import { RootStackParamList } from '../../navigation/types';
import ScreenWithHeader from '../../components/ScreenWithHeader/ScreenWithHeader';

type FormData = {
  oldpassword: string;
  newpassword: string;
  confirmedpassword: string;
};

const GENERIC_ERROR_MESSAGE = 'Erro ao mudar senha. Tente novamente mais tarde.';

function getChangePasswordErrorMessage(error: unknown): string {
  if (!isAxiosError(error)) return GENERIC_ERROR_MESSAGE;
  if (!error.response) {
    return 'Não foi possível conectar. Verifique sua internet e tente novamente.';
  }

  const { status, data } = error.response;
  if (status === 429) {
    return 'Muitas tentativas. Aguarde alguns minutos e tente novamente.';
  }
  if (status >= 500) {
    return GENERIC_ERROR_MESSAGE;
  }

  const backendMessage = data?.message;
  if (Array.isArray(backendMessage)) return backendMessage.join('\n');
  return backendMessage || GENERIC_ERROR_MESSAGE;
}

export default function ChangePassword() {
  const { loggedId } = useAuth();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    getValues,
    trigger,
    setError,
  } = useForm<FormData>({
    mode: 'onChange',
  });

  const onSubmit = async (data: FormData) => {
    if (isSubmitting) return;

    if (data.newpassword === data.oldpassword) {
      setError('newpassword', {
        type: 'manual',
        message: 'A nova senha não pode ser igual à senha antiga.',
      });
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: 'A nova senha não pode ser igual à senha antiga.',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await api.patch('/user/change-password', {
        oldPassword: data.oldpassword,
        newPassword: data.newpassword,
      });

      if (response?.data?.accessToken && response?.data?.refreshToken) {
        await authStore.updateTokens(response.data.accessToken, response.data.refreshToken);
      }

      Toast.show({
        type: 'success',
        text1: 'Sucesso',
        text2: 'Senha atualizada com sucesso!',
      });
      navigation.navigate('Config');
    } catch (error: unknown) {
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: getChangePasswordErrorMessage(error),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScreenWithHeader headerProps={{ font: 'inter-bold', text: 'Mudar Senha' }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{
          flex: 1,
          backgroundColor: '#f2f6fa',
          display: loggedId ? 'flex' : 'none',
        }}
        keyboardVerticalOffset={50}>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
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
                    testID="change-password-old-input"
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
                  maxLength: {
                    value: 72,
                    message: 'A senha deve ter no máximo 72 caracteres',
                  },
                }}
                render={({ field: { onChange, value } }) => (
                  <InputTextCustom
                    onChangeText={(text: string) => {
                      onChange(text);
                      if (getValues('confirmedpassword')) {
                        void trigger('confirmedpassword');
                      }
                    }}
                    value={value}
                    label="Digite a nova senha"
                    imageIcon={<IconPassword />}
                    isPassword
                    testID="change-password-new-input"
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
                    testID="change-password-confirm-input"
                  />
                )}
              />
              {errors.confirmedpassword && (
                <ErrorWarning
                  errorText={errors.confirmedpassword.message || 'Senhas não coincidem'}
                />
              )}
            </SignInInputContainer>

            <View style={{ marginTop: 24 }}>
              <ButtonCustom
                onPress={handleSubmit(onSubmit)}
                backColor="#160E47"
                fontColor="white"
                text={isSubmitting ? 'Salvando...' : 'Salvar'}
                disabled={isSubmitting}
                testID="change-password-submit"
              />
            </View>
          </SignInForm>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenWithHeader>
  );
}
