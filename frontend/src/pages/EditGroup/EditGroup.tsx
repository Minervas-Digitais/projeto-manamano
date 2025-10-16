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
import { TouchableOpacity, View, Image } from 'react-native';
import { TextInputMask } from 'react-native-masked-text';
import {
  EditGroupCategoryContainer,
  EditGroupContainer,
  EditGroupForm,
  EditGroupPage,
} from './EditGroupStyle';
import CategoryEditGroup from '../../components/CategoryEditGroup/CategoryEditGroup';
import HeaderCustom from '../../components/HeaderCustom/HeaderCustom';
import ErrorWarning from '../../components/ErrorWarning/ErrorWarning';
import InputTextCustom from '../../components/InputText/InputTextCustom';
import BigInputTextCustom from '../../components/BigInputText/BigInputText';
import ButtonCustom from '../../components/ButtonCustom/ButtonCustom';
import { storage } from '../SignIn/SignIn';
import api from '../../services/api';
import { AddCategoryButton, Input } from '../CreateGroup/CreateGroupStyle';
import {
  InputTextContainer,
  LabelInputText,
  InputTextIconInputContainer,
  InputText,
  InputTextIconContainer,
} from '../../components/InputText/InputTextCustomStyle';

export default function EditGroup({ navigation }: any) {
  const [loggedIdState, setLoggedIdState] = useState('');
  const [accessTokenState, setAccessTokenState] = useState('');
  const [groupId, setGroupId] = useState('');
  const [groupName, setGroupName] = useState('');
  const [descriptionGroup, setDescriptionGroup] = useState('');

  useEffect(() => {
    const accessToken = storage.getString('accessToken');
    const loggedId = storage.getString('loggedId');
    const groupIdAux = storage.getString('groupId');

    if (loggedId && accessToken && groupIdAux) {
      setAccessTokenState(accessToken);
      setLoggedIdState(loggedId);
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
  }, []);

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

  setValue('name', EditGroupData.name);
  setValue('description', EditGroupData.description);

  const [fontsLoaded] = useFonts({
    'inter-bold': require('../../fonts/Inter-Bold.ttf'),
  });
  if (!fontsLoaded) {
    return undefined;
  }

  const onSubmit = (data: any) => {
    const type = 'NORMAL';
    if (accessTokenState && loggedIdState) {
      api.patch(
        `/group/${groupId}`,
        { name: data.name, description: data.description },
        {
          headers: {
            Authorization: `Bearer ${accessTokenState}`,
          },
        },
      );
      // .then((res) => console.log(JSON.stringify(res)));

      navigation.navigate('GroupPage', { groupId, groupName });
    }
  };
  return (
    <EditGroupPage>
      <HeaderCustom font="inter-bold" text="Editar Grupo" />

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
  );
}
