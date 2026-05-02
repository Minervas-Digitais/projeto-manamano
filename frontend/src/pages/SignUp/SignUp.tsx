/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-alert */
/* eslint-disable global-require */
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Text, View, StyleSheet, StatusBar, Alert as RNAlert } from 'react-native';
import { useFonts } from 'expo-font';
import { isAxiosError } from 'axios';
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
  const showAlert = (message: string) => RNAlert.alert(message);

  function cleanPhoneNumber(num: string): string {
    return num.replace(/\D/g, '');
  }
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpFormData>();

  const onSubmit = async (data: SignUpFormData) => {
    const onlyNumPhone = cleanPhoneNumber(data.phone);
    const updatedData = { ...data, phone: onlyNumPhone };

    try {
      await api.post('/user', updatedData);
      showAlert('Cadastro realizado!');
      navigation.navigate('SignIn');
    } catch (error: unknown) {
      if (isAxiosError(error) && error.response?.status === 409) {
        showAlert('E-mail ou celular já está associado a outra conta!');
        return;
      }

      showAlert('Erro ao criar usuário.');
    }
  };

  const [fontsLoaded] = useFonts({
    'inter-bold': require('../../fonts/Inter-Bold.ttf'),
  });

  if (!fontsLoaded) {
    return undefined;
  }

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
                required: true,
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
            {errors.fullName && <ErrorWarning errorText="Campo obrigatório" />}
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
                  imageIcon={<IconEmail height={20} width={20} />}
                />
              )}
            />
            {errors.email && <ErrorWarning errorText="Campo obrigatório" />}
            <Controller
              control={control}
              name="phone"
              rules={{
                required: true,
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
            {errors.phone && <ErrorWarning errorText="Campo obrigatório" />}
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
                  imageIcon={<IconPassword height={20} width={20} />}
                  isPassword
                />
              )}
            />
            {errors.password && <ErrorWarning errorText="Campo obrigatório" />}
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
