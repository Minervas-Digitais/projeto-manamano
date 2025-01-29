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
import { InputTextContainer, LabelInputText, InputTextIconInputContainer, InputTextIcon, InputText, InputTextIconContainer } from '../../components/InputText/InputTextCustomStyle';

export default function EditGroup({ navigation }: any) {
  const addIcon = require('../../assets/add-category-icon.svg');
  const [loggedIdState, setLoggedIdState] = useState('');
  const [accessTokenState, setAccessTokenState] = useState('');
  const [groupId, setGroupId] = useState('');
  const [groupName, setGroupName] = useState('');
  const [descriptionGroup, setDescriptionGroup] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [categoriesList, setCategoriesList] = useState<any>([]);
  const [categoriesToRemove, setCategoriesToRemove] = useState<any>([]);

  // const groupId = '3ef6db63-e240-4abd-a974-6bdf4144636d'; // <---------------------------------- [ LEMBRETE: puxar do storage ]

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

      api
        .get(`/category/group/${groupIdAux}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        })
        .then((res) => {
          if (Array.isArray(res.data)) {
            setCategoriesList(res.data);
          } else {
            console.error('Resposta inesperada:', res.data);
          }
        })
        .catch((err) => console.error('Erro ao buscar categorias:', err));
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
  const handleAddCategory = () => {
    if (newCategory.trim()) {
      setCategories([...categories, newCategory]);
      setNewCategory('');
    }
  };

  setValue('name', EditGroupData.name);
  setValue('description', EditGroupData.description);

  const [fontsLoaded] = useFonts({
    'inter-bold': require('../../fonts/Inter-Bold.ttf'),
  });
  if (!fontsLoaded) {
    return undefined;
  }

  const deleteCategory = (id: any) => {
    api.delete(`/category/${id}`, {
      headers: {
        Authorization: `Bearer ${accessTokenState}`,
      },
    }).then((res) => console.log('Categoria deletada com sucesso!'));
  };

  const handleRemoveCategory = (category: string) => {
    setCategories(categories.filter((cat) => cat !== category));
  };

  const removeDatabaseCategory = (category: any) => {
    setCategoriesList((prevList: any) => {
      const updatedList = prevList.filter((cat: any) => cat.name !== category.name);
      console.log('Lista atualizada:', updatedList);
      return updatedList;
    });

    setCategoriesToRemove((prev: any) => [...prev, category.id]);
  };

  const onSubmit = (data: any) => {
    const type = 'NORMAL';
    if (accessTokenState && loggedIdState) {
      api
        .patch(
          `/group/${groupId}`,
          { name: data.name, description: data.description },
          {
            headers: {
              Authorization: `Bearer ${accessTokenState}`,
            },
          },
        )
        .then((res) => console.log(JSON.stringify(res)));
      categories.length > 0 ? categories.map((item) => {
        api
          .post('/category', { name: item, type, groupId }, {
            headers: {
              Authorization: `Bearer ${accessTokenState}`,
            },
          }).then((res) => console.log(JSON.stringify(res)));
      }) : null;

      categoriesToRemove.length > 0 ? categoriesToRemove.map((item: any) => {
        deleteCategory(item);
      }) : null;

      navigation.navigate('GroupPage');
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
            <View style={{ gap: 11, display: 'flex', width: '100%' }}>

            <InputTextContainer>
      <LabelInputText>Categorias</LabelInputText>
      <InputTextIconInputContainer>
          <InputText
            onChangeText={setNewCategory}
            value={newCategory}
          />
        <TouchableOpacity onPress={handleAddCategory}>
              <Image source={addIcon} />
        </TouchableOpacity>
      </InputTextIconInputContainer>
            </InputTextContainer>

            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 5 }}>

                        {categoriesList.map((item: any) => (
                          <CategoryEditGroup
                            onPress={() => (
                              item.name === 'Mural'
                              || item.name === 'Eventos' || item.name === 'Aulas'
                                ? null : removeDatabaseCategory(item)
                            )}
                            categoryName={item.name}
                            noIcon={!!((item.name === 'Mural'
                              || item.name === 'Eventos' || item.name === 'Aulas'))}
                          />
                        ))}

                        {categories.map((item: any) => (
                          <CategoryEditGroup
                            onPress={() => handleRemoveCategory(item)}
                            categoryName={item}
                          />
                        ))}
            </View>
            </View>
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
