/* eslint-disable global-require */
import React, { useEffect, useState } from 'react';
import { TouchableOpacity, Text, View, ScrollView, Alert } from 'react-native';
import { useFonts } from 'expo-font';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import {
  Container,
  Input,
  TextArea,
  CategoryContainer,
  Category,
  AddCategoryButton,
  ContentContainer,
} from './CreateGroupStyle';
import { storage } from '../SignIn/SignIn';
import ButtonCustom from '../../components/ButtonCustom/ButtonCustom';
import api from '../../services/api';
import HeaderCustom from '../../components/HeaderCustom/HeaderCustom';
import { RootStackParamList } from '../../navigation/types';

export default function CreateGroup() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [fontsLoaded] = useFonts({
    'inter-bold': require('../../fonts/Inter-Bold.ttf'),
    'inter-regular': require('../../fonts/Inter-Regular.ttf'),
  });

  const [categories, setCategories] = useState<string[]>([]);
  const [newCategory, setNewCategory] = useState('');
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');

  useEffect(() => {
    const token = storage.getString('accessToken');
    if (token) setAccessToken(token);
  }, []);

  const handleAddCategory = () => {
    if (newCategory.trim() && !categories.includes(newCategory.trim())) {
      setCategories([...categories, newCategory.trim()]);
      setNewCategory('');
    }
  };

  const handleRemoveCategory = (categoryToRemove: string) => {
    setCategories(categories.filter((category) => category !== categoryToRemove));
  };

  const createCategory = async (name: string, type: string, groupId: string) => {
    if (!accessToken) {
      return Promise.reject(new Error('Access token is missing.'));
    }

    try {
      const response = await api.post(
        '/category',
        {
          name,
          type,
          groupId,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      return response.data;
    } catch (error) {
      throw new Error(`Falha ao criar categoria "${name}"`);
    }
  };

  const handleCreateGroup = async () => {
    const loggedId = storage.getString('loggedId');
    if (!groupName.trim() || !groupDescription.trim()) {
      Alert.alert('Error', 'Preencha corretamente os campos.');
      return;
    }

    if (!accessToken) {
      Alert.alert('Error', 'Access token is missing.');
      return;
    }

    try {
      const groupResponse = await api.post(
        '/group',
        {
          name: groupName,
          description: groupDescription,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      const groupData = groupResponse.data;
      const groupId = groupData.id;
      const { inviteCode } = groupData;

      Alert.alert('Successo', `Grupo criado com sucesso! ID: ${groupId}`);

      const defaultCategories = [
        { name: 'Geral', type: 'NORMAL' },
        { name: 'Avisos', type: 'NORMAL' },
        { name: 'Eventos', type: 'EVENT' },
        { name: 'Aulas', type: 'CLASS' },
      ];

      // Create all categories in parallel for better performance
      const allCategoryPromises = [
        ...defaultCategories.map(({ name, type }) => createCategory(name, type, groupId)),
        ...categories.map((category) => createCategory(category, 'NORMAL', groupId)),
      ];

      // Wait for all categories to be created
      await Promise.all(allCategoryPromises);

      // Add user as moderator
      try {
        await api.post(
          '/participant',
          { userId: loggedId, role: 'INSTRUCTOR', inviteCode },
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          },
        );

        navigation.navigate('Home');
      } catch (participantError: any) {
        if (participantError.response) {
          Alert.alert('Error', 'Falha ao adicionar usuário como moderador');
        } else {
          Alert.alert('Error', 'Falha desconhecida');
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Falha ao criar grupo ou categoria');
    }
  };

  if (!fontsLoaded) {
    return null;
  }

  return (
    <Container>
      <HeaderCustom menu font="inter-bold" text="Criar Grupo" />
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} style={{ flex: 1 }}>
        <ContentContainer>
          <Text style={{ padding: 4, fontSize: 12, color: '#5E6366' }}>Nome do Grupo</Text>
          <Input
            value={groupName}
            onChangeText={setGroupName}
            testID="group-name-input"
            accessibilityLabel="Nome do Grupo"
            style={{
              backgroundColor: 'transparent',
              borderColor: '#5e6366',
              borderRadius: 5,
              borderWidth: 1,
            }}
          />

          <Text style={{ padding: 4, fontSize: 12, color: '#5E6366' }}>Descrição do Grupo</Text>
          <TextArea
            value={groupDescription}
            onChangeText={setGroupDescription}
            multiline
            testID="group-description-input"
            accessibilityLabel="Descrição do Grupo"
            style={{
              backgroundColor: 'transparent',
              borderColor: '#5e6366',
              borderRadius: 5,
              borderWidth: 1,
            }}
          />
          <Text style={{ padding: 4, fontSize: 12, color: '#5E6366' }}>Categorias</Text>
          <CategoryContainer
            style={{
              marginBottom: 15,
              backgroundColor: 'transparent',
              borderColor: '#5e6366',
              borderRadius: 5,
              borderWidth: 1,
              paddingRight: 5,
            }}>
            <Input
              value={newCategory}
              onChangeText={setNewCategory}
              testID="category-input"
              onKeyPress={({ nativeEvent }) => {
                if (nativeEvent.key === 'Enter') {
                  handleAddCategory();
                }
              }}
              style={{
                marginBottom: 0,
                backgroundColor: 'transparent',
                borderRadius: 5,
                flex: 1,
              }}
            />
            <AddCategoryButton onPress={handleAddCategory} testID="add-category-button">
              <Text style={{ fontSize: 18, color: '#AAAAAA' }}>+</Text>
            </AddCategoryButton>
          </CategoryContainer>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            <Category>Geral</Category>
            <Category>Aulas</Category>
            <Category>Eventos</Category>
            {categories.map((category) => (
              <Category key={category}>
                {category}
                <TouchableOpacity
                  onPress={() => handleRemoveCategory(category)}
                  testID={`category-${category}`}
                  style={{ marginLeft: 8 }}>
                  <Text>-</Text>
                </TouchableOpacity>
              </Category>
            ))}
          </View>
          <View style={{ alignItems: 'center', marginTop: 50 }}>
            <ButtonCustom
              onPress={handleCreateGroup}
              backColor="#160E47"
              fontColor="white"
              text="Criar"
              testID="create-group-button"
            />
          </View>
        </ContentContainer>
      </ScrollView>
    </Container>
  );
}
