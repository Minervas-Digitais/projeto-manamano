import React, { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Toast from 'react-native-toast-message';
import ScreenWithHeader from '../../components/ScreenWithHeader/ScreenWithHeader';
import ButtonCustom from '../../components/ButtonCustom/ButtonCustom';
import CodeInput from '../../components/CodeInput/CodeInput';
import { SignInForm, SignInInputContainer } from '../SignIn/SignInStyle';
import api from '../../services/api';
import { RootStackParamList } from '../../navigation/types';
import { useResendCooldown } from '../../hooks/useResendCooldown';
import { showForgotPasswordError } from './forgotPasswordErrors';
import {
  ForgotPasswordEmailText,
  ForgotPasswordText,
  ForgotPasswordTitle,
  ResendButton,
  ResendText,
} from './ForgotPasswordStyle';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'ForgotPasswordCode'>;
type RouteType = RouteProp<RootStackParamList, 'ForgotPasswordCode'>;

export default function ForgotPasswordCode() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteType>();
  const email = route.params?.email;

  const [code, setCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const { limitReached, remainingMs, registerSent } = useResendCooldown(email ?? '');

  useEffect(() => {
    if (!email) {
      navigation.replace('ForgotPasswordEmail');
    }
  }, [email, navigation]);

  const formatCountdown = (ms: number) => {
    const totalSeconds = Math.ceil(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  const handleResend = async () => {
    if (isResending) return;

    if (remainingMs > 0) {
      Toast.show({
        type: 'error',
        text1: 'Aguarde',
        text2: 'Espere um pouco antes de solicitar o código novamente.',
      });
      return;
    }

    setIsResending(true);
    try {
      await api.post('/auth/forgot-password', { email });
      registerSent();
      setCode('');
      Toast.show({
        type: 'success',
        text1: 'Código reenviado',
        text2: 'Enviamos um novo código para o seu e-mail.',
      });
    } catch (error) {
      showForgotPasswordError(error);
    } finally {
      setIsResending(false);
    }
  };

  const onSubmit = async () => {
    if (!email || code.length !== 6 || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const response = await api.post('/auth/verify-reset-code', { email, code });
      const resetToken = response.data?.resetToken;

      if (!resetToken) {
        Toast.show({
          type: 'error',
          text1: 'Erro',
          text2: 'Não foi possível validar o código. Tente novamente.',
        });
        return;
      }

      navigation.replace('ForgotPasswordNewPassword', { resetToken });
    } catch (error) {
      showForgotPasswordError(error);
      setCode('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isTimerActive = remainingMs > 0;
  const isButtonDisabled = code.length !== 6 || isSubmitting;

  if (!email) return null;

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
                Confira seu e-mail. Acabamos de enviar um código de recuperação para o e-mail{' '}
                <ForgotPasswordEmailText>{email}</ForgotPasswordEmailText>.
              </ForgotPasswordText>

              <View style={{ marginTop: 10 }}>
                <ForgotPasswordTitle>Digite o código de 6 dígitos</ForgotPasswordTitle>
              </View>

              <CodeInput value={code} onChange={setCode} testID="forgot-code-input" />

              {limitReached ? (
                <ForgotPasswordText style={{ textAlign: 'center', marginTop: 10 }}>
                  Limite de reenvios atingido. Tente novamente em {formatCountdown(remainingMs)}.
                </ForgotPasswordText>
              ) : (
                <ResendButton
                  onPress={handleResend}
                  testID="forgot-resend-button"
                  accessibilityRole="button"
                  accessibilityState={{ disabled: isResending }}
                  disabled={isResending}>
                  <ResendText available={!isTimerActive}>
                    {isResending
                      ? 'Reenviando...'
                      : isTimerActive
                        ? `Enviar código novamente (${formatCountdown(remainingMs)})`
                        : 'Enviar código novamente'}
                  </ResendText>
                </ResendButton>
              )}
            </SignInInputContainer>

            <View style={{ marginTop: 24 }}>
              <ButtonCustom
                onPress={onSubmit}
                backColor="#160E47"
                fontColor="white"
                text={isSubmitting ? 'Confirmando...' : 'Confirmar'}
                disabled={isButtonDisabled}
                testID="forgot-code-submit"
              />
            </View>
          </SignInForm>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenWithHeader>
  );
}
