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
import { storage } from '../../pages/SignIn/SignIn';
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
}

interface DataState {
  users: User[];
  groups: Group[];
  posts: Post[];
}

export default function ResultSection({ searchText, saveRecentUser }: ResultSectionProps) {
  const [selectedSection, setSelectedSection] = useState('');
  const [data, setData] = useState<DataState>({ users: [], groups: [], posts: [] });
  const screenWidth = Dimensions.get('window').width;
  const screenHeight = Dimensions.get('window').height;
  const [accessToken, setAccessToken] = useState<string | null>(null);

  const [fontsLoaded] = useFonts({
    'inter-bold': require('../../fonts/Inter-Bold.ttf'),
    'inter-regular': require('../../fonts/Inter-Regular.ttf'),
  });

  useEffect(() => {
    // Retrieve the access token from storage
    const token = storage.getString('accessToken');
    if (token) setAccessToken(token);
    console.log(token);
  }, []);

  const fetchData = async (url: string, sectionKey?: keyof DataState): Promise<void> => {
    console.log(`Dentro do fechData: ${accessToken}`);

    if (!accessToken) {
      console.error('No access token available.');
      return;
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ input: searchText }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const json = await response.json();
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
      fetchData('http://localhost:3000/search');
    }
  }, [searchText, accessToken]);

  useEffect(() => {
    if (selectedSection) {
      const url = `http://localhost:3000/search/filter/${selectedSection.toLowerCase()}`;
      fetchData(url, selectedSection as keyof DataState);
    }
  }, [selectedSection, accessToken]);

  const fetchUserName = async (userId: string): Promise<string> => {
    if (!accessToken) {
      console.error('No access token available.');
      return 'Nome não encontrado';
    }

    try {
      const response = await fetch(`http://localhost:3000/user/${userId}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const user = await response.json();
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
      const response = await fetch(`http://localhost:3000/post/${postId}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const postDetails = await response.json();
      return postDetails.Comment ? postDetails.Comment.length : 0;
    } catch (error) {
      console.error('Error fetching comments:', error);
      return 0;
    }
  };

  const handleFilterPress = (section: string): void => {
    // Toggle section selection
    const newSection = selectedSection === section ? '' : section;

    // Reset data state to ensure fresh fetch
    setData({ users: [], groups: [], posts: [] });

    // Set selected section to trigger useEffect and fetch data
    setSelectedSection(newSection);

    // Fetch all sections when no specific filter is selected
    if (!newSection) {
      fetchData('http://localhost:3000/search');
    } else {
      const url = `http://localhost:3000/search/filter/${newSection.toLowerCase()}`;
      fetchData(url, newSection as keyof DataState);
    }
  };

  if (!fontsLoaded || !accessToken) {
    return null;
  }

  return (
    <Container>
      <Text
        style={{
          fontSize: 12,
          fontWeight: 'bold',
          marginBottom: 10,
          fontFamily: 'inter-bold',
          color: '#515151',
          marginTop: 20,
        }}
      >
        Filtros
      </Text>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-around',
          marginTop: 10,
          marginBottom: 10,
        }}
      >
        <TouchableOpacity
          style={{
            padding: 10,
            backgroundColor: selectedSection === 'users' ? '#FFA8A6' : '#E0E0E0',
            borderRadius: 30,
            width: screenWidth / 3.6,
            height: screenHeight / 28.3,
            justifyContent: 'center',
            alignItems: 'center',
          }}
          onPress={() => handleFilterPress('users')}
        >
          <Text style={{ fontFamily: 'inter-regular', fontSize: 14 }}>Pessoas</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            padding: 10,
            backgroundColor: selectedSection === 'groups' ? '#FFA8A6' : '#E0E0E0',
            borderRadius: 30,
            width: screenWidth / 3.6,
            height: screenHeight / 28.3,
            justifyContent: 'center',
            alignItems: 'center',
          }}
          onPress={() => handleFilterPress('groups')}
        >
          <Text style={{ fontFamily: 'inter-regular', fontSize: 14 }}>Grupos</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            padding: 10,
            backgroundColor: selectedSection === 'posts' ? '#FFA8A6' : '#E0E0E0',
            borderRadius: 30,
            width: screenWidth / 3.6,
            height: screenHeight / 28.3,
            justifyContent: 'center',
            alignItems: 'center',
          }}
          onPress={() => handleFilterPress('posts')}
        >
          <Text style={{ fontFamily: 'inter-regular', fontSize: 14 }}>Publicações</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={{ height: '100%' }}>
        {(selectedSection === 'users' || selectedSection === '') && (
          <Section>
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
                    <Name>{`${fullName[0]} ${fullName[1] || ''}`}</Name>
                  </TouchableOpacity>
                  <TouchableOpacity>
                    <TrashCan />
                  </TouchableOpacity>
                </Card>
              );
            })}
            {selectedSection === '' && (
              <View style={{ width: '100%', marginTop: 20 }}>
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
                    }}
                  >
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
              }}
            >
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
                  }}
                >
                  <Name>{group.name}</Name>
                </TouchableOpacity>
              </Card>
            ))}
            {selectedSection === '' && (
              <View style={{ width: '100%', marginTop: 20 }}>
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
                    }}
                  >
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
              }}
            >
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
              <View style={{ width: '100%', marginTop: 20 }}>
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
                    }}
                  >
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
