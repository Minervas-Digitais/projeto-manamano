/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-alert */
/* eslint-disable global-require */
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Text, View, Image, StyleSheet, StatusBar } from 'react-native';
import { useFonts } from 'expo-font';
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

export default function SignUp({ navigation }: any) {
  function cleanPhoneNumber(num: string): string {
    return num.replace(/\D/g, '');
  }
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({});

  const onSubmit = (data: any) => {
    alert(JSON.stringify(data));
    const onlyNumPhone = cleanPhoneNumber(data.phone);
    const updatedData = { ...data, phone: onlyNumPhone };
    api
      .post('/user', updatedData)
      .then((res) => {
        console.log('Resposta:', res.data);
        if (res?.data.code === 'P2002') {
          alert('E-mail ou celular já está associado a outra conta!');
        } else {
          alert('Cadastro realizado!');
          navigation.navigate('SignIn');
        }
      })
      .catch((error) => {
        console.log('Erro na requisição:', error.message);
        alert('Erro ao criar usuário. Veja o console.');
      });
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
            // o nome do erro precisa dar match com o nome especificado no Controller
            {errors.phone && <ErrorWarning errorText="Campo obrigatório" />}
            <Controller
              control={control}
              name="hash"
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
            // o nome do erro precisa dar match com o nome especificado no Controller
            {errors.hash && <ErrorWarning errorText="Campo obrigatório" />}
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
