/* eslint-disable no-console */
/* eslint-disable no-nested-ternary */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react/jsx-closing-bracket-location */
/* eslint-disable prettier/prettier */
/* eslint-disable global-require */
import React, { useState, useEffect } from 'react';
import { useFonts } from 'expo-font';
import { TouchableOpacity, View, StyleSheet, ActivityIndicator, Text, Share } from 'react-native';
import { Buffer } from 'buffer';
import { useRoute } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import * as Clipboard from 'expo-clipboard';
import Toast from 'react-native-toast-message';
import { AxiosError } from 'axios';
import {
  ProfileContainerButtons,
  ProfileContainerInfo,
  ProfileContainerData,
  ProfileImage,
  ProfileTextContainer,
  ProfilePostsContainer,
} from '../Profile/ProfileStyle';
import { HomePageBlue, HomePageWhite } from '../Home/HomeStyle';
import { GroupDataText } from '../GroupData/GroupDataStyle';
import { GroupPageTabs } from '../GroupPage/GroupPageStyle';
import PostCard from '../../components/PostCard/PostCard';
import { useSideMenu } from '../../context/SideMenuContext';
import api from '../../services/api';
import secureStorage from '../../services/secureStorage';
import LocationIcon from '../../assets/location-icon.svg';
import ShareWhiteIcon from '../../assets/share-white-icon.svg';
import MenuIcon from '../../assets/menu-white-icon.svg';
import BusinessIcon from '../../assets/business-icon.svg';
import WhatsappIcon from '../../assets/whatsapp-icon.svg';
import EmailIcon from '../../assets/email-icon.svg';

const defaultAvatar = require('../../assets/user-profile.png');

export default function VisitorProfile({ navigation }: any) {
  const route = useRoute();
  const { id: userId } = route.params as { id: string };

  const { toggleMenu } = useSideMenu();
  const [user, setUser] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [profileImage, setProfileImage] = useState<any>(null);

  const [fontsLoaded] = useFonts({
    'inter-bold': require('../../fonts/Inter-Bold.ttf'),
    'inter-regular': require('../../fonts/Inter-Regular.ttf'),
  });

  const copyToClipboard = async (text: string, message: string) => {
    if (text) {
      await Clipboard.setStringAsync(text);
      Toast.show({
        type: 'success',
        text1: message,
      });
    } else {
      Toast.show({
        type: 'error',
        text1: 'Informação não disponível.',
      });
    }
  };

  const onShareProfile = async () => {
    const deepLink = `manamano://visitorprofile/${userId}`;
    try {
      await Share.share({
        message: `Confira este perfil: ${deepLink}`,
      });
    } catch (error) {
      console.error('Erro ao compartilhar perfil:', error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      const accessToken = await secureStorage.getItem('accessToken');
      if (!accessToken || !userId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const userResponse = await api.get(`/user/${userId}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        setUser(userResponse.data);
        const userPostsResponse = await api.get(`/post/${userId}/posts`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        const postsResponse = userPostsResponse.data;
        setPosts(Array.isArray(postsResponse) ? postsResponse : postsResponse?.data || []);
        try {
          const imageResponse = await api.get(`/user/${userId}/profile-picture`, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
            responseType: 'arraybuffer',
          });
          const imageStr = Buffer.from(imageResponse.data, 'binary').toString('base64');
          const imageUri = `data:image/jpeg;base64,${imageStr}`;
          setProfileImage({ uri: imageUri });
        } catch (error) {
          console.error('Erro ao buscar imagem de perfil:', error);
          setProfileImage(defaultAvatar);
        }
      } catch (error) {
        console.error('Failed to fetch visitor profile data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  if (!fontsLoaded || loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator testID="activity-indicator" size="large" color="#170e49" />
      </View>
    );
  }

  if (!user) {
    return (
      <HomePageBlue>
        <ProfileContainerInfo>
          <ProfileContainerButtons>
            <TouchableOpacity testID="menu-toggle-button" onPress={toggleMenu}>
              <MenuIcon />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => {}}>
              <ShareWhiteIcon />
            </TouchableOpacity>
          </ProfileContainerButtons>
          <ProfileContainerData>
            <ProfileImage
              radius
              height="78px"
              width="78px"
              source={profileImage || defaultAvatar}
            />
            <View style={{ gap: '4px' }}>
              <ProfileContainerData gap={10} center>
                <GroupDataText color="white" size="20px" font="inter-bold">
                  Usuário não encontrado
                </GroupDataText>
              </ProfileContainerData>
            </View>
          </ProfileContainerData>
        </ProfileContainerInfo>
        <HomePageWhite style={{ gap: 0 }}>
          <ProfileTextContainer style={{ padding: 25 }}>
            <GroupDataText color="#515151" size="12px" font="inter-regular" numberOfLines={3}>
              Este usuário não existe ou teve seu perfil removido.
            </GroupDataText>
          </ProfileTextContainer>
        </HomePageWhite>
      </HomePageBlue>
    );
  }

  const getUserProfileImage = async () => {
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

  return (
    <HomePageBlue>
      <StatusBar />
      <ProfileContainerInfo>
        <ProfileContainerButtons>
          <TouchableOpacity testID="menu-toggle-button" onPress={toggleMenu}>
            <MenuIcon />
          </TouchableOpacity>
          <TouchableOpacity testID="share-button" onPress={onShareProfile}>
            <ShareWhiteIcon />
          </TouchableOpacity>
        </ProfileContainerButtons>
        <ProfileContainerData>
          <ProfileImage radius height="78px" width="78px" source={profileImage || defaultAvatar} />
          <View style={{ flex: 1, gap: 4, marginLeft: 5 }}>
            <ProfileContainerData gap={10} center>
              <GroupDataText color="white" size="18px" font="inter-bold" numberOfLines={1}>
                {user.fullName}
              </GroupDataText>
            </ProfileContainerData>

            <ProfileContainerData gap={10} center>
              <LocationIcon height="19px" width="19px" />
              <GroupDataText color="white" size="12px" font="inter-regular" numberOfLines={1}>
                {user.neighborhood || 'Não informado'}
              </GroupDataText>
            </ProfileContainerData>

            <ProfileContainerData gap={10} center>
              <BusinessIcon height="19px" width="19px" />
              <GroupDataText color="white" size="12px" font="inter-regular" numberOfLines={1}>
                {user.enterprise || 'Não informado'}
              </GroupDataText>
            </ProfileContainerData>
            <View style={style.viewStyleInfo}>
              <TouchableOpacity
                onPress={() => copyToClipboard(user?.phone, 'Número de telefone copiado!')}>
                <WhatsappIcon height="22px" width="22px" />
              </TouchableOpacity>
              <TouchableOpacity
                testID="email-button"
                onPress={() => copyToClipboard(user?.email, 'Email copiado!')}>
                <EmailIcon height="22px" width="22px" />
              </TouchableOpacity>
            </View>
          </View>
        </ProfileContainerData>
      </ProfileContainerInfo>
      <HomePageWhite style={{ gap: 0 }}>
        <ProfileTextContainer style={{ padding: 25 }}>
          <GroupDataText color="#515151" size="12px" font="inter-regular" numberOfLines={3}>
            {user.bio || 'Nenhuma biografia disponível.'}
          </GroupDataText>
        </ProfileTextContainer>

        <GroupPageTabs style={style.line} />
        <ProfilePostsContainer>
          {posts?.length > 0 ? (
            posts.map((item: any) => (
              <PostCard
                key={item.id}
                postId={item.id}
                nameUser={user.fullName}
                userId={item.userId}
                getUserProfileImage={getUserProfileImage}
                postContent={item.input}
                numComments={item.numComments || 0}
                date={item.createdAt}
                share
                save
                onPressPost={() => navigation.navigate('Post', { postId: item.id })}
              />
            ))
          ) : (
            <Text style={{ textAlign: 'center', marginTop: 20, fontFamily: 'inter-regular' }}>
              Este usuário ainda não fez publicações.
            </Text>
          )}
        </ProfilePostsContainer>
      </HomePageWhite>
    </HomePageBlue>
  );
}
const style = StyleSheet.create({
  line: {
    borderBottomColor: '#D9D9D9',
    borderBottomWidth: 1,
  },
  viewStyleInfo: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
    marginTop: 5,
  },
});
