/* eslint-disable array-callback-return */
/* eslint-disable react/jsx-no-undef */
/* eslint-disable max-len */
/* eslint-disable no-nested-ternary */
/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable prettier/prettier */
/* eslint-disable react/jsx-indent */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable global-require */
import React, { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { View, ActivityIndicator } from 'react-native';
import Toast from 'react-native-toast-message';
import { EditGroupContainer, EditGroupForm, EditGroupPage } from './EditGroupStyle';
import ErrorWarning from '../../components/ErrorWarning/ErrorWarning';
import InputTextCustom from '../../components/InputText/InputTextCustom';
import BigInputTextCustom from '../../components/BigInputText/BigInputText';
import ButtonCustom from '../../components/ButtonCustom/ButtonCustom';
import localStorage from '../../services/localStorage';
import api from '../../services/api';
import useFetch from '../../hooks/useFetch';
import ErrorState from '../../components/ErrorState/ErrorState';
import ScreenWithHeader from '../../components/ScreenWithHeader/ScreenWithHeader';
import { useAuth } from '../../context/auth/useAuth';
import useAsyncAction from '../../hooks/useAsyncAction';

export default function EditGroup({ navigation }: any) {
  const { loggedId } = useAuth();
  const [groupId, setGroupId] = useState('');

  useEffect(() => {
    const groupIdAux = localStorage.getString('groupId');
    if (groupIdAux) {
      setGroupId(groupIdAux);
    }
  }, []);

  const groupQuery = useFetch(
    () => api.get(`/group/${groupId}`).then((res) => res.data),
    [loggedId, groupId],
    { enabled: !!loggedId && !!groupId },
  );
  const groupName = groupQuery.data?.name ?? '';
  const descriptionGroup = groupQuery.data?.description ?? '';

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm({
    defaultValues: {
      name: '',
      description: '',
      category: '',
    },
    mode: 'onSubmit',
  });

  const EditGroupData: any = {
    name: groupName,
    description: descriptionGroup,
  };

  useEffect(() => {
    setValue('name', EditGroupData.name);
    setValue('description', EditGroupData.description);
  }, [EditGroupData.name, EditGroupData.description, setValue]);

  const onSubmit = async (data: any) => {
    if (!loggedId || !groupId) return;

    try {
      await api.patch(`/group/${groupId}`, {
        name: data.name,
        description: data.description,
      });

      Toast.show({
        type: 'success',
        text1: 'Grupo atualizado',
        text2: 'As alterações foram salvas com sucesso.',
      });
      navigation.navigate('GroupPage', { groupId, groupName });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Erro ao salvar',
        text2: 'Não foi possível atualizar o grupo. Tente novamente.',
      });
    }
  };

  const { execute, isLoading, isBusy } = useAsyncAction(onSubmit);

  return (
    <ScreenWithHeader headerProps={{ font: 'inter-bold', text: 'Editar Grupo' }}>
      <EditGroupPage>
        <EditGroupContainer>
          <View>
            {groupQuery.loading && !groupQuery.data ? (
              <ActivityIndicator
                testID="group-loading"
                size="large"
                color="#EF4036"
                style={{ marginTop: 20 }}
              />
            ) : !!groupQuery.error && !groupQuery.data ? (
              <ErrorState
                inline
                text="Não foi possível carregar os dados do grupo."
                onRetry={groupQuery.refetch}
              />
            ) : (
              <EditGroupForm>
                <Controller
                  control={control}
                  name="name"
                  rules={{
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
            )}
          </View>
          <ButtonCustom
            onPress={handleSubmit((data) => execute(data))}
            backColor="#160E47"
            fontColor="#fff"
            text="Salvar alterações"
            loadingText="Salvando..."
            loading={isLoading}
            disabled={isBusy}
            border
          />
        </EditGroupContainer>
      </EditGroupPage>
    </ScreenWithHeader>
  );
}
