import React from 'react';
import { useFonts } from 'expo-font';
import { View } from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import HeaderCustom from '../../components/HeaderCustom/HeaderCustom';
import InputTextCustom from '../../components/InputText/InputTextCustom';
import ErrorWarning from '../../components/ErrorWarning/ErrorWarning';
import ButtonCustom from '../../components/ButtonCustom/ButtonCustom';
import { SignInForm, SignInInputContainer } from '../SignIn/SignInStyle';
import api from '../../services/api';
import { storage } from '../SignIn/SignIn';

export default function EnterGroup({ navigation }: any) {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({});
  const onSubmit = async (data: any) => {
    const accessToken = storage.getString('accessToken');
    const loggedId = storage.getString('loggedId');

    if (!accessToken || !loggedId) {
      console.error('Token ou ID do usuário não encontrado.');
      return;
    }

    try {
      const participantData = {
        userId: loggedId,
        role: 'STUDENT',
        inviteCode: data.inviteCode,
      };

      const resp = await api.post('/participant', participantData, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      console.log('Participante adicionado com sucesso:', resp.data);
      alert('Você entrou no grupo com sucesso!');
      navigation.navigate('Groups');
    } catch (error: any) {
      console.error('Erro ao entrar no grupo:', error);
      if (error?.response?.status === 404) {
        alert('Código de convite inválido.');
      } else if (error?.response?.status === 409) {
        alert('Você já está neste grupo.');
      } else {
        alert('Ocorreu um erro ao tentar entrar no grupo.');
      }
    }
  };

  const [fontsLoaded] = useFonts({
    // eslint-disable-next-line global-require
    'inter-bold': require('../../fonts/Inter-Bold.ttf'),
  });
  if (!fontsLoaded) {
    return undefined;
  }
  return (
    <View style={{ flex: 1, backgroundColor: '#f2f6fa' }}>
      <HeaderCustom font="inter-bold" text="Entrar em Grupo" />
      <SignInForm>
        <SignInInputContainer style={{ gap: 30 }}>
          <Controller
            control={control}
            name="inviteCode"
            rules={{
              required: true,
            }}
            render={({ field: { onChange, value } }) => (
              <InputTextCustom
                onChangeText={onChange}
                value={value}
                label="Código de Convite"
                imageIcon={null}
              />
            )}
          />
          {errors.inviteCode && <ErrorWarning errorText="Campo obrigatório" />}
          <ButtonCustom
            onPress={handleSubmit(onSubmit)}
            backColor="#160E47"
            fontColor="white"
            text="Entrar"
          />
        </SignInInputContainer>
      </SignInForm>
    </View>
  );
}
