import { View } from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import React, { useEffect, useState } from 'react';
import Toast from 'react-native-toast-message';
import { useRoute } from '@react-navigation/native';
import ErrorWarning from '../../components/ErrorWarning/ErrorWarning';
import ButtonCustom from '../../components/ButtonCustom/ButtonCustom';
import api from '../../services/api';
import BigInputTextCustom from '../../components/BigInputText/BigInputText';
import { GlobalNotificationContainer } from './GlobalNotificationPageStyle';
import ScreenWithHeader from '../../components/ScreenWithHeader/ScreenWithHeader';
import { useAuth } from '../../context/auth/useAuth';

export default function GlobalNotificationPage({ navigation }: any) {
  const route = useRoute();
  const { loggedId } = useAuth();
  const { id, body } = route.params as { id: string; body?: string };
  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm({});
  const [existingNotification, setExistingNotification] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!loggedId || !body) return;

      if (body) {
        api
          .get('/notifications/user')
          .then((response) => {
            const notification = response.data.find((notif: any) => notif.id === id);
            if (notification) {
              setExistingNotification(notification);
              setValue('input', notification.body);
            }
          });
      }
    };

    fetchData();
  }, [loggedId, body, id, setValue]);

  const onSubmit = async (data: any) => {
    try {
      if (body && existingNotification) {
        await api.patch(`/notifications/update/${id}`, {
          body: data.input,
        });
        Toast.show({
          type: 'success',
          text1: 'Comunicado atualizado com sucesso!',
        });
      } else {
        await api.post('/notifications/global', {
          type: 'WARNING',
          body: data.input,
        });
        Toast.show({
          type: 'success',
          text1: 'Comunicado enviado com sucesso!',
        });
      }

      setTimeout(() => {
        navigation.goBack();
      }, 500);
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: body ? 'Erro ao atualizar comunicado.' : 'Erro ao enviar comunicado.',
        text2: 'Tente novamente mais tarde.',
      });
    }
  };

  return (
    <ScreenWithHeader
      headerProps={{ font: 'inter-bold', text: body ? 'Editar Comunicado' : 'Comunicado' }}>
      <View style={{ flex: 1, backgroundColor: '#f2f6fa' }}>
        <GlobalNotificationContainer>
          <Controller
            control={control}
            name="input"
            rules={{
              required: true,
            }}
            render={({ field: { onChange, value } }) => (
              <BigInputTextCustom
                onChangeText={onChange}
                value={value}
                label={body ? 'Editar Comunicado' : 'Criar Comunicado'}
                imageIcon={null}
              />
            )}
          />
          {errors.input && <ErrorWarning errorText="Campo obrigatório" />}
          <ButtonCustom
            onPress={handleSubmit(onSubmit)}
            backColor="#160E47"
            fontColor="white"
            text={body ? 'Atualizar' : 'Publicar'}
          />
        </GlobalNotificationContainer>
      </View>
    </ScreenWithHeader>
  );
}
