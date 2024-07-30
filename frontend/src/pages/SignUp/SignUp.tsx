/* eslint-disable global-require */
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Text, View, Image, StyleSheet } from 'react-native';
import { useFonts } from 'expo-font';
import ButtonCustom from '../../components/ButtonCustom/ButtonCustom';
import { SignUpContainer, SignUpInputContainer, SignUpForm } from './SignUpStyle';
import InputTextCustom from '../../components/InputText/InputTextCustom';
import ErrorWarning from '../../components/ErrorWarning/ErrorWarning';
import BackButton from '../../components/BackButton/BackButton';

export default function SignUp() {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({});

  const onSubmit = (data: any) => {
    // eslint-disable-next-line no-alert
    alert(JSON.stringify(data));
  };
  const iconProfile = require('../../assets/profile-icon.svg');
  const iconEmail = require('../../assets/e-mail-icon.svg');
  const iconWhats = require('../../assets/whats-icon.svg');
  const iconPassword = require('../../assets/lock-icon.svg');
  const backButton = require('../../assets/back-button-icon.svg');

  const [fontsLoaded] = useFonts({
    'inter-bold': require('../../fonts/Inter-Bold.ttf'),
  });
  if (!fontsLoaded) {
    return undefined;
  }
  return (
    <SignUpContainer>
      <SignUpForm>
        <View style={{ gap: '30px' }}>
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
                  imageIcon={iconProfile}
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
                  imageIcon={iconEmail}
                />
              )}
            />
            {errors.email && <ErrorWarning errorText="Campo obrigatório" />}

            <Controller
              control={control}
              name="whatsApp"
              rules={{
                required: true,
              }}
              render={({ field: { onChange, value } }) => (
                <InputTextCustom
                  onChangeText={onChange}
                  value={value}
                  label="WhatsApp"
                  imageIcon={iconWhats}
                  type="cel-phone"
                />
              )}
            />
            {errors.whatsApp && <ErrorWarning errorText="Campo obrigatório" />}

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
