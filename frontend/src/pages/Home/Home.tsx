/* eslint-disable react/jsx-one-expression-per-line */
/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable global-require */
/* eslint-disable no-confusing-arrow */
/* eslint-disable react/no-array-index-key */
/* eslint-disable react/jsx-indent-props */
/* eslint-disable react/jsx-indent */
/* eslint-disable implicit-arrow-linebreak */
import React, { useEffect, useState, useCallback } from 'react';
import {
  TouchableOpacity,
  View,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { MMKV } from 'react-native-mmkv';
import { Buffer } from 'buffer';
import { StatusBar } from 'expo-status-bar';
import { useFocusEffect } from '@react-navigation/native';
import { Toast } from 'react-native-toast-message/lib/src/Toast';
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
import useFetch from '../../hooks/useFetch';
import ErrorState from '../../components/ErrorState/ErrorState';
import StaleDataBanner from '../../components/StaleDataBanner/StaleDataBanner';

export const storageHome = new MMKV();

const POSTS_PER_PAGE = 15;
const defaultAvatar = require('../../assets/user-profile.png');

async function fetchFirstPostsPage(): Promise<{ posts: any[]; hasMore: boolean }> {
  try {
    const response = await api.get('participant/groups/posts', {
      params: { page: 1, limit: POSTS_PER_PAGE },
    });

    const { data: newPosts, meta } = response.data;
    return {
      posts: Array.isArray(newPosts) ? newPosts : [],
      hasMore: meta.page < meta.lastPage,
    };
  } catch (error: any) {
    // Rota nova ainda não existe (404): usa a rota antiga
    if (error?.response?.status !== 404) {
      throw error;
    }

    const fallbackResponse = await api.get('participant/groups/');
    const allGroups = Array.isArray(fallbackResponse.data) ? fallbackResponse.data : [];
    const allPosts: any[] = [];

    allGroups.forEach((group: any) => {
      const groupPosts = group.group?.posts || group.group?.Post || [];
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
    });

    allPosts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const startIndex = 0;
    const endIndex = POSTS_PER_PAGE;
    return {
      posts: allPosts.slice(startIndex, endIndex),
      hasMore: endIndex < allPosts.length,
    };
  }
}

export default function Home({ navigation }: any) {
  const { toggleMenu } = useSideMenu();
  const { loggedId } = useAuth();
  const [hiddenGroupIds, setHiddenGroupIds] = useState<string[]>([]);
  const [profileImage, setProfileImage] = useState<any>(null);

  const [extraPosts, setExtraPosts] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const userQuery = useFetch<any>(
    async () => (await api.get(`/user/${loggedId}`)).data,
    [loggedId],
    {
      enabled: !!loggedId,
    },
  );

  const groupsQuery = useFetch<any[]>(
    async () => {
      const res = await api.get('participant/groups/');
      const list = Array.isArray(res.data) ? res.data : (res.data?.data ?? []);
      // Zera os posts: o feed os busca separadamente
      return (Array.isArray(list) ? list : []).map((group: any) => ({
        ...group,
        group: {
          ...group.group,
          Post: [],
        },
      }));
    },
    [loggedId],
    {
      enabled: !!loggedId,
    },
  );

  const postsQuery = useFetch<{ posts: any[]; hasMore: boolean }>(fetchFirstPostsPage, [loggedId], {
    enabled: !!loggedId,
  });

  const groups = groupsQuery.data ?? [];
  const posts = [...(postsQuery.data?.posts ?? []), ...extraPosts];

  useEffect(() => {
    setPage(1);
    setExtraPosts([]);
    setHasMore(postsQuery.data?.hasMore ?? false);
  }, [postsQuery.data]);

  const loadMorePosts = useCallback(async () => {
    if (loadingMore || !hasMore || !loggedId) return;

    setLoadingMore(true);
    try {
      const response = await api.get('participant/groups/posts', {
        params: { page: page + 1, limit: POSTS_PER_PAGE },
      });

      const { data: newPosts, meta } = response.data;
      setExtraPosts((prev) => [...prev, ...(Array.isArray(newPosts) ? newPosts : [])]);
      setPage(meta.page);
      setHasMore(meta.page < meta.lastPage);
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Erro inesperado',
        text2: 'Não foi possível carregar mais posts.',
      });
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, hasMore, page, loggedId]);

  const handleLoadMore = useCallback(() => {
    if (!loadingMore && hasMore && loggedId) {
      loadMorePosts();
    }
  }, [loadingMore, hasMore, loggedId, loadMorePosts]);

  const handleRefresh = useCallback(() => {
    postsQuery.refresh();
    groupsQuery.refresh();
    userQuery.refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const fullName = userQuery.data?.fullName ?? (userQuery.loading ? '' : 'Usuário');

  const renderGroups = () => {
    if (groupsQuery.loading) {
      return <ActivityIndicator size="large" color="#EF4036" style={{ marginTop: 20 }} />;
    }

    if (groupsQuery.error && groupsQuery.data === undefined) {
      return (
        <ErrorState
          inline
          text="Não foi possível carregar seus grupos."
          onRetry={groupsQuery.refetch}
        />
      );
    }

    if (groups.length === 0) {
      return (
        <GroupDataText font="inter-bold" color="#959393" size="20px">
          Você não possui grupos...
        </GroupDataText>
      );
    }

    return groups.map((item: any) => (
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
    ));
  };

  const renderMural = () => {
    if (postsQuery.loading) {
      return <ActivityIndicator size="large" color="#EF4036" style={{ marginTop: 20 }} />;
    }

    if (postsQuery.error && postsQuery.data === undefined) {
      return (
        <ErrorState
          inline
          text="Não foi possível carregar os posts."
          onRetry={postsQuery.refetch}
        />
      );
    }

    return (
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
        {loadingMore && (
          <ActivityIndicator
            size="large"
            color="#EF4036"
            style={{ marginTop: 20, marginBottom: 20 }}
          />
        )}
        {!loadingMore && hasMore && filteredPosts.length > 0 && (
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
    );
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
        scrollEventThrottle={200}
        refreshControl={
          <RefreshControl
            refreshing={postsQuery.refreshing || groupsQuery.refreshing}
            onRefresh={handleRefresh}
            colors={['#EF4036']}
            tintColor="#EF4036"
          />
        }>
        <HomePageWhite>
          {(postsQuery.stale || groupsQuery.stale) && (
            <StaleDataBanner
              refreshing={postsQuery.refreshing || groupsQuery.refreshing}
              onRefresh={() => {
                postsQuery.refresh();
                groupsQuery.refresh();
              }}
            />
          )}
          <HomeContainerGroup>
            <GroupDataText font="inter-bold" color="#3F3D3D" size="20px">
              Grupos
            </GroupDataText>
            <HomeContainerListGroup>{renderGroups()}</HomeContainerListGroup>
          </HomeContainerGroup>
          <GroupDataLine />
          <HomeContainerMural>
            <GroupDataText font="inter-bold" color="#3F3D3D" size="20px">
              Mural
            </GroupDataText>
            {renderMural()}
          </HomeContainerMural>
        </HomePageWhite>
      </ScrollView>
    </HomePageBlue>
  );
}
