import React, { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useRoute } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import { ActivityIndicator, View } from 'react-native';
import { EditGroupContainer, EditGroupForm, EditGroupPage } from './EditGroupStyle';
import ErrorWarning from '../../components/ErrorWarning/ErrorWarning';
import InputTextCustom from '../../components/InputText/InputTextCustom';
import BigInputTextCustom from '../../components/BigInputText/BigInputText';
import ButtonCustom from '../../components/ButtonCustom/ButtonCustom';
import api from '../../services/api';
import useFetch from '../../hooks/useFetch';
import ErrorState from '../../components/ErrorState/ErrorState';
import ScreenWithHeader from '../../components/ScreenWithHeader/ScreenWithHeader';
import { useAuth } from '../../context/auth/useAuth';

type EditGroupFormData = {
  name: string;
  description: string;
};

type GroupResponse = {
  id: string;
  name: string;
  description: string;
};

export default function EditGroup({ navigation }: any) {
  const route = useRoute();
  const { groupId } = route.params as { groupId?: string };
  const { loggedId } = useAuth();

  const groupQuery = useFetch<GroupResponse>(
    () => api.get(`/group/${groupId}`).then((res) => res.data),
    [loggedId, groupId],
    { enabled: !!loggedId && !!groupId },
  );

  // O useFetch mantém o último dado durante uma nova busca: nunca preencher
  // o formulário com dados de outro grupo.
  const fetchedGroup = groupQuery.data?.id === groupId ? groupQuery.data : undefined;
  const hasFetchedGroup = !!fetchedGroup;
  const groupName = fetchedGroup?.name ?? '';
  const descriptionGroup = fetchedGroup?.description ?? '';

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EditGroupFormData>({
    defaultValues: { name: '', description: '' },
    mode: 'onSubmit',
  });

  useEffect(() => {
    reset({ name: '', description: '' });
  }, [groupId, reset]);

  useEffect(() => {
    if (hasFetchedGroup) {
      reset({ name: groupName, description: descriptionGroup });
    }
  }, [groupName, descriptionGroup, hasFetchedGroup, reset]);

  const onSubmit = async ({ name, description }: EditGroupFormData) => {
    if (!loggedId || !groupId) {
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: 'Você precisa estar logado para editar o grupo.',
      });
      return;
    }

    if (!hasFetchedGroup) {
      Toast.show({
        type: 'info',
        text1: 'Aguarde',
        text2: 'Os dados do grupo ainda estão sendo carregados.',
      });
      return;
    }

    try {
      await api.patch(`/group/${groupId}`, {
        name: name.trim(),
        description: description.trim(),
      });

      Toast.show({
        type: 'success',
        text1: 'Grupo atualizado!',
        text2: 'Suas alterações foram salvas com sucesso.',
      });
      navigation.goBack();
    } catch (error: any) {
      const message =
        error?.response?.data?.message ?? 'Não foi possível salvar as alterações. Tente novamente.';

      Toast.show({
        type: 'error',
        text1: 'Erro ao salvar',
        text2: Array.isArray(message) ? message.join('\n') : message,
      });
    }
  };

  if (!groupId) {
    return (
      <ScreenWithHeader headerProps={{ font: 'inter-bold', text: 'Editar Grupo' }}>
        <ErrorState
          inline
          text="Não foi possível identificar o grupo que deve ser editado."
          retryText="Voltar"
          onRetry={() => navigation.goBack()}
        />
      </ScreenWithHeader>
    );
  }

  const renderForm = () => {
    if (groupQuery.loading && !hasFetchedGroup) {
      return (
        <ActivityIndicator
          testID="group-loading"
          size="large"
          color="#EF4036"
          style={{ marginTop: 20 }}
        />
      );
    }

    if (groupQuery.error && !hasFetchedGroup) {
      return (
        <ErrorState
          inline
          text="Não foi possível carregar os dados do grupo."
          onRetry={groupQuery.refetch}
        />
      );
    }

    return (
      <EditGroupForm>
        <Controller
          control={control}
          name="name"
          rules={{
            required: 'Informe o nome do Grupo',
            maxLength: { value: 20, message: 'Máximo de 20 caracteres' },
          }}
          render={({ field: { onChange, value } }) => (
            <InputTextCustom
              onChangeText={onChange}
              value={value}
              label="Nome do Grupo"
              imageIcon={null}
            />
          )}
        />
        {errors.name && <ErrorWarning errorText={errors.name.message} />}

        <Controller
          control={control}
          name="description"
          rules={{
            maxLength: { value: 500, message: 'Máximo de 500 caracteres' },
          }}
          render={({ field: { onChange, value } }) => (
            <BigInputTextCustom
              onChangeText={onChange}
              value={value}
              label="Descrição do Grupo"
              imageIcon={null}
            />
          )}
        />
        {errors.description && <ErrorWarning errorText={errors.description.message} />}
      </EditGroupForm>
    );
  };

  return (
    <ScreenWithHeader headerProps={{ font: 'inter-bold', text: 'Editar Grupo' }}>
      <EditGroupPage>
        <EditGroupContainer>
          <View>{renderForm()}</View>
          <ButtonCustom
            onPress={handleSubmit(onSubmit)}
            backColor="#160E47"
            fontColor="#fff"
            text={isSubmitting ? 'Salvando...' : 'Salvar alterações'}
            disabled={isSubmitting || !hasFetchedGroup}
            border
          />
        </EditGroupContainer>
      </EditGroupPage>
    </ScreenWithHeader>
  );
}
