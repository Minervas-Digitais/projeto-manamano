/* eslint-disable no-console */
/* eslint-disable no-nested-ternary */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react/jsx-closing-bracket-location */
/* eslint-disable prettier/prettier */
/* eslint-disable global-require */
import React, { useState, useEffect } from 'react';
import { useFonts } from 'expo-font';
import { Image, TouchableOpacity, View, StyleSheet, Share, Text } from 'react-native';
import { Buffer } from 'buffer';
import { useFocusEffect } from '@react-navigation/native';
import { AxiosError } from 'axios';
import secureStorage from '../../services/secureStorage';
import { district } from './ProfileData'; // Adjust the path based on your folder structure
import {
  ProfileContainerButtons,
  ProfileContainerInfo,
  ProfileContainerData,
  ProfileImage,
  ProfileTabsContainer,
  ProfileTextContainer,
  ProfilePostsContainer,
} from './ProfileStyle';
import { HomePageBlue, HomePageWhite } from '../Home/HomeStyle';
import { GroupDataText } from '../GroupData/GroupDataStyle';
import { GroupPageTabs } from '../GroupPage/GroupPageStyle';
import PostCard from '../../components/PostCard/PostCard';
import SideMenu from '../../components/SideMenu/SideMenu';
import Location from '../../assets/location-icon.svg';
import ShareWhite from '../../assets/share-white-icon.svg';
import MenuIcon from '../../assets/menuWhite-icon.svg';
import Pen from '../../assets/pen-icon.svg';
import Business from '../../assets/business-icon.svg';
import api from '../../services/api';

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
      console.error('Erro ao compartilhar:', error);
    }
  };

  const [sideMenu, setSideMenu] = useState(true);

  const [fullName, setFullName] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [enterprise, setEnterprise] = useState('');
  const [bio, setBio] = useState('');

  const [myPostsSelect, setMyPostsSelect] = useState(true);
  const [savedPostsSelect, setSavedPostsSelect] = useState(false);
  const [filterPosts, setFilterPosts] = useState('userPosts');

  const defaultAvatar = require('../../assets/user-profile.png');

  const [userPosts, setUserPosts] = useState<any[]>([]);
  const [savedPosts, setSavedPosts] = useState<any[]>([]);
  const [profileImage, setProfileImage] = useState<any>(null);

  useEffect(() => {
    if (route?.params?.initialTab === 'saved') {
      setMyPostsSelect(false);
      setSavedPostsSelect(true);
      setFilterPosts('savedPosts');
    }
  }, [route?.params?.initialTab]);

  useFocusEffect(
    React.useCallback(() => {
      const fetchUserData = async () => {
        const token = await secureStorage.getItem('accessToken');

        if (token) {
          try {
            const userId = await secureStorage.getItem('loggedId');

            const { data } = await api.get(`/user/${userId}`, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });

            setFullName(data.fullName);
            setNeighborhood(data.neighborhood);
            setEnterprise(data.enterprise);
            setBio(data.bio);

            try {
              const imageResponse = await api.get(`/user/${userId}/profile-picture`, {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
                responseType: 'arraybuffer',
              });

              const imageStr = Buffer.from(imageResponse.data, 'binary').toString('base64');
              const imageUri = `data:image/jpeg;base64,${imageStr}`;
              setProfileImage({ uri: imageUri });
            } catch (error) {
              setProfileImage(defaultAvatar);
            }

            const fetchUserPosts = async () => {
              try {
                const { data: postData } = await api.get(`/post/${userId}/posts`, {
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                });

                // Backend agora retorna formato paginado: { data, meta }
                if (Array.isArray(postData?.data)) {
                  setUserPosts(postData.data);
                } else if (Array.isArray(postData)) {
                  setUserPosts(postData);
                } else {
                  setUserPosts([]);
                }
              } catch (error) {
                console.error('Error fetching posts:', error);
              }
            };

            const fetchSavedPosts = async () => {
              try {
                const { data } = await api.get('/post/saved', {
                  headers: { Authorization: `Bearer ${token}` },
                  params: { all: true },
                });
                setSavedPosts(savedPostsData);
              } catch (error) {
                console.error('Error fetching saved posts:', error);
              }
            };

            fetchUserPosts();
            fetchSavedPosts();
          } catch (error) {
            if (error instanceof AxiosError) {
              if (error.response?.status === 404) {
                console.log('Sem imagem de perfil, usando padrão');
                setProfileImage(require('../../assets/user-profile.png'));
              } else {
                console.error('Erro ao buscar imagem de perfil:', error);
              }
            } else {
              console.error('Erro desconhecido:', error);
            }
          }
        }
      };

      fetchUserData();
    }, []),
  );

  const [fontsLoaded] = useFonts({
    'inter-bold': require('../../fonts/Inter-Bold.ttf'),
    'inter-regular': require('../../fonts/Inter-Regular.ttf'),
  });
  if (!fontsLoaded) {
    return undefined;
  }
  // Split the fullName to display the first two names
  const fullNameSplit = fullName.split(' ');
  const displayName = fullNameSplit.length > 1 ? `${fullNameSplit[0]} ${fullNameSplit[1]}` : fullName;
  const districtLabel =
    district.find((item) => item.value === String(neighborhood))?.label || 'Unknown';

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
      console.error('Erro ao buscar imagem de perfil:', error);
      return defaultAvatar;
    }
  };

  return (
    <HomePageBlue>
      <SideMenu display={sideMenu} onPress={() => setSideMenu(!sideMenu)} />
      <ProfileContainerInfo>
        <ProfileContainerButtons>
          <TouchableOpacity onPress={() => setSideMenu(!sideMenu)}>
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
        <ProfilePostsContainer>
          {filterPosts === 'userPosts' ? (
            userPosts?.length > 0 ? (
              userPosts?.map((item: any) => (
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
              ))
            ) : (
              <Text style={[style.noPostsText, { fontFamily: 'inter-regular' }]}>
                Nenhuma Publicação encontrada
              </Text>
            )
          ) : savedPosts?.length > 0 ? (
            savedPosts?.map((item: any) => (
              <PostCard
                key={item.id}
                nameUser={item.nameUser}
                userId={item.userId}
                getUserProfileImage={getUserProfileImage}
                postContent={item.input}
                numComments={item.numComments}
                date={item.createdAt}
                share
                saved
                postId={item.id}
              />
            ))
          ) : (
            <Text style={[style.noPostsText, { fontFamily: 'inter-regular' }]}>
              Nenhuma Publicação salva
            </Text>
          )}
        </ProfilePostsContainer>
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
