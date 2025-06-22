/* eslint-disable global-require */
import React, { useState, useEffect } from 'react';
import { useFonts } from 'expo-font';
import { TouchableOpacity, View, Text, ScrollView, Dimensions } from 'react-native';
import {
  Avatar,
  Card,
  Container,
  Name,
  Section,
  SectionTitle,
  StyledButton,
} from './ResultSectionStyle';
import PostItem from '../PostItem/PostItem';
import api from '../../services/api';
import TrashCan from '../../assets/trash-can.svg';

interface User {
  id: string;
  fullName: string;
}

interface Group {
  id: string;
  name: string;
}

interface Post {
  id: string;
  userId: string;
  groupId: string;
  nameUser: string;
  input: string;
  numComments: number;
  createdAt: string;
  originGroup: string;
}

interface ResultSectionProps {
  searchText: string;
  saveRecentUser: (user: { id: number; name: string; avatar: any }) => void;
  accessToken: string;
}

interface DataState {
  users: User[];
  groups: Group[];
  posts: Post[];
}

export default function ResultSection({
  searchText,
  saveRecentUser,
  accessToken,
}: ResultSectionProps) {
  const [selectedSection, setSelectedSection] = useState('');
  const [data, setData] = useState<DataState>({ users: [], groups: [], posts: [] });
  const screenWidth = Dimensions.get('window').width;
  const screenHeight = Dimensions.get('window').height;
  const avatar = require('../../assets/duck.png');

  const [fontsLoaded] = useFonts({
    'inter-bold': require('../../fonts/Inter-Bold.ttf'),
    'inter-regular': require('../../fonts/Inter-Regular.ttf'),
  });
  const fetchData = async (url: string, sectionKey?: keyof DataState): Promise<void> => {
    if (!accessToken) {
      console.error('No access token available.');
      return;
    }

    try {
      const response = await api.post(
        url,
        { input: searchText },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      const json = response.data;
      const parsedData = { users: [], groups: [], posts: [] };

      if (sectionKey) {
        parsedData[sectionKey] = json;
      } else {
        Object.assign(parsedData, json);
      }

      setData(parsedData);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    if (searchText && !selectedSection) {
      fetchData('/search');
    }
  }, [searchText, accessToken]);

  useEffect(() => {
    if (selectedSection) {
      const url = `/search/filter/${selectedSection.toLowerCase()}`;
      fetchData(url, selectedSection as keyof DataState);
    }
  }, [selectedSection, accessToken]);

  const fetchUserName = async (userId: string): Promise<string> => {
    if (!accessToken) {
      console.error('No access token available.');
      return 'Nome não encontrado';
    }

    try {
      const response = await api.get(`/user/${userId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const user = response.data;
      const fullName = user.fullName.split(' ');
      return `${fullName[0]} ${fullName[1] || ''}`;
    } catch (error) {
      console.error('Error fetching user name:', error);
      return 'Nome não encontrado';
    }
  };

  const fetchNumComments = async (postId: string): Promise<number> => {
    if (!accessToken) {
      console.error('No access token available.');
      return 0;
    }

    try {
      const response = await api.get(`/post/${postId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const postDetails = response.data;
      return postDetails.Comment ? postDetails.Comment.length : 0;
    } catch (error) {
      console.error('Error fetching comments:', error);
      return 0;
    }
  };

  const handleFilterPress = (section: string): void => {
    const newSection = selectedSection === section ? '' : section;
    setData({ users: [], groups: [], posts: [] });
    setSelectedSection(newSection);

    if (!newSection) {
      fetchData('/search');
    } else {
      const url = `/search/filter/${newSection.toLowerCase()}`;
      fetchData(url, newSection as keyof DataState);
    }
  };

  if (!fontsLoaded || !accessToken) {
    return null;
  }

  return (
    <Container>
      <View style={{ paddingLeft: 10, paddingRight: 10 }}>
        <Text
          style={{
            fontSize: 12,
            fontWeight: 'bold',
            marginBottom: 10,
            fontFamily: 'inter-bold',
            color: '#515151',
            marginTop: 20,
          }}>
          Filtros
        </Text>
        <View
          style={{
            flexDirection: 'row',
            gap: 10,
          }}>
          <TouchableOpacity
            style={{
              flex: 1,
              backgroundColor: selectedSection === 'users' ? '#FFA8A6' : '#E0E0E0',
              borderRadius: 30,
              width: screenWidth * 0.277,
              height: screenHeight * 0.05,
              justifyContent: 'center',
              alignItems: 'center',
            }}
            onPress={() => handleFilterPress('users')}>
            <Text style={{ fontFamily: 'inter-regular', fontSize: 14 }}>Pessoas</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              backgroundColor: selectedSection === 'groups' ? '#FFA8A6' : '#E0E0E0',
              borderRadius: 30,
              flex: 1,
              width: screenWidth * 0.277,
              height: screenHeight * 0.05,
              justifyContent: 'center',
              alignItems: 'center',
            }}
            onPress={() => handleFilterPress('groups')}>
            <Text style={{ fontFamily: 'inter-regular', fontSize: 14 }}>Grupos</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              backgroundColor: selectedSection === 'posts' ? '#FFA8A6' : '#E0E0E0',
              borderRadius: 30,
              flex: 1,
              width: screenWidth * 0.277,
              height: screenHeight * 0.05,
              justifyContent: 'center',
              alignItems: 'center',
            }}
            onPress={() => handleFilterPress('posts')}>
            <Text style={{ fontFamily: 'inter-regular', fontSize: 14 }}>Publicações</Text>
          </TouchableOpacity>
        </View>
      </View>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} style={{ height: '100%' }}>
        {(selectedSection === 'users' || selectedSection === '') && (
          <Section style={{ zIndex: 2 }}>
            <SectionTitle
              style={{
                fontSize: 12,
                fontWeight: 'bold',
                marginBottom: 25,
                fontFamily: 'inter-bold',
                color: '#3F3D3D',
              }}>
              Pessoas
            </SectionTitle>
            {data.users.map((person) => {
              const fullName = person.fullName.split(' ');
              return (
                <Card key={person.id} style={{ marginBottom: 10 }}>
                  <TouchableOpacity
                    onPress={() => {
                      saveRecentUser({
                        id: parseInt(person.id, 10),
                        name: person.fullName,
                        avatar: require('../../assets/duck.png'),
                      });
                    }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', paddingLeft: 15 }}>
                      <Avatar source={avatar} />
                      <Name fontFamily="inter-regular" fontColor="#3F3D3D">
                        {`${fullName[0]} ${fullName[1] || ''}`}
                      </Name>
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity>
                    <TrashCan />
                  </TouchableOpacity>
                </Card>
              );
            })}
            {selectedSection === '' && (
              <View style={{ marginTop: 20 }}>
                <View
                  style={{ borderBottomWidth: 1, borderBottomColor: '#E0E0E0', marginBottom: 10 }}
                />
                <StyledButton onPress={() => handleFilterPress('users')}>
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: 'bold',
                      marginBottom: 10,
                      fontFamily: 'inter-bold',
                      color: '#3F3D3D',
                    }}>
                    Ver todos os resultados de Pessoas
                  </Text>
                </StyledButton>
              </View>
            )}
          </Section>
        )}

        {(selectedSection === 'groups' || selectedSection === '') && (
          <Section>
            <SectionTitle
              style={{
                fontSize: 12,
                fontWeight: 'bold',
                marginBottom: 25,
                fontFamily: 'inter-bold',
                color: '#3F3D3D',
              }}>
              Grupos
            </SectionTitle>
            {data.groups.map((group) => (
              <Card key={group.id} style={{ marginBottom: 10 }}>
                <TouchableOpacity
                  onPress={() => {
                    saveRecentUser({
                      id: parseInt(group.id, 10),
                      name: group.name,
                      avatar: require('../../assets/duck.png'),
                    });
                  }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Avatar source={avatar} />
                    <Name fontFamily="inter-regular" fontColor="#3F3D3D">
                      {group.name}
                    </Name>
                  </View>
                </TouchableOpacity>
              </Card>
            ))}
            {selectedSection === '' && (
              <View style={{ marginTop: 20 }}>
                <View
                  style={{ borderBottomWidth: 1, borderBottomColor: '#E0E0E0', marginBottom: 10 }}
                />
                <StyledButton onPress={() => handleFilterPress('groups')}>
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: 'bold',
                      marginBottom: 10,
                      fontFamily: 'inter-bold',
                      color: '#3F3D3D',
                    }}>
                    Ver todos os resultados de Grupos
                  </Text>
                </StyledButton>
              </View>
            )}
          </Section>
        )}

        {(selectedSection === 'posts' || selectedSection === '') && (
          <Section>
            <SectionTitle
              style={{
                fontSize: 12,
                fontWeight: 'bold',
                marginBottom: 25,
                fontFamily: 'inter-bold',
                color: '#3F3D3D',
              }}>
              Publicações
            </SectionTitle>

            {data.posts.map((item) => {
              const date = new Date(item.createdAt);
              const formattedDate = `${String(date.getDate()).padStart(2, '0')}-${String(date.getMonth() + 1).padStart(2, '0')}-${date.getFullYear()}, ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;

              return (
                <PostItem
                  key={item.id}
                  post={item}
                  formattedDate={formattedDate}
                  fetchUserName={fetchUserName}
                  fetchNumComments={fetchNumComments}
                />
              );
            })}

            {selectedSection === '' && (
              <View style={{ marginTop: 20 }}>
                <View
                  style={{ borderBottomWidth: 1, borderBottomColor: '#E0E0E0', marginBottom: 10 }}
                />
                <StyledButton onPress={() => handleFilterPress('posts')}>
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: 'bold',
                      marginBottom: 10,
                      fontFamily: 'inter-bold',
                      color: '#3F3D3D',
                    }}>
                    Ver todos os resultados de Posts
                  </Text>
                </StyledButton>
              </View>
            )}
          </Section>
        )}
      </ScrollView>
    </Container>
  );
}
