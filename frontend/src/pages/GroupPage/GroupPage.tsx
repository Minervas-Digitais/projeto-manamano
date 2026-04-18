/* eslint-disable react/jsx-indent */
/* eslint-disable no-nested-ternary */
/* eslint-disable react/jsx-closing-bracket-location */
/* eslint-disable global-require */
import React, { useState, useEffect, useCallback } from 'react';
import { useFonts } from 'expo-font';
import { Buffer } from 'buffer';
import {
  StyleSheet,
  View,
  Dimensions,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRoute } from '@react-navigation/native';
import { AxiosError } from 'axios';
import {
  GroupPageAddPostButton,
  GroupPageArchivesContainer,
  GroupPageCategoryContainer,
  GroupPageCategoryList,
  GroupPageContainer,
  GroupPageContent,
  GroupPageLessonsContainer,
  GroupPageListFixPost,
  GroupPagePostList,
  GroupPageTabs,
  GroupPageTabsContainer,
} from './GroupPageStyle';
import HeaderCustom from '../../components/HeaderCustom/HeaderCustom';
import { GroupDataText } from '../GroupData/GroupDataStyle';
import PostCard from '../../components/PostCard/PostCard';
import CategoryButton from '../../components/CategoryButton/CategoryButton';
import LessonsCard from '../../components/LessonsCard/LessonsCard';
import SideMenu from '../../components/SideMenu/SideMenu';
import api from '../../services/api';
import { storageHome } from '../Home/Home';
import EventCard from '../../components/EventCard/EventCard';
import GroupArchives from '../../components/GroupArchives/GroupArchives';
import NotificationIcon from '../../assets/notification-icon.svg';
import AddPostIcon from '../../assets/add-post-icon.svg';
import secureStorage from '../../services/secureStorage';

export default function GroupPage({ navigation }: any) {
  const route = useRoute();
  const { groupId } = route.params as { groupId: string };
  const { groupName } = route.params as { groupName: string };
  const defaultAvatar = require('../../assets/user-profile.png');

  const [muralSelect, setMuralSelect] = useState(true);
  const [classesSelect, setClassesSelect] = useState(false);
  const [filesSelect, setFilesSelect] = useState(false);
  const [filterPosts, setFilterPosts] = useState('Geral');
  const [filterFiles, setFilterFiles] = useState('Fotos');
  const [sideMenu, setSideMenu] = useState(true);
  const [categories, setCategories] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [archives, setArchives] = useState<any[]>([]);
  const [userRole, setUserRole] = useState<string>('');
  const [savedPosts, setSavedPosts] = useState<string[]>([]);

  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const POSTS_PER_PAGE = 10;

  const [fontsLoaded] = useFonts({
    'inter-bold': require('../../fonts/Inter-Bold.ttf'),
    'inter-regular': require('../../fonts/Inter-Regular.ttf'),
    'inter-semiBold': require('../../fonts/Inter-SemiBold.ttf'),
  });

  const getGroupPosts = useCallback(
    async (pageNum: number, refresh = false) => {
      if (loading || (!hasMore && !refresh)) return;

      const token = await secureStorage.getItem('accessToken');
      if (!token || !groupId) return;

      try {
        setLoading(true);

        const response = await api.get(`/post/group/${groupId}`, {
          headers: { Authorization: `Bearer ${token}` },
          params: {
            page: pageNum,
            limit: POSTS_PER_PAGE,
          },
        });

        const newPosts = response.data.data;
        const { hasMore: moreAvailable } = response.data.meta;

        if (refresh) {
          setPosts(newPosts);
          setPage(1);
          setHasMore(moreAvailable);
        } else {
          setPosts((prev) => [...prev, ...newPosts]);
          setHasMore(moreAvailable);
        }
      } catch (error) {
        console.error('Error fetching posts:', error);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [groupId, loading, hasMore],
  );

  const getSavedPosts = useCallback(async () => {
    const token = await secureStorage.getItem('accessToken');
    if (!token) return;

    try {
      const response = await api.get('/post/saved', {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log(response.data);
      setSavedPosts(response.data.map((post: any) => post.id));
    } catch (err) {
      console.error('Erro ao buscar posts salvos:', err);
    }
  }, []);

  const loadMorePosts = () => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      getGroupPosts(nextPage);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setHasMore(true);
    getGroupPosts(1, true);
  }, [getGroupPosts]);

  const handleScroll = (event: any) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const paddingToBottom = 20;

    const isCloseToBottom =
      layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom;

    if (isCloseToBottom && !loading) {
      loadMorePosts();
    }
  };

  const getGroupCategory = useCallback(async () => {
    const token = await secureStorage.getItem('accessToken');
    if (!token || !groupId) {
      console.error('Access token or Group ID is missing.');
      return;
    }
    try {
      const response = await api.get(`/category/group/${groupId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const filteredData = response.data.filter((category: any) => category.name !== 'Aulas');
      setCategories(filteredData);
    } catch (error) {
      console.error('Error fetching group categories:', error);
    }
  }, [groupId]);

  const getGroupArchives = useCallback(async () => {
    const token = await secureStorage.getItem('accessToken');
    if (!token || !groupId) {
      console.error('Access token or Group ID is missing.');
      return;
    }
    try {
      const response = await api.get(`/archives/group/${groupId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setArchives(response.data);
    } catch (error: any) {
      if (error.response?.status === 404) {
        console.log('No archives found or endpoint not available for group:', groupId);
        setArchives([]);
      } else {
        console.error('Error fetching group archives:', error);
        setArchives([]);
      }
    }
  }, [groupId]);

  const getUserProfileImage = async (userId: string) => {
    const token = await secureStorage.getItem('accessToken');

    if (!token) {
      return defaultAvatar;
    }

    try {
      const imageResponse = await api.get(`/user/${userId}/profile-picture`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        responseType: 'arraybuffer',
      });

      const imageStr = Buffer.from(imageResponse.data, 'binary').toString('base64');
      const imageUri = `data:image/jpeg;base64,${imageStr}`;
      return { uri: imageUri };
    } catch (error) {
      return defaultAvatar;
    }
  };

  const getUserRoleInGroup = useCallback(async () => {
    const token = await secureStorage.getItem('accessToken');
    const loggedId = await secureStorage.getItem('loggedId');
    if (!token || !groupId || !loggedId) {
      console.error('Access token, Group ID or User ID is missing.');
      return;
    }
    try {
      const response = await api.get(`/participant/group/${groupId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const currentUserParticipant = Array.isArray(response.data)
        ? response.data.find((participant: any) => participant.userId === loggedId)
        : null;

      setUserRole(currentUserParticipant?.role || 'MEMBER');
    } catch (error: unknown) {
      if (error && typeof error === 'object' && (error as AxiosError).isAxiosError) {
        const axiosError = error as AxiosError;
        if (axiosError.response?.status === 404) {
          console.log('Usuário não é participante do grupo');
        } else {
          console.error('Erro ao buscar role do usuário:', axiosError.message);
          setUserRole('MEMBER');
        }
      } else {
        console.error('Unexpected error fetching user role:', error);
      }

      setUserRole('MEMBER'); // Default para membro
    }
  }, [groupId]);

  useEffect(() => {
    getGroupPosts(1, true);
    getGroupCategory();
    getGroupArchives();
    getUserRoleInGroup();
    getSavedPosts();
  }, [getGroupCategory, getGroupArchives, getUserRoleInGroup, getSavedPosts]);

  if (!fontsLoaded) {
    return undefined;
  }

  const fileCategory = [
    { categoryName: 'Fotos' },
    { categoryName: 'Links' },
    { categoryName: 'Documentos' },
  ];

  const getFileTypeFromMime = (mimeType: string) => {
    if (mimeType && mimeType.startsWith('image/')) return 'Fotos';
    if (
      // eslint-disable-next-line operator-linebreak
      mimeType &&
      (mimeType.includes('pdf') || mimeType.includes('document') || mimeType.includes('text/'))
    )
      return 'Documentos';
    if (mimeType && (mimeType.includes('link') || mimeType.includes('url'))) return 'Links';
    return 'Documentos';
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

  function formatDateTime(createdAt: string | Date): string {
    const date = new Date(createdAt);

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = String(date.getFullYear()).slice(-2);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${day}/${month}/${year} - ${hours}:${minutes}`;
  }

  const fixActions = async (id: string, isPinned: boolean) => {
    const token = await secureStorage.getItem('accessToken');
    const loggedId = await secureStorage.getItem('loggedId');

    try {
      const url = isPinned ? `/post/unpin/${id}` : `/post/pin/${id}`;
      await api.patch(url, {}, { headers: { Authorization: `Bearer ${token}` } });

      if (!isPinned) {
        await api.post(
          '/notifications',
          {
            groupId,
            groupName,
            type: 'FIXED',
            body: '',
            idContent: id,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
      }

      getGroupPosts(1, true);
    } catch (error) {
      console.error('Erro ao fixar/desfixar post:', error);
    }
  };

  function onPressPostAction(id: string) {
    storageHome.set('idPost', id);
    navigation.navigate('Post', { postId: id });
  }

  return (
    <GroupPageContainer>
      <SideMenu display={sideMenu} onPress={() => setSideMenu(!sideMenu)} />
      <HeaderCustom
        font="inter-bold"
        text={groupName}
        icon={<NotificationIcon />}
        onPress={() => navigation.navigate('Notification')}
        onPressTitle={() => navigation.navigate('GroupData', { groupId })}
        menu
      />
      <GroupPageTabs style={style.line}>
        <GroupPageTabsContainer
          onPress={() => {
            setClassesSelect(false);
            setMuralSelect(true);
            setFilesSelect(false);
          }}
          style={muralSelect ? style.selectStyleTab : {}}>
          <GroupDataText font="inter-bold" size="18px" color={muralSelect ? '#EF4036' : '#8F8F8F'}>
            Mural
          </GroupDataText>
        </GroupPageTabsContainer>
        <GroupPageTabsContainer
          onPress={() => {
            setClassesSelect(true);
            setMuralSelect(false);
            setFilesSelect(false);
          }}
          style={classesSelect ? style.selectStyleTab : {}}>
          <GroupDataText
            font="inter-bold"
            size="18px"
            color={classesSelect ? '#EF4036' : '#8F8F8F'}>
            Aulas
          </GroupDataText>
        </GroupPageTabsContainer>
        <GroupPageTabsContainer
          onPress={() => {
            setClassesSelect(false);
            setMuralSelect(false);
            setFilesSelect(true);
          }}
          style={filesSelect ? style.selectStyleTab : {}}>
          <GroupDataText font="inter-bold" size="18px" color={filesSelect ? '#EF4036' : '#8F8F8F'}>
            Arquivos
          </GroupDataText>
        </GroupPageTabsContainer>
      </GroupPageTabs>
      <GroupPageContent>
        {muralSelect ? (
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ paddingBottom: 120 }}
            onScroll={handleScroll}
            scrollEventThrottle={400}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#EF4036']} />
            }>
            <GroupPageListFixPost>
              {posts.length > 0 ? (
                posts
                  .filter((item: any) => item.isPinned)
                  .slice()
                  .reverse()
                  .map((item: any) => {
                    if (item.type === 'NORMAL') {
                      return (
                        <PostCard
                          key={item.id}
                          userId={item.userId}
                          nameUser={item.nameUser}
                          getUserProfileImage={getUserProfileImage}
                          postContent={item.input}
                          numComments={item.numComments}
                          date={formatRelativeDate(item.createdAt)}
                          onPressFix={() => fixActions(item.id, item.isPinned)}
                          onPressPost={() => onPressPostAction(item.id)}
                          dotsMenu
                          fix
                          isSaved={savedPosts.includes(item.id)}
                          postId={item.id}
                        />
                      );
                    }
                    return null;
                  })
              ) : (
                <View />
              )}
            </GroupPageListFixPost>
            <GroupPageCategoryContainer>
              <GroupDataText color="#4E4E4E" font="inter-semiBold" size="18px">
                Categorias
              </GroupDataText>
              <GroupPageCategoryList>
                {categories?.length > 0 ? (
                  categories.map((item: any) => (
                    <CategoryButton
                      key={item.id || item.name}
                      categoryName={item.name}
                      onPress={() => {
                        setFilterPosts(item.name);
                      }}
                      filter={filterPosts}
                    />
                  ))
                ) : (
                  <View />
                )}
              </GroupPageCategoryList>
            </GroupPageCategoryContainer>
            <GroupPagePostList>
              {posts?.length > 0 ? (
                posts?.map((item: any) => {
                  if (filterPosts === item.categoryName && item.type === 'NORMAL') {
                    return (
                      <PostCard
                        key={item.id}
                        nameUser={item.nameUser}
                        userId={item.userId}
                        getUserProfileImage={getUserProfileImage}
                        postContent={item.input}
                        numComments={item.numComments}
                        date={formatRelativeDate(item.createdAt)}
                        onPressFix={() => fixActions(item.id, item.isPinned)}
                        onPressPost={() => onPressPostAction(item.id)}
                        dotsMenu
                        isSaved={savedPosts.includes(item.id)}
                        postId={item.id}
                      />
                    );
                  }
                  if (filterPosts === item.categoryName && item.type === 'EVENT') {
                    return (
                      <EventCard
                        key={item.id}
                        date={formatRelativeDate(item.createdAt)}
                        title={item.title}
                        description={item.input}
                      />
                    );
                  }
                  return null;
                })
              ) : (
                <View />
              )}
            </GroupPagePostList>

            {loading && (
              <View style={style.loadingContainer}>
                <ActivityIndicator size="large" color="#EF4036" />
              </View>
            )}

            {!hasMore && posts.length > 0 && (
              <View style={style.endMessage}>
                <GroupDataText color="#8F8F8F" size="14px" font="inter-regular">
                  Não há mais publicações
                </GroupDataText>
              </View>
            )}
          </ScrollView>
        ) : classesSelect ? (
          <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 120 }}>
            <GroupPageLessonsContainer style={{ paddingBottom: 0 }}>
              {posts?.length > 0 ? (
                posts?.map((item: any) => {
                  if (item.type === 'CLASS') {
                    return (
                      <LessonsCard
                        key={item.id}
                        date={formatDateTime(item.schedule)}
                        title={item.title}
                        urlLive={item.urlLive}
                      />
                    );
                  }
                  return null;
                })
              ) : (
                <View />
              )}
            </GroupPageLessonsContainer>
          </ScrollView>
        ) : (
          <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 20 }}>
            <GroupPageLessonsContainer style={{ justifyContent: 'center', flexDirection: 'row' }}>
              {fileCategory?.length > 0 ? (
                fileCategory?.map((item: any) => (
                  <CategoryButton
                    key={item.categoryName}
                    categoryName={item.categoryName}
                    onPress={() => {
                      setFilterFiles(item.categoryName);
                    }}
                    filter={filterFiles}
                  />
                ))
              ) : (
                <View />
              )}
            </GroupPageLessonsContainer>
            <GroupPageArchivesContainer>
              {archives?.map((item: any) => {
                const fileType = getFileTypeFromMime(item.mimeType);
                if (filterFiles === fileType) {
                  return (
                    <GroupArchives
                      key={item.id}
                      archive={{
                        id: item.id,
                        name: item.name || 'Arquivo',
                        uri: item.contentBase64,
                        mimeType: item.mimeType || 'application/octet-stream',
                      }}
                    />
                  );
                }
                return null;
              })}
            </GroupPageArchivesContainer>
          </ScrollView>
        )}
      </GroupPageContent>
      {(muralSelect || (classesSelect && (userRole === 'ADMIN' || userRole === 'MODERATOR'))) && (
        <GroupPageAddPostButton>
          <TouchableOpacity
            onPress={() => {
              console.log('groupId no GroupPage', groupId);
              if (classesSelect) {
                navigation.navigate('NewLesson', { groupId });
              } else {
                navigation.navigate('NewPost', { groupId });
              }
            }}
            style={{
              width: 70,
              height: 70,
              borderRadius: 35,
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <LinearGradient
              colors={['#1c1049', '#363061']}
              style={{
                width: 70,
                height: 70,
                borderRadius: 35,
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <AddPostIcon />
            </LinearGradient>
          </TouchableOpacity>
        </GroupPageAddPostButton>
      )}
    </GroupPageContainer>
  );
}

const style = StyleSheet.create({
  selectStyleTab: {
    borderBottomColor: '#EF4036',
    borderBottomWidth: 2.5,
  },
  line: {
    borderBottomColor: '#D9D9D9',
    borderBottomWidth: 1,
  },
  imageSize: {
    width: Dimensions.get('window').width / 2,
    height: Dimensions.get('window').width / 2,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  endMessage: {
    padding: 20,
    alignItems: 'center',
  },
});
