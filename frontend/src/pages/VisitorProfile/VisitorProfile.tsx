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
} from '../Profile/ProfileStyle';
import { HomePageBlue, HomePageWhite } from '../Home/HomeStyle';
import { GroupDataText } from '../GroupData/GroupDataStyle';
import { GroupPageTabs } from '../GroupPage/GroupPageStyle';
import PostCard from '../../components/PostCard/PostCard';
import SideMenu from '../../components/SideMenu/SideMenu';

export default function VisitorProfile({ navigation }: any) {
  const [sideMenu, setSideMenu] = useState(true);

  const userName = 'Maria Fernanda';
  const city = 'Rio de Janeiro';
  const businessName = 'Doceria da Maria';

  const duckImage = require('../../assets/duck.png');
  const location = require('../../assets/location-icon.svg');
  const shareWhite = require('../../assets/share-white-icon.svg');
  const menuIcon = require('../../assets/menuWhite-icon.svg');
  const business = require('../../assets/business-icon.svg');
  const whatsapp = require('../../assets/whatsapp-icon.svg');
  const email = require('../../assets/email-icon.svg');

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
          <View style={style.viewStyleInfo}>
            <TouchableOpacity>
              <ProfileImage height="24px" width="24px" radius={false} source={whatsapp} />
            </TouchableOpacity>
            <TouchableOpacity>
              <ProfileImage height="24px" width="24px" radius={false} source={email} />
            </TouchableOpacity>
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

        <GroupPageTabs style={style.line} />
        <ProfilePostsContainer>
          {savedPosts?.length > 0 ? (savedPosts?.map((item: any) => (
            <PostCard
              nameUser={item.nameUser}
              imageUser={item.imageUser}
              postContent={item.postContent}
              numComments={item.numComments}
              date={item.date}
              share
              save
            />
          ))) : ''}
        </ProfilePostsContainer>
      </HomePageWhite>

    </HomePageBlue>
  );
}
const style = StyleSheet.create({

  line: {
    borderBottomColor: '#D9D9D9',
    borderBottomWidth: 1,
    paddingTop: 25,
  },
  viewStyleInfo: {
    display: 'flex',
    gap: 25,
    flexDirection: 'row',
    alignItems: 'center',
  },
});
