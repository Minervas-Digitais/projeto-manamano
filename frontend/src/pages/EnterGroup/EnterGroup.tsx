import React from 'react';
import { View } from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import Toast from 'react-native-toast-message';
import InputTextCustom from '../../components/InputText/InputTextCustom';
import ErrorWarning from '../../components/ErrorWarning/ErrorWarning';
import ButtonCustom from '../../components/ButtonCustom/ButtonCustom';
import { SignInForm, SignInInputContainer } from '../SignIn/SignInStyle';
import api from '../../services/api';
import ScreenWithHeader from '../../components/ScreenWithHeader/ScreenWithHeader';
import { useAuth } from '../../context/auth/useAuth';

export default function EnterGroup({ navigation }: any) {
  const { loggedId } = useAuth();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({});
  const onSubmit = async (data: any) => {
    if (!loggedId) {
      console.error('Token do usuário não encontrado.');
      return;
    }

    try {
      const participantData = {
        inviteCode: data.inviteCode,
      };

      const resp = await api.post('/participant', participantData);

      console.log('Participante adicionado com sucesso:', resp.data);
      Toast.show({
        type: 'success',
        text1: 'Sucesso',
        text2: 'Você entrou no grupo com sucesso!',
      });
      navigation.navigate('Groups');
    } catch (error: any) {
      console.error('Erro ao entrar no grupo:', error);
      if (error?.response?.status === 404) {
        Toast.show({
          type: 'error',
          text1: 'Erro',
          text2: 'Código de convite inválido.',
        });
      } else if (error?.response?.status === 409) {
        Toast.show({
          type: 'error',
          text1: 'Erro',
          text2: 'Você já está neste grupo.',
        });
      } else {
        Toast.show({
          type: 'error',
          text1: 'Erro',
          text2: 'Ocorreu um erro ao tentar entrar no grupo.',
        });
      }
    }
  };

  return (
    <ScreenWithHeader headerProps={{ font: 'inter-bold', text: 'Entrar em Grupo' }}>
      <View style={{ flex: 1, backgroundColor: '#f2f6fa' }}>
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
    </ScreenWithHeader>
  );
}
