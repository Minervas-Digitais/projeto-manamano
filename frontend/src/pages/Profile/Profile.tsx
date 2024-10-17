/* eslint-disable no-console */
/* eslint-disable no-nested-ternary */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react/jsx-closing-bracket-location */
/* eslint-disable prettier/prettier */
/* eslint-disable global-require */
import React, { useState } from 'react';
import { useFonts } from 'expo-font';
import { Image, TouchableOpacity, View, StyleSheet } from 'react-native';

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

export default function Profile({ navigation }: any) {
  const [sideMenu, setSideMenu] = useState(true);

  const userName = 'Maria Fernanda';
  const city = 'Rio de Janeiro';
  const businessName = 'Doceria da Maria';
  const id = 2343;

  const [myPostsSelect, setMyPostsSelect] = useState(true);
  const [savedPostsSelect, setSavedPostsSelect] = useState(false);
  const [filterPosts, setFilterPosts] = useState('userPosts');

  const duckImage = require('../../assets/duck.png');
  const location = require('../../assets/location-icon.svg');
  const shareWhite = require('../../assets/share-white-icon.svg');
  const menuIcon = require('../../assets/menuWhite-icon.svg');
  const pen = require('../../assets/pen-icon.svg');
  const business = require('../../assets/business-icon.svg');

  const [fontsLoaded] = useFonts({
    'inter-bold': require('../../fonts/Inter-Bold.ttf'),
    'inter-regular': require('../../fonts/Inter-Regular.ttf'),
  });
  if (!fontsLoaded) {
    return undefined;
  }

  const userPosts: any = [
    {
      nameUser: 'Maria Fernanda',
      imageUser: duckImage,
      postContent: 'Alguém mora perto de Bonsucesso?',
      numComments: 5,
      date: 'Ontem, 21:32',
    },
    {
      nameUser: 'Maria Fernanda',
      imageUser: duckImage,
      postContent: 'Já postaram o link da aula?',
      numComments: 5,
      date: 'Ontem, 21:32',
    },

  ];

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
    }, {
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
      <SideMenu display={sideMenu} onPress={() => setSideMenu(!sideMenu)} />
      <ProfileContainerInfo>
        <ProfileContainerButtons>
          <TouchableOpacity onPress={() => setSideMenu(!sideMenu)}>
            <Image source={menuIcon} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => {}}>
            <Image source={shareWhite} />
          </TouchableOpacity>
        </ProfileContainerButtons>
        <ProfileContainerData>
          <ProfileImage radius height="78px" width="78px" source={duckImage} />

          <View style={{ gap: '4px' }}>
            <ProfileContainerData gap={10} center>
              <GroupDataText color="white" size="20px" font="inter-bold">
                {userName}
              </GroupDataText>
              <TouchableOpacity onPress={() => navigation.navigate('EditProfile')}>
                <ProfileImage height="24px" width="24px" radius={false} source={pen} />
              </TouchableOpacity>
            </ProfileContainerData>

            <ProfileContainerData gap={10} center>
              <ProfileImage height="19px" width="19px" radius={false} source={location} />
              <GroupDataText color="white" size="12px" font="inter-regular">
                {city}
              </GroupDataText>
            </ProfileContainerData>

            <ProfileContainerData gap={10} center>
              <ProfileImage height="19px" width="19px" radius={false} source={business} />
              <GroupDataText color="white" size="12px" font="inter-regular">
                {businessName}
              </GroupDataText>
            </ProfileContainerData>
          </View>
        </ProfileContainerData>
      </ProfileContainerInfo>
      <HomePageWhite style={{ gap: 0 }}>
        <ProfileTextContainer style={{ padding: '25px 0px 25px 0px' }}>
          <GroupDataText color="#515151" size="12px" font="inter-regular" numberOfLines={3}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque vel quam vel libero
            consequat interdum. Vivamus at ex nec arcu interdum fringilla. Nulla facilisi.
            Maecenas ut sapien vel justo aliquam congue.
          </GroupDataText>
        </ProfileTextContainer>

        <GroupPageTabs style={style.line}>
          <ProfileTabsContainer
            onPress={() => {
              setMyPostsSelect(true);
              setSavedPostsSelect(false);
              setFilterPosts('userPosts');
            }}
            style={myPostsSelect ? style.selectStyleTab : {}}
            >
            <GroupDataText
              font="inter-bold"
              size="18px"
              color={myPostsSelect ? '#EF4036' : '#8F8F8F'}
            >
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
          {filterPosts === 'userPosts' ? (userPosts?.length > 0 ? (userPosts?.map((item: any) => (
            <PostCard
              nameUser={item.nameUser}
              imageUser={item.imageUser}
              postContent={item.postContent}
              numComments={item.numComments}
              date={item.date}
              share
            />
          ))) : '') : (savedPosts?.length > 0 ? (savedPosts?.map((item: any) => (
            <PostCard
              nameUser={item.nameUser}
              imageUser={item.imageUser}
              postContent={item.postContent}
              numComments={item.numComments}
              date={item.date}
              share
              saved
            />
          ))) : '')}
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
});
function useEffect(arg0: () => () => void, arg1: any[]) {
  throw new Error('Function not implemented.');
}
