/* eslint-disable global-require */
import React, { useState, useEffect, useCallback } from 'react';
import { TouchableOpacity, View, Text, ScrollView, Dimensions, Alert } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Buffer } from 'buffer';
import {
  Avatar,
  Card,
  Container,
  LoadMoreDivider,
  LoadMoreSection,
  LoadMoreText,
  Name,
  Section,
  SectionTitle,
  StyledButton,
} from './ResultSectionStyle';
import PostItem from '../PostItem/PostItem';
import api from '../../services/api';
import TrashCan from '../../assets/trash-can.svg';
import DeleteOneConfirmation from '../DeleteOneConfirmation/DeleteOneConfirmation';
import { RootStackParamList } from '../../navigation/types';
import { useAuth } from '../../context/auth/useAuth';

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
  saveRecentUser: (user: { id: string; name: string; avatar: any }) => void;
  admin: boolean;
}

interface DataState {
  users: User[];
  groups: Group[];
  posts: Post[];
}

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
}

const DEFAULT_PAGE_SIZE = 10;

export default function ResultSection({ searchText, saveRecentUser, admin }: ResultSectionProps) {
  const { loggedId } = useAuth();
  const [selectedSection, setSelectedSection] = useState<keyof DataState | ''>('');
  const [data, setData] = useState<DataState>({ users: [], groups: [], posts: [] });
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [deleteModal, setDeleteModal] = useState({
    visible: false,
    type: '', // 'user', 'group', or 'post'
    id: '',
  });
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const screenWidth = Dimensions.get('window').width;
  const screenHeight = Dimensions.get('window').height;
  const defaultAvatar = require('../../assets/user-profile.png');

  const [fontsLoaded] = useFonts({
    'inter-bold': require('../../fonts/Inter-Bold.ttf'),
    'inter-regular': require('../../fonts/Inter-Regular.ttf'),
  });

  const [userAvatars, setUserAvatars] = useState<Record<string, any>>({});

  const getUserProfileImage = async (userId: string) => {
    if (!loggedId) {
      return defaultAvatar;
    }

    try {
      const imageResponse = await api.get(`/user/${userId}/profile-picture`, {
        responseType: 'arraybuffer',
      });

      const imageStr = Buffer.from(imageResponse.data, 'binary').toString('base64');
      const imageUri = `data:image/jpeg;base64,${imageStr}`;
      return { uri: imageUri };
    } catch (error) {
      return defaultAvatar;
    }
  };

  // Função para buscar dados do servidor
  const fetchSearch = useCallback(async (): Promise<void> => {
    if (!loggedId) {
      console.error('No user logged in.');
      return;
    }

    try {
      const response = await api.post('/search', { input: searchText });

      const json = response.data;
      setData({
        users: json.users ?? [],
        groups: json.groups ?? [],
        posts: json.posts ?? [],
      });
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }, [loggedId, searchText]);

  const fetchFiltered = useCallback(
    async (section: keyof DataState, pageNumber: number): Promise<void> => {
      if (!loggedId) {
        console.error('No user logged in.');
        return;
      }

      try {
        const response = await api.post(`/search/filter/${section}`, {
          input: searchText,
          page: pageNumber,
          limit: DEFAULT_PAGE_SIZE,
        });

        const { data: items, meta }: { data: (User | Group | Post)[]; meta: PaginationMeta } =
          response.data;

        setData((prevData) => ({
          ...prevData,
          [section]: pageNumber === 1 ? items : [...prevData[section], ...items],
        }));
        setPage(meta?.page ?? pageNumber);
        setHasMore(meta?.hasMore ?? false);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    },
    [loggedId, searchText],
  );

  const handleLoadMore = (section: keyof DataState): void => {
    if (isLoadingMore) return;
    setIsLoadingMore(true);
    fetchFiltered(section, page + 1).finally(() => setIsLoadingMore(false));
  };

  // Delete user
  const onPressUser = async (userId: string) => {
    try {
      await api.delete(`/user/${userId}`);

      Alert.alert('Sucesso', 'Usuário deletado com sucesso!');

      setData((prevData) => ({
        ...prevData,
        users: prevData.users.filter((user) => user.id !== userId),
      }));
    } catch (error: any) {
      console.error('Erro ao deletar usuário:', error);
      Alert.alert('Erro', error?.response?.data?.message || 'Não foi possível deletar o usuário.');
    }
  };
  // Delete group
  const onPressGroup = async (groupId: string) => {
    try {
      await api.delete(`/group/${groupId}`);

      Alert.alert('Sucesso', 'Grupo deletado com sucesso!');

      setData((prevData) => ({
        ...prevData,
        groups: prevData.groups.filter((group) => group.id !== groupId),
      }));
    } catch (error: any) {
      console.error('Erro ao deletar grupo:', error);
      Alert.alert('Erro', error?.response?.data?.message || 'Não foi possível deletar o grupo.');
    }
  };
  // Delete post
  const onPressPost = async (postId: string) => {
    try {
      await api.delete(`/post/${postId}`);

      Alert.alert('Sucesso', 'Publicação deletada com sucesso!');

      setData((prevData) => ({
        ...prevData,
        posts: prevData.posts.filter((post) => post.id !== postId),
      }));
    } catch (error: any) {
      console.error('Erro ao deletar publicação:', error);
      Alert.alert(
        'Erro',
        error?.response?.data?.message || 'Não foi possível deletar a publicação.',
      );
    }
  };
  useEffect(() => {
    if (searchText && !selectedSection) {
      fetchSearch();
    }
  }, [searchText, selectedSection, fetchSearch]);

  useEffect(() => {
    if (selectedSection) {
      fetchFiltered(selectedSection, 1);
    }
  }, [selectedSection, fetchFiltered]);

  const fetchUserName = async (userId: string): Promise<string> => {
    if (!loggedId) {
      console.error('No user logged in.');
      return 'Nome não encontrado';
    }

    try {
      const response = await api.get(`/user/${userId}`);

      const user = response.data;
      const fullName = user.fullName.split(' ');
      return `${fullName[0]} ${fullName[1] || ''}`;
    } catch (error) {
      console.error('Error fetching user name:', error);
      return 'Nome não encontrado';
    }
  };

  const fetchNumComments = async (postId: string): Promise<number> => {
    if (!loggedId) {
      console.error('No user logged in.');
      return 0;
    }

    try {
      const response = await api.get(`/post/${postId}`);

      const postDetails = response.data;
      return postDetails.Comment ? postDetails.Comment.length : 0;
    } catch (error) {
      console.error('Error fetching comments:', error);
      return 0;
    }
  };

  useEffect(() => {
    const loadUserAvatars = async () => {
      const avatars = await Promise.all(
        data.users.map(async (user) => ({
          id: user.id,
          image: await getUserProfileImage(user.id),
        })),
      );

      const newUserAvatars: Record<string, any> = {};
      avatars.forEach(({ id, image }) => {
        newUserAvatars[id] = image;
      });

      setUserAvatars(newUserAvatars);
    };

    if (data.users.length > 0) {
      loadUserAvatars();
    }
  }, [data.users]);

  const handleFilterPress = (section: keyof DataState): void => {
    const newSection = selectedSection === section ? '' : section;
    setData({ users: [], groups: [], posts: [] });
    setPage(1);
    setHasMore(false);
    setIsLoadingMore(false);
    setSelectedSection(newSection);
  };

  const handleDeletePress = (type: 'user' | 'group' | 'post', id: string) => {
    setDeleteModal({ visible: true, type, id });
  };

  const handleConfirmDelete = async () => {
    if (deleteModal.type === 'user') {
      await onPressUser(deleteModal.id);
    } else if (deleteModal.type === 'group') {
      await onPressGroup(deleteModal.id);
    } else if (deleteModal.type === 'post') {
      await onPressPost(deleteModal.id);
    }
    setDeleteModal({ visible: false, type: '', id: '' });
  };

  const getDeleteModalText = () => {
    switch (deleteModal.type) {
      case 'user':
        return 'Tem certeza que deseja excluir este usuário?';
      case 'group':
        return 'Tem certeza que deseja excluir este grupo?';
      default:
        return 'Tem certeza que deseja excluir esta publicação?';
    }
  };

  if (!fontsLoaded || !loggedId) {
    return null;
  }

  return (
    <>
      <DeleteOneConfirmation
        visible={deleteModal.visible}
        text={getDeleteModalText()}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteModal({ visible: false, type: '', id: '' })}
      />
      <Container>
        <View
          style={{
            paddingLeft: 10,
            paddingRight: 10,
            paddingBottom: 10,
            borderBottomWidth: 1,
            borderBottomColor: '#E0E0E0',
          }}>
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
              testID="filtro-pessoas"
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
              testID="filtro-grupos"
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
              testID="filtro-publicacoes"
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
                const fullNameParts = person.fullName.split(' ');
                return (
                  <Card
                    key={person.id}
                    style={{ marginBottom: 10 }}
                    testID={`user-card-${person.id}`}>
                    <TouchableOpacity
                      testID={`user-touchable-${person.id}`}
                      onPress={() => {
                        saveRecentUser({
                          id: person.id,
                          name: person.fullName,
                          avatar: userAvatars[person.id] || defaultAvatar,
                        });
                        if (person.id === loggedId) {
                          navigation.navigate('Profile', { id: person.id });
                        } else {
                          navigation.navigate('VisitorProfile', { id: person.id });
                        }
                      }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', paddingLeft: 15 }}>
                        <Avatar source={userAvatars[person.id] || defaultAvatar} />
                        <Name
                          testID={`user-name-${person.id}`}
                          fontFamily="inter-regular"
                          fontColor="#3F3D3D">
                          {`${fullNameParts[0]} ${fullNameParts[1] || ''}`}
                        </Name>
                      </View>
                    </TouchableOpacity>
                    {admin && (
                      <TouchableOpacity
                        testID={`user-delete-button-${person.id}`}
                        onPress={() => handleDeletePress('user', person.id)}>
                        <TrashCan />
                      </TouchableOpacity>
                    )}
                  </Card>
                );
              })}
              {selectedSection === '' && (
                <View style={{ marginTop: 20 }}>
                  <View
                    style={{ borderBottomWidth: 1, borderBottomColor: '#E0E0E0', marginBottom: 10 }}
                  />
                  <StyledButton
                    testID="ver-todos-pessoas"
                    onPress={() => handleFilterPress('users')}>
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
              {selectedSection === 'users' && hasMore && (
                <LoadMoreSection>
                  <LoadMoreDivider />
                  <StyledButton
                    testID="carregar-mais-pessoas"
                    onPress={() => handleLoadMore('users')}
                    disabled={isLoadingMore}>
                    <LoadMoreText>{isLoadingMore ? 'Carregando...' : 'Carregar mais'}</LoadMoreText>
                  </StyledButton>
                </LoadMoreSection>
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
                <Card key={group.id} style={{ marginBottom: 10 }} testID={`group-card-${group.id}`}>
                  <TouchableOpacity
                    testID={`group-touchable-${group.id}`}
                    onPress={() => {
                      saveRecentUser({
                        id: group.id,
                        name: group.name,
                        avatar: defaultAvatar,
                      });
                      navigation.navigate('GroupPage', {
                        groupId: group.id,
                        groupName: group.name,
                      });
                    }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', paddingLeft: 15 }}>
                      <Avatar source={defaultAvatar} testID={`group-avatar-${group.id}`} />
                      <Name
                        fontFamily="inter-regular"
                        fontColor="#3F3D3D"
                        testID={`group-name-${group.id}`}>
                        {group.name}
                      </Name>
                    </View>
                  </TouchableOpacity>
                  {admin && (
                    <TouchableOpacity
                      testID={`group-delete-button-${group.id}`}
                      onPress={() => handleDeletePress('group', group.id)}>
                      <TrashCan />
                    </TouchableOpacity>
                  )}
                </Card>
              ))}
              {selectedSection === '' && (
                <View style={{ marginTop: 20 }}>
                  <View
                    style={{ borderBottomWidth: 1, borderBottomColor: '#E0E0E0', marginBottom: 10 }}
                  />
                  <StyledButton
                    testID="ver-todos-grupos"
                    onPress={() => handleFilterPress('groups')}>
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
              {selectedSection === 'groups' && hasMore && (
                <LoadMoreSection>
                  <LoadMoreDivider />
                  <StyledButton
                    testID="carregar-mais-grupos"
                    onPress={() => handleLoadMore('groups')}
                    disabled={isLoadingMore}>
                    <LoadMoreText>{isLoadingMore ? 'Carregando...' : 'Carregar mais'}</LoadMoreText>
                  </StyledButton>
                </LoadMoreSection>
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
                const formattedDate = `${String(date.getDate()).padStart(2, '0')}-${String(
                  date.getMonth() + 1,
                ).padStart(2, '0')}-${date.getFullYear()}, ${String(date.getHours()).padStart(
                  2,
                  '0',
                )}:${String(date.getMinutes()).padStart(2, '0')}`;
                return (
                  <Card key={item.id}>
                    <View style={{ flex: 1, paddingLeft: 15 }}>
                      <PostItem
                        post={item}
                        formattedDate={formattedDate}
                        fetchUserName={fetchUserName}
                        fetchNumComments={fetchNumComments}
                        testID={`post-item-${item.id}`}
                      />
                    </View>
                    {admin && (
                      <TouchableOpacity
                        testID={`post-delete-button-${item.id}`}
                        style={{ marginLeft: 10 }}
                        onPress={() => handleDeletePress('post', item.id)}>
                        <TrashCan />
                      </TouchableOpacity>
                    )}
                  </Card>
                );
              })}

              {selectedSection === '' && (
                <View style={{ marginTop: 20 }}>
                  <View
                    style={{ borderBottomWidth: 1, borderBottomColor: '#E0E0E0', marginBottom: 10 }}
                  />
                  <StyledButton
                    testID="ver-todos-publicacoes"
                    onPress={() => handleFilterPress('posts')}>
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
              {selectedSection === 'posts' && hasMore && (
                <LoadMoreSection>
                  <LoadMoreDivider />
                  <StyledButton
                    testID="carregar-mais-publicacoes"
                    onPress={() => handleLoadMore('posts')}
                    disabled={isLoadingMore}>
                    <LoadMoreText>{isLoadingMore ? 'Carregando...' : 'Carregar mais'}</LoadMoreText>
                  </StyledButton>
                </LoadMoreSection>
              )}
            </Section>
          )}
        </ScrollView>
      </Container>
    </>
  );
}
