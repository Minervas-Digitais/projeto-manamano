/* eslint-disable no-console */
/* eslint-disable no-nested-ternary */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react/jsx-closing-bracket-location */
/* eslint-disable prettier/prettier */
/* eslint-disable global-require */
import React, { useState, useEffect } from 'react';
import { useFonts } from 'expo-font';
import { TouchableOpacity, View, StyleSheet, ActivityIndicator, Text, Share } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import * as Clipboard from 'expo-clipboard';
import Toast from 'react-native-toast-message';
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
import SideMenu from '../../components/SideMenu/SideMenu';
import api from '../../services/api';
import { storage } from '../SignIn/SignIn';
import { toastConfig } from '../GlobalNotificationPage/GlobalNotificationPageStyle';
import LocationIcon from '../../assets/location-icon.svg';
import ShareWhiteIcon from '../../assets/share-white-icon.svg';
import MenuIcon from '../../assets/menuWhite-icon.svg';
import BusinessIcon from '../../assets/business-icon.svg';
import WhatsappIcon from '../../assets/whatsapp-icon.svg';
import EmailIcon from '../../assets/email-icon.svg';

export default function VisitorProfile({ navigation }: any) {
  const route = useRoute();
  const { id: userId } = route.params as { id: string };

  const [sideMenu, setSideMenu] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const duckImage = require('../../assets/duck.png');

  const [fontsLoaded] = useFonts({
    'inter-bold': require('../../fonts/Inter-Bold.ttf'),
    'inter-regular': require('../../fonts/Inter-Regular.ttf'),
  });
  if (!fontsLoaded) {
    return undefined;
  }

  const savedPosts: any = [
    {
      nameUser: 'Jhennifer Moreira',
      imageUser: duckImage,
      postContent: 'Alguém mora perto de Bonsucesso?',
      numComments: 5,
      date: 'Ontem, 21:32',
    },
    {
      nameUser: 'Juliana Silva',
      imageUser: duckImage,
      postContent: 'Já postaram o link da aula?',
      numComments: 5,
      date: 'Ontem, 21:32',
    },
    {
      nameUser: 'Juliana Silva',
      imageUser: duckImage,
      postContent: 'Já postaram o link da aula?',
      numComments: 5,
      date: 'Ontem, 21:32',
    },
    {
      nameUser: 'Jhennifer Moreira',
      imageUser: duckImage,
      postContent: 'Alguém mora perto de Bonsucesso?',
      numComments: 5,
      date: 'Ontem, 21:32',
    },
    {
      nameUser: 'Juliana Silva',
      imageUser: duckImage,
      postContent: 'Já postaram o link da aula?',
      numComments: 5,
      date: 'Ontem, 21:32',
    },
    {
      nameUser: 'Juliana Silva',
      imageUser: duckImage,
      postContent: 'Já postaram o link da aula?',
      numComments: 5,
      date: 'Ontem, 21:32',
    },
  ];

  return (
    <HomePageBlue>
      <StatusBar />
      <SideMenu display={sideMenu} onPress={() => setSideMenu(!sideMenu)} />
      <ProfileContainerInfo>
        <ProfileContainerButtons>
          <TouchableOpacity accessibilityRole="button" onPress={() => setSideMenu(!sideMenu)}>
            <Image source={menuIcon} />
          </TouchableOpacity>
          <TouchableOpacity onPress={onShareProfile}>
            <ShareWhiteIcon />
          </TouchableOpacity>
        </ProfileContainerButtons>
        <ProfileContainerData>
          <ProfileImage radius height="78px" width="78px" source={duckImage} />
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
              <TouchableOpacity onPress={() => copyToClipboard(user?.phone, 'Número de telefone copiado!')}>
                <WhatsappIcon height="22px" width="22px" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => copyToClipboard(user?.email, 'Email copiado!')}>
                <EmailIcon height="22px" width="22px" />
              </TouchableOpacity>
            </View>
          </View>
        </ProfileContainerData>
      </ProfileContainerInfo>
      <HomePageWhite style={{ gap: 0 }}>
        <ProfileTextContainer style={{ paddingVertical: 25, paddingHorizontal: 0 }}>
          <GroupDataText color="#515151" size="12px" font="inter-regular" numberOfLines={3}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque vel quam vel libero
            consequat interdum. Vivamus at ex nec arcu interdum fringilla. Nulla facilisi. Maecenas
            ut sapien vel justo aliquam congue.
          </GroupDataText>
        </ProfileTextContainer>

        <GroupPageTabs style={style.line} />
        <ProfilePostsContainer>
          {savedPosts?.length > 0
            ? savedPosts?.map((item: any) => (
                <PostCard
                  nameUser={item.nameUser}
                  imageUser={item.imageUser}
                  postContent={item.postContent}
                  numComments={item.numComments}
                  date={item.date}
                  share
                  save
                />
              ))
            : ''}
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
