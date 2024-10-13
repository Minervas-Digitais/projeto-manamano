/* eslint-disable global-require */
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Image, View } from 'react-native';
import ErrorWarning from '../../components/ErrorWarning/ErrorWarning';
import { SignInContainer, SignInForm, SignInInputContainer } from './SignInStyle';
import ButtonCustom from '../../components/ButtonCustom/ButtonCustom';
import InputTextCustom from '../../components/InputText/InputTextCustom';
import BackButton from '../../components/BackButton/BackButton';

export default function SignIn({ navigation }: any) {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({});

  const onSubmit = (data: any) => {
    // eslint-disable-next-line no-alert
    alert(JSON.stringify(data));
    navigation.navigate('Home');
  };
  const iconPassword = require('../../assets/lock-icon.svg');
  const iconEmail = require('../../assets/e-mail-icon.svg');
  const manaManoLogo = require('../../assets/logo-boas-vindas.svg');

  return (
    <SignInContainer>
      <SignInForm>
        <View style={{ gap: '45px' }}>
          <BackButton />

          <Image source={manaManoLogo} />
          <SignInInputContainer>
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
          </SignInInputContainer>
        </View>
        <ButtonCustom
          onPress={handleSubmit(onSubmit)}
          backColor="transparent"
          fontColor="#160E47"
          text="Entrar"
          border
        />
      </SignInForm>
    </SignInContainer>
  );
}
