/* eslint-disable react/jsx-one-expression-per-line */
/* eslint-disable global-require */
import React, { useState } from 'react';
import { useFonts } from 'expo-font';
import { Image, TouchableOpacity, View } from 'react-native';
import {
  HomeContainerGroup,
  HomeContainerInfo,
  HomeContainerListGroup,
  HomeContainerListMural,
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
import SideMenu from '../../components/SideMenu/SideMenu';
import PostCard from '../../components/PostCard/PostCard';

export default function Home() {
  const [sideMenu, setSideMenu] = useState(true);
  const duckImage = require('../../assets/duck.png');
  const menuIcon = require('../../assets/menuWhite-icon.svg');
  const lupa = require('../../assets/lupaWhite-icon.svg');

  const [fontsLoaded] = useFonts({
    'inter-bold': require('../../fonts/Inter-Bold.ttf'),
  });
  if (!fontsLoaded) {
    return undefined;
  }
  const fakeGroups: any = [
    { groupName: 'Vetereanos 22.1', onlineMembers: 23 },
    { groupName: 'Vetereanos 22.1', onlineMembers: 23 },
    { groupName: 'Vetereanos 22.1', onlineMembers: 23 },
    { groupName: 'Vetereanos 22.1', onlineMembers: 23 },
    { groupName: 'Vetereanos 22.1', onlineMembers: 23 },
    { groupName: 'Vetereanos 22.1', onlineMembers: 23 },
  ];

  const nameUser = 'Jhennifer Moreira';

  const fakePosts: any = [
    {
      nameUser: 'Jhennifer Moreira',
      imageUser: duckImage,
      postContent: 'Alguém mora perto de Bonsucesso?',
      numComments: 5,
      date: 'Ontem, 21:32',
      originGroup: 'Vetereanos 22.1',
    },
    {
      nameUser: 'Juliana Silva',
      imageUser: duckImage,
      postContent: 'Já postaram o link da aula?',
      numComments: 5,
      date: 'Ontem, 21:32',
      originGroup: 'Calouros 23.2',
    },
    {
      nameUser: 'Jhennifer Moreira',
      imageUser: duckImage,
      postContent: 'Alguém mora perto de Bonsucesso?',
      numComments: 5,
      date: 'Ontem, 21:32',
      originGroup: 'Vetereanos 22.1',
    },
    {
      nameUser: 'Juliana Silva',
      imageUser: duckImage,
      postContent: 'Já postaram o link da aula?',
      numComments: 5,
      date: 'Ontem, 21:32',
      originGroup: 'Calouros 23.2',
    },
    {
      nameUser: 'Juliana Silva',
      imageUser: duckImage,
      postContent: 'Já postaram o link da aula?',
      numComments: 5,
      date: 'Ontem, 21:32',
      originGroup: 'Calouros 23.2',
    },
  ];
  return (
    <HomePageBlue>
      <SideMenu display={sideMenu} onPress={() => setSideMenu(!sideMenu)} />
      <HomeContainerInfo>
        <PostCardSpaceBetween>
          <PostCardIcons>
            <TouchableOpacity onPress={() => setSideMenu(!sideMenu)}>
              <Image source={menuIcon} />
            </TouchableOpacity>
          </PostCardIcons>
          <PostCardIcons style={{ gap: '25px' }}>
            <TouchableOpacity>
              <Image source={lupa} />
            </TouchableOpacity>
            <TouchableOpacity>
              <PostCardImageUser style={{ border: 'solid 1.7px white' }} source={duckImage} />
            </TouchableOpacity>
          </PostCardIcons>
        </PostCardSpaceBetween>
        <View>
          <GroupDataText font="inter-bold" color="#EF4036" size="20px">
            Olá,
          </GroupDataText>
          <GroupDataText numberOfLines={1} font="inter-bold" color="#ffff" size="20px">
            {nameUser}!
          </GroupDataText>
        </View>
      </HomeContainerInfo>

      <HomePageWhite>
        <HomeContainerGroup>
          <GroupDataText font="inter-bold" color="#3F3D3D" size="20px">
            Grupos
          </GroupDataText>
          <HomeContainerListGroup>
            {fakeGroups?.length > 0 ? (
              fakeGroups?.map((item: any) => (
                <GroupButton groupName={item.groupName} onlineMembers={item.onlineMembers} />
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
          <HomeContainerListMural>
            {fakePosts?.length > 0 ? (
              fakePosts?.map((item: any) => (
                <PostCard
                  nameUser={item.nameUser}
                  imageUser={item.imageUser}
                  postContent={item.postContent}
                  numComments={item.numComments}
                  date={item.date}
                  originGroup={item.originGroup}
                />
              ))
            ) : (
              <GroupDataText font="inter-bold" color="#959393" size="20px">
                Não há comentários...
              </GroupDataText>
            )}
          </HomeContainerListMural>
        </HomeContainerMural>
      </HomePageWhite>
    </HomePageBlue>
  );
}
