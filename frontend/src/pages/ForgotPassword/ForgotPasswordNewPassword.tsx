import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Toast from 'react-native-toast-message';
import ScreenWithHeader from '../../components/ScreenWithHeader/ScreenWithHeader';
import ButtonCustom from '../../components/ButtonCustom/ButtonCustom';
import InputTextCustom from '../../components/InputText/InputTextCustom';
import ErrorWarning from '../../components/ErrorWarning/ErrorWarning';
import { SignInForm, SignInInputContainer } from '../SignIn/SignInStyle';
import IconPassword from '../../assets/lock-icon.svg';
import api from '../../services/api';
import { RootStackParamList } from '../../navigation/types';
import { clearResendCooldown } from '../../hooks/useResendCooldown';
import { isBadRequest, showForgotPasswordError } from './forgotPasswordErrors';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'ForgotPasswordNewPassword'>;
type RouteType = RouteProp<RootStackParamList, 'ForgotPasswordNewPassword'>;

type FormData = {
  newpassword: string;
  confirmedpassword: string;
};

export default function ForgotPasswordNewPassword() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteType>();
  const { resetToken } = route.params;

  const [isLoading, setIsLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<FormData>({
    mode: 'onChange',
  });

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      await api.post('/auth/reset-password', {
        resetToken,
        newPassword: data.newpassword,
      });

      clearResendCooldown();

      navigation.reset({
        index: 0,
        routes: [{ name: 'SignIn' }],
      });

      Toast.show({
        type: 'success',
        text1: 'Sucesso',
        text2: 'Senha redefinida com sucesso. Faça login com a nova senha.',
      });
    } catch (error) {
      if (isBadRequest(error)) {
        Toast.show({
          type: 'error',
          text1: 'Erro',
          text2: 'Sua solicitação expirou. Solicite um novo código.',
        });
        navigation.reset({
          index: 1,
          routes: [{ name: 'SignIn' }, { name: 'ForgotPasswordEmail' }],
        });
        return;
      }

      showForgotPasswordError(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScreenWithHeader headerProps={{ font: 'inter-bold', text: 'Redefinir senha' }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1, backgroundColor: '#f2f6fa' }}
        keyboardVerticalOffset={50}>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <SignInForm>
            <SignInInputContainer>
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
                  deps: ['confirmedpassword'],
                }}
                render={({ field: { onChange, value } }) => (
                  <InputTextCustom
                    onChangeText={onChange}
                    value={value}
                    label="Digite a nova senha"
                    imageIcon={<IconPassword />}
                    isPassword
                    testID="forgot-new-password-input"
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
                    testID="forgot-confirm-password-input"
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
                text={isLoading ? 'Salvando...' : 'Confirmar'}
                disabled={isLoading}
                testID="forgot-new-password-submit"
              />
            </View>
          </SignInForm>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenWithHeader>
  );
}
