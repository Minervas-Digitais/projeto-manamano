import React from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import ScreenWithHeader from '../../components/ScreenWithHeader/ScreenWithHeader';
import ButtonCustom from '../../components/ButtonCustom/ButtonCustom';
import InputTextCustom from '../../components/InputText/InputTextCustom';
import ErrorWarning from '../../components/ErrorWarning/ErrorWarning';
import { SignInForm, SignInInputContainer } from '../SignIn/SignInStyle';
import IconEmail from '../../assets/e-mail-icon.svg';
import api from '../../services/api';
import { RootStackParamList } from '../../navigation/types';
import { isResendBlocked, registerCodeSent } from '../../hooks/useResendCooldown';
import useAsyncAction from '../../hooks/useAsyncAction';
import { showForgotPasswordError } from './forgotPasswordErrors';
import { ForgotPasswordText } from './ForgotPasswordStyle';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'ForgotPasswordEmail'>;
type RouteType = RouteProp<RootStackParamList, 'ForgotPasswordEmail'>;

type FormData = {
  email: string;
};

export default function ForgotPasswordEmail() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteType>();

  const initialEmail = route.params?.email || '';

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    mode: 'onChange',
    defaultValues: {
      email: initialEmail,
    },
  });

  const onSubmit = async (data: FormData) => {
    const email = data.email.trim();

    if (isResendBlocked(email)) {
      navigation.navigate('ForgotPasswordCode', { email });
      return;
    }

    try {
      await api.post('/auth/forgot-password', { email });
      registerCodeSent(email);
      navigation.navigate('ForgotPasswordCode', { email });
    } catch (error) {
      showForgotPasswordError(error);
    }
  };

  const { execute, isLoading, isBusy } = useAsyncAction(onSubmit);

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
              <ForgotPasswordText>
                Digite o e-mail da sua conta. Enviaremos um código de recuperação.
              </ForgotPasswordText>

              <Controller
                control={control}
                name="email"
                rules={{
                  required: 'Campo obrigatório',
                  validate: (value) => {
                    const trimmed = value?.trim();
                    if (!trimmed) return 'Campo obrigatório';
                    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed) || 'E-mail inválido';
                  },
                }}
                render={({ field: { onChange, value } }) => (
                  <InputTextCustom
                    onChangeText={onChange}
                    value={value}
                    label="E-mail"
                    imageIcon={<IconEmail />}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    testID="forgot-email-input"
                  />
                )}
              />
              {errors.email && (
                <ErrorWarning errorText={errors.email.message || 'Campo obrigatório'} />
              )}
            </SignInInputContainer>

            <View style={{ marginTop: 24 }}>
              <ButtonCustom
                onPress={handleSubmit((data) => execute(data))}
                backColor="#160E47"
                fontColor="white"
                text="Enviar"
                loadingText="Enviando..."
                loading={isLoading}
                disabled={isBusy}
                testID="forgot-email-submit"
              />
            </View>
          </SignInForm>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenWithHeader>
  );
}
