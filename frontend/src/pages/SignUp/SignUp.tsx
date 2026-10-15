/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-alert */
/* eslint-disable global-require */
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Text, View, StyleSheet, StatusBar, Alert as RNAlert } from 'react-native';
import { isAxiosError } from 'axios';
import Toast from 'react-native-toast-message';
import ButtonCustom from '../../components/ButtonCustom/ButtonCustom';
import { SignUpContainer, SignUpInputContainer, SignUpForm } from './SignUpStyle';
import InputTextCustom from '../../components/InputText/InputTextCustom';
import ErrorWarning from '../../components/ErrorWarning/ErrorWarning';
import BackButton from '../../components/BackButton/BackButton';
import api from '../../services/api';
import IconProfile from '../../assets/profile-icon.svg';
import IconEmail from '../../assets/e-mail-icon.svg';
import IconWhats from '../../assets/whats-icon.svg';
import IconPassword from '../../assets/lock-icon.svg';

interface SignUpFormData {
  fullName: string;
  email: string;
  phone: string;
  password: string;
}

export default function SignUp({ navigation }: any) {
  function cleanPhoneNumber(num: string): string {
    return num.replace(/\D/g, '');
  }
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpFormData>({
    mode: 'onChange',
  });

  const onSubmit = async (data: SignUpFormData) => {
    const onlyNumPhone = cleanPhoneNumber(data.phone);
    const updatedData = {
      ...data,
      fullName: data.fullName.trim(),
      phone: onlyNumPhone,
    };

    try {
      await api.post('/user', updatedData);
      Toast.show({
        type: 'success',
        text1: 'Cadastro realizado',
        text2: 'Seu cadastro foi realizado com sucesso!',
      });
      navigation.navigate('SignIn');
    } catch (error: unknown) {
      if (isAxiosError(error) && error.response?.status === 409) {
        Toast.show({
          type: 'error',
          text1: 'Erro no cadastro',
          text2: 'E-mail ou celular já está associado a outra conta!',
        });
        return;
      }

      Toast.show({
        type: 'error',
        text1: 'Erro no cadastro',
        text2: 'Não foi possível criar o usuário.',
      });
    }
  };

  return (
    <SignUpContainer>
      <StatusBar backgroundColor="black" />
      <SignUpForm>
        <View style={{ gap: 30 }}>
          <BackButton />
          <View>
            <Text style={styles.redText}>Olá,</Text>
            <Text style={styles.blueText}>crie a sua conta!</Text>
          </View>
          <SignUpInputContainer>
            <Controller
              control={control}
              name="fullName"
              rules={{
                required: 'Campo obrigatório',
                minLength: {
                  value: 3,
                  message: 'O nome deve ter no mínimo 3 caracteres',
                },
                maxLength: {
                  value: 120,
                  message: 'O nome deve ter no máximo 120 caracteres',
                },
                pattern: {
                  value: /^[A-Za-zÀ-ÿ\s]+$/,
                  message: 'Apenas letras são permitidas',
                },
                validate: (value) => {
                  if (!value || !value.trim()) {
                    return 'Campo obrigatório';
                  }
                  if (value.trim().length < 3) {
                    return 'O nome deve ter no mínimo 3 caracteres';
                  }
                  return true;
                },
              }}
              render={({ field: { onChange, value } }) => (
                <InputTextCustom
                  onChangeText={onChange}
                  value={value}
                  label="Nome Completo"
                  imageIcon={<IconProfile height={20} width={20} />}
                />
              )}
            />
            {errors.fullName && (
              <ErrorWarning errorText={errors.fullName.message || 'Campo obrigatório'} />
            )}
            <Controller
              control={control}
              name="email"
              rules={{
                required: 'Campo obrigatório',
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: 'E-mail inválido',
                },
              }}
              render={({ field: { onChange, value } }) => (
                <InputTextCustom
                  onChangeText={onChange}
                  value={value}
                  label="E-mail"
                  imageIcon={<IconEmail height={20} width={20} />}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              )}
            />
            {errors.email && (
              <ErrorWarning errorText={errors.email.message || 'Campo obrigatório'} />
            )}
            <Controller
              control={control}
              name="phone"
              rules={{
                required: 'Campo obrigatório',
              }}
              render={({ field: { onChange, value } }) => (
                <InputTextCustom
                  onChangeText={onChange}
                  value={value}
                  label="WhatsApp"
                  imageIcon={<IconWhats height={20} width={20} />}
                  type="cel-phone"
                />
              )}
            />
            {errors.phone && (
              <ErrorWarning errorText={errors.phone.message || 'Campo obrigatório'} />
            )}
            <Controller
              control={control}
              name="password"
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
                  label="Senha"
                  imageIcon={<IconPassword height={20} width={20} />}
                  isPassword
                />
              )}
            />
            {errors.password && (
              <ErrorWarning errorText={errors.password.message || 'Campo obrigatório'} />
            )}
          </SignUpInputContainer>
        </View>
        <ButtonCustom
          onPress={handleSubmit(onSubmit)}
          backColor="#160E47"
          fontColor="white"
          text="Cadastrar"
        />
      </SignUpForm>
    </SignUpContainer>
  );
}

const styles = StyleSheet.create({
  redText: {
    color: '#EF4036',
    fontSize: 30,
    fontFamily: 'inter-bold',
  },
  blueText: {
    color: '#160E47',
    fontSize: 20,
    fontFamily: 'inter-bold',
  },
});
