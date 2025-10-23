/* eslint-disable no-nested-ternary */
/* eslint-disable global-require */
import React, { useState, useEffect } from 'react';
import { useFonts } from 'expo-font';
import {
  TouchableOpacity,
  View,
  Text,
  ScrollView,
  Dimensions,
  Alert,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
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
import DeleteOneConfirmation from '../DeleteOneConfirmation/DeleteOneConfirmation';
import { storage } from '../../pages/SignIn/SignIn';
import { RootStackParamList } from '../../navigation/types';

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

  user: {
    fullName: string;
  };
  _count: {
    Comment: number;
  };
}

interface ResultSectionProps {
  searchText: string;
  saveRecentUser: (user: { id: number; name: string; avatar: any }) => void;
  accessToken: string;
  admin: boolean;
}

interface DataState {
  users: User[];
  groups: Group[];
  posts: Post[];
}

// chave pode ser uma das chaves de DataState ou uma string vazia
type SectionKey = keyof DataState | '';

const LIMIT = 20; // igual ao do backend

export default function ResultSection({
  searchText,
  saveRecentUser,
  accessToken,
  admin,
}: ResultSectionProps) {
  const [selectedSection, setSelectedSection] = useState<SectionKey>('');
  const [data, setData] = useState<DataState>({ users: [], groups: [], posts: [] });
  const [deleteModal, setDeleteModal] = useState({
    visible: false,
    type: '', // 'user', 'group', or 'post'
    id: '',
  });

  // PAGINACAO
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const loggedId = storage.getString('loggedId');
  const screenWidth = Dimensions.get('window').width;
  const screenHeight = Dimensions.get('window').height;
  const avatar = require('../../assets/duck.png');

  const [fontsLoaded] = useFonts({
    'inter-bold': require('../../fonts/Inter-Bold.ttf'),
    'inter-regular': require('../../fonts/Inter-Regular.ttf'),
  });

  const fetchData = async (
    section: SectionKey,
    isLoadMore = false, // true se for carregar mais
  ): Promise<void> => {
    if (isLoading || (isLoadMore && !hasMore)) {
      return;
    }

    if (!accessToken) {
      console.error('No access token available.');
      return;
    }

    setIsLoading(true);
    const currentPage = isLoadMore ? page : 1;
    const isPreview = section === ''; // estamos no modo preview?

    try {
      const url = isPreview ? '/search' : `/search/filter/${section.toLowerCase()}`;
      const params = isPreview
        ? { input: searchText } // preview nao precisa de paginacao
        : {
            input: searchText,
            page: currentPage,
            limit: LIMIT,
          };

      const response = await api.post(url, params, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const json = response.data;

      if (isPreview) {
        setData(json);
      } else {
        const newItems = json;

        if (isLoadMore) {
          setData((prevData) => ({
            ...prevData,
            [section]: [...prevData[section], ...newItems],
          }));
        } else {
          const freshData: DataState = { users: [], groups: [], posts: [] };
          freshData[section] = newItems;
          setData(freshData);
        }

        setPage(currentPage + 1);
        setHasMore(newItems.length === LIMIT);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };
  // Delete user
  const onPressUser = async (userId: string) => {
    try {
      const response = await api.delete(`/user/${userId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

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
      const response = await api.delete(`/group/${groupId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

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
      const response = await api.delete(`/post/${postId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

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
    if (searchText) {
      // reseta a paginacao
      setPage(1);
      setHasMore(true);

      // busca dados
      fetchData(selectedSection, false);
    } else {
      // limpa tudo se a busca for limpa
      setData({ users: [], groups: [], posts: [] });
    }
  }, [searchText, accessToken]);

  const handleFilterPress = (section: keyof DataState): void => {
    const newSection = selectedSection === section ? '' : section;

    // reseta o estado para a nova selecao
    setSelectedSection(newSection);
    setData({ users: [], groups: [], posts: [] });
    setPage(1);
    setHasMore(true);

    // busca a primeira pagina do novo filtro (ou preview)
    if (searchText) {
      fetchData(newSection, false);
    }
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

  const handleCancelDelete = () => {
    setDeleteModal({ visible: false, type: '', id: '' });
  };

  // funcao chamada pelo flatlist ao chegar no fim
  const loadMore = () => {
    if (selectedSection !== '' && !isLoading && hasMore) {
      fetchData(selectedSection, true); // true = carregar mais
    }
  };

  // Componente de rodape para o flatlist
  // mostra o "Carregando..."
  const renderFooter = () => {
    if (!isLoading) return null;
    return <ActivityIndicator size="large" color="#FFA8A6" style={{ marginVertical: 20 }} />;
  };

  if (!fontsLoaded || !accessToken) {
    return null;
  }

  // renderiza cada item no flatlist (modo filtrado)
  const renderFilteredItem = ({ item }: { item: User | Group | Post }) => {
    if (selectedSection === 'users') {
      const person = item as User;
      const fullName = person.fullName.split(' ');

      return (
        <Card key={person.id} style={{ marginBottom: 10 }} testID={`user-card-${person.id}`}>
          <TouchableOpacity
            testID={`user-touchable-${person.id}`}
            onPress={() => {
              saveRecentUser({
                id: parseInt(person.id, 10),
                name: person.fullName,
                avatar: require('../../assets/duck.png'),
              });
              if (String(person.id) === String(loggedId)) {
                navigation.navigate('Profile', { id: person.id });
              } else {
                navigation.navigate('VisitorProfile', { id: person.id });
              }
            }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', paddingLeft: 15 }}>
              <Avatar source={avatar} />
              <Name
                testID={`user-name-${person.id}`}
                fontFamily="inter-regular"
                fontColor="#3F3D3D">
                {`${fullName[0]} ${fullName[1] || ''}`}
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
    }

    if (selectedSection === 'groups') {
      const group = item as Group;
      return (
        <Card key={group.id} style={{ marginBottom: 10 }} testID={`group-card-${group.id}`}>
          <TouchableOpacity
            testID={`group-touchable-${group.id}`}
            onPress={() => {
              saveRecentUser({
                id: parseInt(group.id, 10),
                name: group.name,
                avatar: require('../../assets/duck.png'),
              });
              navigation.navigate('GroupPage', { groupId: group.id });
            }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Avatar source={avatar} testID={`group-avatar-${group.id}`} />
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
      );
    }

    if (selectedSection === 'posts') {
      const post = item as Post;
      const date = new Date(post.createdAt);

      const formattedDate = `${String(date.getDate()).padStart(2, '0')}-${String(
        date.getMonth() + 1,
      ).padStart(2, '0')}-${date.getFullYear()}, ${String(date.getHours()).padStart(
        2,
        '0',
      )}:${String(date.getMinutes()).padStart(2, '0')}`;

      const postWithData = {
        ...post,
        nameUser: post.user?.fullName || 'Usuario Desconhecido',
        numComments: post._count?.Comment || 0,
      };

      return (
        <Card key={post.id}>
          <View style={{ flex: 1, paddingLeft: 15 }}>
            <PostItem
              post={postWithData}
              formattedDate={formattedDate}
              testID={`post-item-${post.id}`}
            />
          </View>
          {admin && (
            <TouchableOpacity
              testID={`post-delete-button-$post.id`}
              style={{ marginLeft: 10 }}
              onPress={() => handleDeletePress('post', post.id)}>
              <TrashCan />
            </TouchableOpacity>
          )}
        </Card>
      );
    }

    return null;
  };

  return (
    <>
      <DeleteOneConfirmation
        visible={deleteModal.visible}
        text={
          deleteModal.type === 'user'
            ? 'Tem certeza que deseja excluir este usuário?'
            : deleteModal.type === 'group'
              ? 'Tem certeza que deseja excluir este grupo?'
              : 'Tem certeza que deseja excluir esta publicação?'
        }
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
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

        {selectedSection === '' ? (
          // modo preview: usa scrollview pois sao poucos
          <ScrollView contentContainerStyle={{ flexGrow: 1 }} style={{ height: '100%' }}>
            {/* secao pessoas */}
            {data.users.length > 0 && (
              <Section style={{ zIndex: 2}}>
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
                  <Card
                    key={person.id}
                    style={{ marginBottom: 10 }}
                    testID={`user-card-${person.id}`}>
                    <TouchableOpacity
                      testID={`user-touchable-${person.id}`}
                      onPress={() => {
                        saveRecentUser({
                          id: parseInt(person.id, 10),
                          name: person.fullName,
                          avatar: require('../../assets/duck.png'),
                        });
                        if (String(person.id) === String(loggedId)) {
                          navigation.navigate('Profile', { id: person.id });
                        } else {
                          navigation.navigate('VisitorProfile', { id: person.id });
                        }
                      }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', paddingLeft: 15 }}>
                        <Avatar source={avatar} />
                        <Name
                          testID={`user-name-${person.id}`}
                          fontFamily="inter-regular"
                          fontColor="#3F3D3D">
                          {`${fullName[0]} ${fullName[1] || ''}`}
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
              <View style={{ marginTop: 20}}>
                <View style={{ borderBottomWidth: 1, borderBottomColor: '#E0E0E0', marginBottom: 10 }} />
                  <StyledButton testID="ver-todos-pessoas" onPress={() => handleFilterPress('users')}>
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
              </Section>
            )}

            {/* secao grupos */}
            {data.groups.length > 0 && (
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
                        id: parseInt(group.id, 10),
                        name: group.name,
                        avatar: require('../../assets/duck.png'),
                      });
                      navigation.navigate('GroupPage', { groupId: group.id });
                    }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Avatar source={avatar} testID={`group-avatar-${group.id}`} />
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
              </Section>
            )}

            {/* secao posts */}
            {data.posts.length > 0 && (
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

                const postWithData = {
                  ...item,
                  nameUser: item.user?.fullName || 'Usuário Desconhecido',
                  numCommments: item._count?.Comment || 0,
                };

                return (
                   <Card key={item.id}>
                    <View style={{ flex: 1, paddingLeft: 15 }}>
                      <PostItem
                        post={postWithData}
                        formattedDate={formattedDate}
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
              </Section>
              )}
          </ScrollView>
        ) : (
          // modo filtro
          <FlatList
          data={data[selectedSection]}
          renderItem={renderFilteredItem}
          keyExtractor={(item) => item.id}
          onEndReached={loadMore} // chama a loadMore ao chegar no fim
          onEndReachedThreshold={0.5} // distancia no fim pra chamar
          ListFooterComponent={renderFooter} // mostra o ActivityIndicator
          style={{ width: '100%' }}
          />
        )}
      </Container>
    </>
  );
}
