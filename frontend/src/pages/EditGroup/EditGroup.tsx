/* eslint-disable array-callback-return */
/* eslint-disable react/jsx-no-undef */
/* eslint-disable max-len */
/* eslint-disable no-nested-ternary */
/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable prettier/prettier */
/* eslint-disable react/jsx-indent */
/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable global-require */
import React, { useEffect, useState } from 'react';
import { useFonts } from 'expo-font';
import { Controller, useForm } from 'react-hook-form';
import { View } from 'react-native';
import { EditGroupContainer, EditGroupForm, EditGroupPage } from './EditGroupStyle';
import ErrorWarning from '../../components/ErrorWarning/ErrorWarning';
import InputTextCustom from '../../components/InputText/InputTextCustom';
import BigInputTextCustom from '../../components/BigInputText/BigInputText';
import ButtonCustom from '../../components/ButtonCustom/ButtonCustom';
import localStorage from '../../services/localStorage';
import api from '../../services/api';
import ScreenWithHeader from '../../components/ScreenWithHeader/ScreenWithHeader';
import { useAuth } from '../../context/auth/useAuth';

export default function EditGroup({ navigation }: any) {
  const { accessToken } = useAuth();
  const [groupId, setGroupId] = useState('');
  const [groupName, setGroupName] = useState('');
  const [descriptionGroup, setDescriptionGroup] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      const groupIdAux = localStorage.getString('groupId');

      if (accessToken && groupIdAux) {
        setGroupId(groupIdAux);

        api
          .get(`/group/${groupIdAux}`, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          })
          .then((res) => {
            setGroupName(res.data.name);
            setDescriptionGroup(res.data.description);
          });
      }
    };
    fetchData();
  }, [accessToken]);

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

  const [fontsLoaded] = useFonts({
    'inter-bold': require('../../fonts/Inter-Bold.ttf'),
  });
  if (!fontsLoaded) {
    return undefined;
  }

  const onSubmit = (data: any) => {
    if (accessToken && groupId) {
      api.patch(
        `/group/${groupId}`,
        { name: data.name, description: data.description },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      navigation.navigate('GroupPage', { groupId, groupName });
    }
  };
  return (
    <ScreenWithHeader headerProps={{ font: 'inter-bold', text: 'Editar Grupo' }}>
      <EditGroupPage>
        <EditGroupContainer>
          <View>
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
          </View>
          <ButtonCustom
            onPress={handleSubmit(onSubmit)}
            backColor="#160E47"
            fontColor="#fff"
            text="Salvar alterações"
            border
          />
        </EditGroupContainer>
      </EditGroupPage>
    </ScreenWithHeader>
  );
}
