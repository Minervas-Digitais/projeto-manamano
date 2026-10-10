/* eslint-disable no-nested-ternary */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react/jsx-closing-bracket-location */
/* eslint-disable prettier/prettier */
/* eslint-disable global-require */
import React, { useState, useEffect, useRef } from 'react';
import {
  TouchableOpacity,
  View,
  StyleSheet,
  Share,
  Text,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Buffer } from 'buffer';
import { useFocusEffect } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import StaleDataBanner from '../../components/StaleDataBanner/StaleDataBanner';
import { useAuth } from '../../context/auth/useAuth';
import { district } from './ProfileData'; // Adjust the path based on your folder structure
import {
  ProfileContainerButtons,
  ProfileContainerInfo,
  ProfileContainerData,
  ProfileImage,
  ProfileTabsContainer,
  ProfileTextContainer,
  ProfilePostsContainer,
  ProfilePostsContent,
} from './ProfileStyle';
import { HomePageBlue, HomePageWhite } from '../Home/HomeStyle';
import { GroupDataText } from '../GroupData/GroupDataStyle';
import { GroupPageTabs } from '../GroupPage/GroupPageStyle';
import PostCard from '../../components/PostCard/PostCard';
import { useSavedPosts } from '../../context/SavedPostsContext';
import { useSideMenu } from '../../context/SideMenuContext';
import Location from '../../assets/location-icon.svg';
import ShareWhite from '../../assets/share-white-icon.svg';
import MenuIcon from '../../assets/menu-white-icon.svg';
import Pen from '../../assets/pen-icon.svg';
import Business from '../../assets/business-icon.svg';
import api from '../../services/api';
import useFetch from '../../hooks/useFetch';
import ErrorState from '../../components/ErrorState/ErrorState';

const defaultAvatar = require('../../assets/user-profile.png');

export default function Profile({ navigation, route }: any) {
  const [profileId, setProfileId] = useState(1);
  const createDeepLink = () => `manamano://profile/${profileId}`;
  const onShare = async () => {
    const deepLink = createDeepLink();
    try {
      await Share.share({
        message: `Confira este perfil: ${deepLink}`,
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Erro ao compartilhar',
        text2: 'Não foi possível compartilhar o perfil. Tente novamente.',
      });
    }
  };

  const { toggleMenu } = useSideMenu();

  const [myPostsSelect, setMyPostsSelect] = useState(true);
  const [savedPostsSelect, setSavedPostsSelect] = useState(false);
  const [filterPosts, setFilterPosts] = useState('userPosts');

  const [extraUserPosts, setExtraUserPosts] = useState<any[]>([]);
  const [userPostsPage, setUserPostsPage] = useState(1);
  const [hasMoreUserPosts, setHasMoreUserPosts] = useState(false);
  const [loadingMoreUserPosts, setLoadingMoreUserPosts] = useState(false);
  const [extraSavedPosts, setExtraSavedPosts] = useState<any[]>([]);
  const [savedPostsPage, setSavedPostsPage] = useState(1);
  const [hasMoreSavedPosts, setHasMoreSavedPosts] = useState(false);
  const [loadingMoreSavedPosts, setLoadingMoreSavedPosts] = useState(false);
  const [profileImage, setProfileImage] = useState<any>(null);

  const { loggedId } = useAuth();

  const userQuery = useFetch<any>(
    async () => (await api.get(`/user/${loggedId}`)).data,
    [loggedId],
    { enabled: !!loggedId },
  );

  const userPostsQuery = useFetch<{ posts: any[]; hasMore: boolean }>(
    async () => {
      const { data } = await api.get(`/post/${loggedId}/posts`, {
        params: { page: 1, limit: 10 },
      });
      const { data: items, meta } = data;
      return {
        posts: Array.isArray(items) ? items : [],
        hasMore: meta.page < meta.lastPage,
      };
    },
    [loggedId],
    {
      enabled: !!loggedId,
    },
  );

  const savedPostsQuery = useFetch<{ posts: any[]; hasMore: boolean }>(
    async () => {
      const { data } = await api.get('/saved-post', {
        params: { page: 1, limit: 10 },
      });
      const isArray = Array.isArray(data);
      const items = isArray ? data : data.data;
      const meta = isArray ? { page: 1, lastPage: 1 } : data.meta;
      return {
        posts: Array.isArray(items) ? items : [],
        hasMore: meta.page < meta.lastPage,
      };
    },
    [loggedId],
    {
      enabled: !!loggedId,
    },
  );

  const fullName = userQuery.data?.fullName ?? '';
  const neighborhood = userQuery.data?.neighborhood ?? '';
  const enterprise = userQuery.data?.enterprise ?? '';
  const bio = userQuery.data?.bio ?? '';
  const userPosts = [...(userPostsQuery.data?.posts ?? []), ...extraUserPosts];
  const savedPosts = [...(savedPostsQuery.data?.posts ?? []), ...extraSavedPosts];

  useEffect(() => {
    if (route?.params?.initialTab === 'saved') {
      setMyPostsSelect(false);
      setSavedPostsSelect(true);
      setFilterPosts('savedPosts');
    }
  }, [route?.params?.initialTab]);

  const { savedPostIds } = useSavedPosts();
  const prevSavedIdsRef = useRef<Set<string>>(savedPostIds);

  // Remove da aba "Salvas" os posts dessalvados em qualquer tela
  useEffect(() => {
    const removed: string[] = [];
    prevSavedIdsRef.current.forEach((id) => {
      if (!savedPostIds.has(id)) removed.push(id);
    });
    prevSavedIdsRef.current = savedPostIds;
    if (removed.length === 0) return;
    const removedSet = new Set(removed);
    savedPostsQuery.mutate((prev) => {
      if (!prev) return { posts: [], hasMore: false };
      return { ...prev, posts: prev.posts.filter((p: any) => !removedSet.has(p.id)) };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [savedPostIds]);

  useFocusEffect(
    React.useCallback(() => {
      const fetchProfileImage = async () => {
        if (!loggedId) return;
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
      };

      fetchProfileImage();
    }, [loggedId]),
  );

  // Recarga no focus volta com a página 1: descarta as páginas extras
  useEffect(() => {
    setUserPostsPage(1);
    setExtraUserPosts([]);
    setHasMoreUserPosts(userPostsQuery.data?.hasMore ?? false);
  }, [userPostsQuery.data]);

  useEffect(() => {
    setSavedPostsPage(1);
    setExtraSavedPosts([]);
    setHasMoreSavedPosts(savedPostsQuery.data?.hasMore ?? false);
  }, [savedPostsQuery.data]);

  const handleLoadMoreUserPosts = async () => {
    if (loadingMoreUserPosts || !hasMoreUserPosts || !loggedId) return;
    setLoadingMoreUserPosts(true);
    try {
      const nextPage = userPostsPage + 1;
      const { data: postData } = await api.get(`/post/${loggedId}/posts`, {
        params: { page: nextPage, limit: 10 },
      });
      const { data: items, meta } = postData;
      setExtraUserPosts((prev) => [...prev, ...(Array.isArray(items) ? items : [])]);
      setHasMoreUserPosts(meta.page < meta.lastPage);
      setUserPostsPage(meta.page);
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Erro ao carregar mais publicações',
        text2: 'Não foi possível buscar. Tente novamente.',
      });
    } finally {
      setLoadingMoreUserPosts(false);
    }
  };

  const handleLoadMoreSavedPosts = async () => {
    if (loadingMoreSavedPosts || !hasMoreSavedPosts || !loggedId) return;
    setLoadingMoreSavedPosts(true);
    try {
      const nextPage = savedPostsPage + 1;
      const { data: savedPostsData } = await api.get('/saved-post', {
        params: { page: nextPage, limit: 10 },
      });
      const { data: items, meta } = savedPostsData;
      setExtraSavedPosts((prev) => [...prev, ...(Array.isArray(items) ? items : [])]);
      setHasMoreSavedPosts(meta.page < meta.lastPage);
      setSavedPostsPage(meta.page);
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Erro ao carregar mais salvos',
        text2: 'Não foi possível buscar. Tente novamente.',
      });
    } finally {
      setLoadingMoreSavedPosts(false);
    }
  };

  // Split the fullName to display the first two names
  const fullNameSplit = fullName.split(' ');
  const displayName =
    fullNameSplit.length > 1 ? `${fullNameSplit[0]} ${fullNameSplit[1]}` : fullName;
  const districtLabel =
    district.find((item) => item.value === String(neighborhood))?.label || 'Unknown';

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

  return (
    <HomePageBlue>
      <ProfileContainerInfo>
        <ProfileContainerButtons>
          <TouchableOpacity onPress={toggleMenu}>
            <MenuIcon />
          </TouchableOpacity>
          <TouchableOpacity onPress={onShare}>
            <ShareWhite />
          </TouchableOpacity>
        </ProfileContainerButtons>
        <ProfileContainerData>
          <ProfileImage radius height="78px" width="78px" source={profileImage || defaultAvatar} />

          <View style={{ gap: '4px' }}>
            <ProfileContainerData gap={10} center>
              <GroupDataText color="white" size="20px" font="inter-bold">
                {displayName}
              </GroupDataText>
              <TouchableOpacity onPress={() => navigation.navigate('EditProfile')}>
                <Pen height="24px" width="24px" />
              </TouchableOpacity>
            </ProfileContainerData>

            <ProfileContainerData gap={10} center>
              <Location height="19px" width="19px" />
              <GroupDataText color="white" size="12px" font="inter-regular">
                {districtLabel}
              </GroupDataText>
            </ProfileContainerData>

            <ProfileContainerData gap={10} center>
              <Business height="19px" width="19px" />
              <GroupDataText color="white" size="12px" font="inter-regular">
                {enterprise}
              </GroupDataText>
            </ProfileContainerData>
          </View>
        </ProfileContainerData>
      </ProfileContainerInfo>
      <HomePageWhite style={{ gap: 0 }}>
        {!!userQuery.error && userQuery.data === undefined ? (
          <ErrorState
            inline
            text="Não foi possível carregar seu perfil."
            onRetry={userQuery.refetch}
          />
        ) : (
          <>
            {(userQuery.stale || userPostsQuery.stale || savedPostsQuery.stale) && (
              <StaleDataBanner
                refreshing={
                  userQuery.refreshing || userPostsQuery.refreshing || savedPostsQuery.refreshing
                }
                onRefresh={() => {
                  userQuery.refresh();
                  userPostsQuery.refresh();
                  savedPostsQuery.refresh();
                }}
              />
            )}
            <ProfileTextContainer style={{ paddingVertical: 25, paddingHorizontal: 0 }}>
              <GroupDataText color="#515151" size="12px" font="inter-regular" numberOfLines={3}>
                {bio}
              </GroupDataText>
            </ProfileTextContainer>

            <GroupPageTabs style={style.line}>
              <ProfileTabsContainer
                onPress={() => {
                  setMyPostsSelect(true);
                  setSavedPostsSelect(false);
                  setFilterPosts('userPosts');
                }}
                style={myPostsSelect ? style.selectStyleTab : {}}>
                <GroupDataText
                  font="inter-bold"
                  size="18px"
                  color={myPostsSelect ? '#EF4036' : '#8F8F8F'}>
                  Publicações
                </GroupDataText>
              </ProfileTabsContainer>
              <ProfileTabsContainer
                onPress={() => {
                  setMyPostsSelect(false);
                  setSavedPostsSelect(true);
                  setFilterPosts('savedPosts');
                }}
                style={savedPostsSelect ? style.selectStyleTab : {}}>
                <GroupDataText
                  font="inter-bold"
                  size="18px"
                  color={savedPostsSelect ? '#EF4036' : '#8F8F8F'}>
                  Salvas
                </GroupDataText>
              </ProfileTabsContainer>
            </GroupPageTabs>
            <ProfilePostsContainer
              refreshControl={
                <RefreshControl
                  refreshing={userPostsQuery.refreshing || savedPostsQuery.refreshing}
                  onRefresh={() => {
                    userPostsQuery.refresh();
                    savedPostsQuery.refresh();
                    userQuery.refresh();
                  }}
                  colors={['#EF4036']}
                  tintColor="#EF4036"
                />
              }>
              <ProfilePostsContent>
                {filterPosts === 'userPosts' ? (
                  userPostsQuery.loading ? (
                    <ActivityIndicator size="large" color="#EF4036" style={{ marginTop: 20 }} />
                  ) : !!userPostsQuery.error && userPostsQuery.data === undefined ? (
                    <ErrorState
                      inline
                      text="Não foi possível carregar suas publicações."
                      onRetry={userPostsQuery.refetch}
                    />
                  ) : userPosts?.length > 0 ? (
                    <>
                      {userPosts?.map((item: any) => (
                        <PostCard
                          key={item.id}
                          nameUser={item.nameUser}
                          userId={item.userId}
                          getUserProfileImage={getUserProfileImage}
                          postContent={item.input}
                          numComments={item.numComments}
                          date={item.createdAt}
                          share
                          postId={item.id}
                        />
                      ))}
                      {hasMoreUserPosts && (
                        <TouchableOpacity
                          onPress={handleLoadMoreUserPosts}
                          disabled={loadingMoreUserPosts}
                          style={{
                            backgroundColor: '#EF4036',
                            padding: 12,
                            borderRadius: 8,
                            marginTop: 16,
                            alignItems: 'center',
                            opacity: loadingMoreUserPosts ? 0.6 : 1,
                          }}>
                          {loadingMoreUserPosts ? (
                            <ActivityIndicator color="#fff" />
                          ) : (
                            <Text style={{ color: '#fff', fontFamily: 'inter-bold' }}>
                              Carregar mais
                            </Text>
                          )}
                        </TouchableOpacity>
                      )}
                    </>
                  ) : (
                    <Text style={[style.noPostsText, { fontFamily: 'inter-regular' }]}>
                      Nenhuma Publicação encontrada
                    </Text>
                  )
                ) : savedPostsQuery.loading ? (
                  <ActivityIndicator size="large" color="#EF4036" style={{ marginTop: 20 }} />
                ) : !!savedPostsQuery.error && savedPostsQuery.data === undefined ? (
                  <ErrorState
                    inline
                    text="Não foi possível carregar seus posts salvos."
                    onRetry={savedPostsQuery.refetch}
                  />
                ) : savedPosts?.length > 0 ? (
                  <>
                    {savedPosts?.map((item: any) => (
                      <PostCard
                        key={item.id}
                        nameUser={item.nameUser}
                        userId={item.userId}
                        getUserProfileImage={getUserProfileImage}
                        postContent={item.input}
                        numComments={item.numComments}
                        date={item.createdAt}
                        share
                        postId={item.id}
                      />
                    ))}
                    {hasMoreSavedPosts && (
                      <TouchableOpacity
                        onPress={handleLoadMoreSavedPosts}
                        disabled={loadingMoreSavedPosts}
                        style={{
                          backgroundColor: '#EF4036',
                          padding: 12,
                          borderRadius: 8,
                          marginTop: 16,
                          alignItems: 'center',
                          opacity: loadingMoreSavedPosts ? 0.6 : 1,
                        }}>
                        {loadingMoreSavedPosts ? (
                          <ActivityIndicator color="#fff" />
                        ) : (
                          <Text style={{ color: '#fff', fontFamily: 'inter-bold' }}>
                            Carregar mais
                          </Text>
                        )}
                      </TouchableOpacity>
                    )}
                  </>
                ) : (
                  <Text style={[style.noPostsText, { fontFamily: 'inter-regular' }]}>
                    Nenhuma Publicação salva
                  </Text>
                )}
              </ProfilePostsContent>
            </ProfilePostsContainer>
          </>
        )}
      </HomePageWhite>
    </HomePageBlue>
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
  viewPadding: {
    padding: 25,
  },
  noPostsText: {
    color: '#8F8F8F',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
});
