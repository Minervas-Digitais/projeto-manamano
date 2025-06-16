/* eslint-disable global-require */
import React, { useEffect, useState } from 'react';
import { TouchableOpacity, Text, View, ScrollView, Alert } from 'react-native';
import { useFonts } from 'expo-font';
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
import SideMenu from '../../components/SideMenu/SideMenu';
import {
  ConfigNotificationHeaderContainer,
  ConfigNotificationTitle,
} from '../Notification/NotificationStyle';
import ButtonCustom from '../../components/ButtonCustom/ButtonCustom';
import api from '../../services/api';
import HeaderCustom from '../../components/HeaderCustom/HeaderCustom';

export default function CreateGroup({ navigation }: any) {
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

  const createCategory = async (name: string, type: string, groupId: string) => {
    if (!accessToken) {
      console.error('Access token is missing.');
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/category', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          type,
          groupId,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to create category "${name}"`);
      }

      const data = await response.json();
      console.log(`Category "${name}" created with ID:`, data.id);
    } catch (error) {
      console.error(`Error creating category "${name}":`, error);
    }
  };

  const handleCreateGroup = async () => {
    const loggedId = storage.getString('loggedId');
    if (!groupName.trim() || !groupDescription.trim()) {
      Alert.alert('Error', 'Please fill in both the group name and description.');
      return;
    }

    if (!accessToken) {
      Alert.alert('Error', 'Access token is missing.');
      return;
    }

    try {
      const groupResponse = await fetch('http://localhost:3000/group', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: groupName,
          description: groupDescription,
        }),
      });

      if (!groupResponse.ok) {
        throw new Error('Failed to create group');
      }

      const groupData = await groupResponse.json();
      const groupId = groupData.id;
      const { inviteCode } = groupData;
      console.log('inviteCode: ', inviteCode);
      console.log('Group ID:', groupId);
      Alert.alert('Success', `Group created successfully! ID: ${groupId}`);

      const defaultCategories = [
        { name: 'Geral', type: 'NORMAL' },
        { name: 'Avisos', type: 'NORMAL' },
        { name: 'Eventos', type: 'EVENT' },
        { name: 'Aulas', type: 'CLASS' },
      ];

      for (const { name, type } of defaultCategories) {
        await createCategory(name, type, groupId);
      }
      api
        .post(
          '/participant',
          { groupId, userId: loggedId, role: 'MODERATOR', inviteCode },
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          },
        )
        .then((res) => {
          console.log('SUCESSO', res.data);
          navigation.navigate('Home');
        })
        .catch((error) => {
          if (error.response) {
            console.log('ERRO', error.response.status, error.response.data);
          } else {
            console.log('ERRO DESCONHECIDO', error.message);
          }
        });
      for (const category of categories) {
        await createCategory(category, 'NORMAL', groupId);
      }
    } catch (error) {
      console.error('Error creating group or categories:', error);
      Alert.alert('Error', 'Failed to create group or categories. Please try again.');
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
            style={{
              outline: 'none',
              boxShadow: 'none',
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
            style={{
              outline: 'none',
              boxShadow: 'none',
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
              onKeyPress={({ nativeEvent }) => {
                if (nativeEvent.key === 'Enter') {
                  handleAddCategory();
                }
              }}
              style={{
                marginBottom: 0,
                outline: 'none',
                boxShadow: 'none',
                backgroundColor: 'transparent',
                borderRadius: 5,
                flex: 1,
              }}
            />
            <AddCategoryButton onPress={handleAddCategory}>
              <Text style={{ fontSize: 18, color: '#AAAAAA' }}>+</Text>
            </AddCategoryButton>
          </CategoryContainer>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            <Category>Geral</Category>
            <Category>Aulas</Category>
            <Category>Eventos</Category>
            {categories.map((category, index) => (
              <Category key={index}>
                {category}
                <TouchableOpacity
                  onPress={() => handleRemoveCategory(category)}
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
            />
          </View>
        </ContentContainer>
      </ScrollView>
    </Container>
  );
}
