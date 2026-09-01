/* eslint-disable react/jsx-one-expression-per-line */
/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable global-require */
/* eslint-disable @typescript-eslint/indent */
/* eslint-disable no-confusing-arrow */
/* eslint-disable react/no-array-index-key */
/* eslint-disable react/jsx-indent-props */
/* eslint-disable react/jsx-indent */
/* eslint-disable implicit-arrow-linebreak */
import React, { useEffect, useState, useCallback } from 'react';
import { TouchableOpacity, View, ActivityIndicator, ScrollView } from 'react-native';
import { MMKV } from 'react-native-mmkv';
import { Buffer } from 'buffer';
import { StatusBar } from 'expo-status-bar';
import { useFocusEffect } from '@react-navigation/native';
import {
  HomeContainerGroup,
  HomeContainerInfo,
  HomeContainerListGroup,
  HomeContainerMural,
  HomePageBlue,
  HomePageWhite,
} from './HomeStyle';
import { GroupDataLine, GroupDataText } from '../GroupData/GroupDataStyle';
import GroupButton from '../../components/GroupButton/GroupButton';
import {
  PostCardIcons,
  PostCardImageUser,
  PostCardSpaceBetween,
} from '../../components/PostCard/PostCardStyle';
import PostCard from '../../components/PostCard/PostCard';
import api from '../../services/api';
import MenuIcon from '../../assets/menu-white-icon.svg';
import LupaIcon from '../../assets/lupa-white-icon.svg';
import { useAuth } from '../../context/auth/useAuth';
import { useSideMenu } from '../../context/SideMenuContext';

export const storageHome = new MMKV();

const POSTS_PER_PAGE = 15;

export default function Home({ navigation }: any) {
  const { toggleMenu } = useSideMenu();
  const { loggedId } = useAuth();
  const defaultAvatar = require('../../assets/user-profile.png');
  const [fullName, setFullName] = useState('');
  const [groups, setGroups] = useState<any[]>([]);
  const [hiddenGroupIds, setHiddenGroupIds] = useState<string[]>([]);
  const [profileImage, setProfileImage] = useState<any>(null);

  // Estados para paginação
  const [posts, setPosts] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!loggedId) return;

      // Buscar informações do usuário
      api
        .get(`/user/${loggedId}`)
        .then((res) => setFullName(res.data.fullName))
        .catch(() => setFullName('Usuário'));

      // Buscar grupos (sem posts)
      api
        .get('participant/groups/')
        .then((res) => {
          // Remover posts dos grupos pois vamos buscá-los separadamente
          const groupsWithoutPosts = (res.data || []).map((group: any) => ({
            ...group,
            group: {
              ...group.group,
              Post: [],
            },
          }));
          setGroups(groupsWithoutPosts);
        })
        .catch(() => setGroups([]));

      // Carregar primeira página de posts
      loadPosts(1, true);
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loggedId]);

  const loadPosts = useCallback(
    async (pageNumber: number, isInitial: boolean = false) => {
      if (loading) return;

      setLoading(true);
      if (isInitial) setInitialLoading(true);

      try {
        const response = await api.get('participant/groups/posts', {
          params: {
            page: pageNumber,
            limit: POSTS_PER_PAGE,
          },
        });

        const { data: newPosts, meta } = response.data;
        const hasMoreValue = meta.page < meta.lastPage;

        setPosts((prevPosts) => (pageNumber === 1 ? newPosts : [...prevPosts, ...newPosts]));
        setHasMore(hasMoreValue);
        setPage(meta.page);
      } catch (error: any) {
        // Fallback: Se a rota não existir (404), usar a rota antiga
        if (error?.response?.status === 404) {
          try {
            const fallbackResponse = await api.get('participant/groups/');

            // Extrair e paginar posts manualmente
            const allGroups = fallbackResponse.data || [];
            const allPosts: any[] = [];

            allGroups.forEach((group: any) => {
              const groupPosts = group.group?.posts || group.group?.Post || [];
              if (groupPosts.length > 0) {
                groupPosts.forEach((post: any) => {
                  allPosts.push({
                    ...post,
                    groupId: group.groupId,
                    group: {
                      name: group.group.name,
                    },
                    user: {
                      id: post.user?.id || post.userId,
                      fullName: post.user?.fullName || 'Usuário',
                    },
                  });
                });
              }
            });

            // Ordenar por data decrescente
            allPosts.sort(
              (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
            );

            // Paginar manualmente
            const limit = POSTS_PER_PAGE;
            const startIndex = (pageNumber - 1) * limit;
            const endIndex = startIndex + limit;
            const paginatedPosts = allPosts.slice(startIndex, endIndex);

            setPosts((prevPosts) =>
              pageNumber === 1 ? paginatedPosts : [...prevPosts, ...paginatedPosts],
            );
            setHasMore(endIndex < allPosts.length);
            setPage(pageNumber);
          } catch (fallbackError) {
            console.error('Erro ao carregar posts (fallback):', fallbackError);
          }
        } else {
          console.error('Erro ao carregar posts:', error);
        }
      } finally {
        setLoading(false);
        if (isInitial) setInitialLoading(false);
      }
    },
    [loading],
  );

  const handleLoadMore = useCallback(() => {
    if (!loading && hasMore && loggedId) {
      loadPosts(page + 1);
    }
  }, [loading, hasMore, page, loggedId, loadPosts]);

  useFocusEffect(
    useCallback(() => {
      const fetchUserData = async () => {
        if (loggedId) {
          try {
            const imageResponse = await api.get(`/user/${loggedId}/profile-picture`, {
              responseType: 'arraybuffer',
            });
            const imageStr = Buffer.from(imageResponse.data, 'binary').toString('base64');
            const imageUri = `data:image/jpeg;base64,${imageStr}`;
            setProfileImage({ uri: imageUri });
          } catch (error) {
            setProfileImage(defaultAvatar);
          }
        }
      };

      fetchUserData();
    }, [loggedId]),
  );

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

  function formatRelativeDate(postDate: string): string {
    const currentDate = new Date();
    const postDateObj = new Date(postDate);
    const differenceInMilliseconds = currentDate.getTime() - postDateObj.getTime();
    const differenceInMinutes = Math.floor(differenceInMilliseconds / (1000 * 60));
    const differenceInHours = Math.floor(differenceInMinutes / 60);
    const differenceInDays = Math.floor(differenceInHours / 24);

    const hours = postDateObj.getHours();
    const minutes = postDateObj.getMinutes();
    const formattedTime = `${hours}:${minutes < 10 ? `0${minutes}` : minutes}`;

    if (differenceInMinutes < 60) {
      return `hoje, ${formattedTime}`;
    }
    if (differenceInHours < 24) {
      return `ontem, ${formattedTime}`;
    }
    if (differenceInDays < 3) {
      return `há ${differenceInDays} dia${differenceInDays !== 1 ? 's' : ''}`;
    }
    return postDateObj.toLocaleDateString('pt-BR');
  }

  function onPressPostAction(id: string) {
    storageHome.set('idPost', id);
    navigation.navigate('Post', { postId: id });
  }

  const toggleGroupFilter = (groupId: string) => {
    setHiddenGroupIds((prev) =>
      prev.includes(groupId) ? prev.filter((id) => id !== groupId) : [...prev, groupId],
    );
  };

  // Filtrar posts baseado nos grupos ocultos
  const filteredPosts = posts.filter((post) => !hiddenGroupIds.includes(post.groupId));

  const isCloseToBottom = ({
    layoutMeasurement,
    contentOffset,
    contentSize,
  }: {
    layoutMeasurement: any;
    contentOffset: any;
    contentSize: any;
  }) => {
    const paddingToBottom = 200; // Aumentado para 200px para carregar antes
    const isClose =
      layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom;

    return isClose;
  };

  return (
    <HomePageBlue style={{ display: loggedId ? 'flex' : 'none' }}>
      <StatusBar />
      <HomeContainerInfo>
        <PostCardSpaceBetween>
          <PostCardIcons>
            <TouchableOpacity onPress={toggleMenu}>
              <MenuIcon />
            </TouchableOpacity>
          </PostCardIcons>
          <PostCardIcons style={{ gap: 10 }}>
            <TouchableOpacity testID="search-button" onPress={() => navigation.navigate('Search')}>
              <LupaIcon />
            </TouchableOpacity>
            <TouchableOpacity
              testID="profile-button"
              onPress={() => navigation.navigate('Profile')}>
              <PostCardImageUser source={profileImage || defaultAvatar} />
            </TouchableOpacity>
          </PostCardIcons>
        </PostCardSpaceBetween>
        <View>
          <GroupDataText font="inter-bold" color="#EF4036" size="20px">
            Olá,
          </GroupDataText>
          <GroupDataText numberOfLines={1} font="inter-bold" color="#ffff" size="20px">
            {fullName}!
          </GroupDataText>
        </View>
      </HomeContainerInfo>
      <ScrollView
        showsVerticalScrollIndicator={false}
        onScroll={({ nativeEvent }) => {
          if (isCloseToBottom(nativeEvent)) {
            handleLoadMore();
          }
        }}
        scrollEventThrottle={200}>
        <HomePageWhite>
          <HomeContainerGroup>
            <GroupDataText font="inter-bold" color="#3F3D3D" size="20px">
              Grupos
            </GroupDataText>
            <HomeContainerListGroup>
              {groups?.length > 0 ? (
                groups.map((item: any) => (
                  <GroupButton
                    key={item.groupId}
                    testID={`group-button-${item.groupId}`}
                    onPress={() => {
                      navigation.navigate('GroupPage', {
                        groupId: item.groupId,
                        groupName: item.group.name,
                      });
                      storageHome.set('groupId', item.groupId);
                    }}
                    groupId={item.groupId}
                    groupName={item.group.name}
                    onlineMembers={item.participantCount}
                    onPressFilter={() => toggleGroupFilter(item.groupId)}
                    filterIcon={!hiddenGroupIds.includes(item.groupId)}
                  />
                ))
              ) : (
                <GroupDataText font="inter-bold" color="#959393" size="20px">
                  Você não possui grupos...
                </GroupDataText>
              )}
            </HomeContainerListGroup>
          </HomeContainerGroup>
          <GroupDataLine />
          <HomeContainerMural>
            <GroupDataText font="inter-bold" color="#3F3D3D" size="20px">
              Mural
            </GroupDataText>
            {initialLoading ? (
              <ActivityIndicator size="large" color="#EF4036" style={{ marginTop: 20 }} />
            ) : (
              <>
                <View style={{ gap: 25 }}>
                  {filteredPosts.length > 0 ? (
                    filteredPosts.map((post: any) => (
                      <PostCard
                        key={post.id}
                        userId={post.user.id}
                        getUserProfileImage={getUserProfileImage}
                        nameUser={post.user.fullName}
                        postContent={post.input}
                        numComments={post.commentsCount}
                        date={formatRelativeDate(post.createdAt)}
                        originGroup={post.group.name}
                        tag
                        save
                        share
                        onPressPost={() => onPressPostAction(post.id)}
                        postId={post.id}
                      />
                    ))
                  ) : (
                    <GroupDataText font="inter-bold" color="#959393" size="20px">
                      Não há Posts...
                    </GroupDataText>
                  )}
                </View>
                {loading && !initialLoading && (
                  <ActivityIndicator
                    size="large"
                    color="#EF4036"
                    style={{ marginTop: 20, marginBottom: 20 }}
                  />
                )}
                {!loading && hasMore && filteredPosts.length > 0 && (
                  <TouchableOpacity
                    onPress={handleLoadMore}
                    style={{
                      backgroundColor: '#EF4036',
                      padding: 15,
                      borderRadius: 10,
                      marginTop: 20,
                      marginBottom: 20,
                      alignItems: 'center',
                    }}>
                    <GroupDataText font="inter-bold" color="#fff" size="16px">
                      Carregar mais posts
                    </GroupDataText>
                  </TouchableOpacity>
                )}
                {!hasMore && filteredPosts.length > 0 && (
                  <GroupDataText
                    font="inter-bold"
                    color="#959393"
                    size="16px"
                    style={{ textAlign: 'center', marginTop: 20, marginBottom: 20 }}>
                    Você chegou ao fim! 🎉
                  </GroupDataText>
                )}
              </>
            )}
          </HomeContainerMural>
        </HomePageWhite>
      </ScrollView>
    </HomePageBlue>
  );
}
