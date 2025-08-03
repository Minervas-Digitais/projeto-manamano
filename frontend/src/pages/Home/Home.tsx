/* eslint-disable react/jsx-one-expression-per-line */
/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable global-require */
/* eslint-disable @typescript-eslint/indent */
/* eslint-disable no-confusing-arrow */
/* eslint-disable react/no-array-index-key */
/* eslint-disable react/jsx-indent-props */
/* eslint-disable react/jsx-indent */
/* eslint-disable implicit-arrow-linebreak */
import React, { useEffect, useState } from 'react';
import { useFonts } from 'expo-font';
import { TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { MMKV } from 'react-native-mmkv';
import { StatusBar } from 'expo-status-bar';
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
import { storage } from '../SignIn/SignIn';
import api from '../../services/api';
import MenuIcon from '../../assets/menuWhite-icon.svg';
import LupaIcon from '../../assets/lupaWhite-icon.svg';

export const storageHome = new MMKV();

export default function Home({ navigation }: any) {
  const [sideMenu, setSideMenu] = useState(true);
  const duckImage = require('../../assets/duck.png');
  const [loggedIdState, setLoggedIdState] = useState('');
  const [accessTokenState, setAccessTokenState] = useState('');
  const [fullName, setFullName] = useState('');
  const [groups, setGroups] = useState<any[]>([]);
  const [hiddenGroupIds, setHiddenGroupIds] = useState<string[]>([]);

  const [fontsLoaded] = useFonts({
    'inter-bold': require('../../fonts/Inter-Bold.ttf'),
  });

  useEffect(() => {
    const accessToken = storage.getString('accessToken');
    const loggedId = storage.getString('loggedId');
    if (loggedId && accessToken) {
      setAccessTokenState(accessToken);
      setLoggedIdState(loggedId);

      api
        .get(`/user/${loggedId}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        })
        .then((res) => setFullName(res.data.fullName))
        .catch(() => setFullName('Usuário'));

      api
        .get(`participant/groups/${loggedId}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        })
        .then((res) => setGroups(res.data || []))
        .catch(() => setGroups([]));
    }
  }, []);

  if (!fontsLoaded) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

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

  const filteredGroups = Array.isArray(groups)
    ? groups.map((group: any) => ({
        ...group,
        group: {
          ...group.group,
          Post: hiddenGroupIds.includes(group.groupId) ? [] : group.group.Post || [],
        },
      }))
    : [];

  // Lógica aprimorada para verificar se há posts
  const hasPosts = filteredGroups.some((group) => group.group.Post && group.group.Post.length > 0);

  return (
    <HomePageBlue style={{ display: loggedIdState && accessTokenState ? 'flex' : 'none' }}>
      <StatusBar />
      <SideMenu display={sideMenu} onPress={() => setSideMenu(!sideMenu)} />
      <HomeContainerInfo>
        <PostCardSpaceBetween>
          <PostCardIcons>
            <TouchableOpacity onPress={() => setSideMenu(!sideMenu)}>
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
              <PostCardImageUser source={duckImage} />
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
                    storage.set('groupId', item.groupId);
                    console.log(`groupId home: ${item.groupId}`);
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
          <HomeContainerListMural
            contentContainerStyle={{ gap: 25 }}
            showsVerticalScrollIndicator={false}>
            {/* Usando a nova variável hasPosts para a lógica condicional */}
            {hasPosts ? (
              filteredGroups.map((item: any) =>
                item.group.Post.map((post: any, postIndex: number) => (
                  <PostCard
                    key={postIndex}
                    nameUser={post.user.fullName}
                    imageUser={duckImage}
                    postContent={post.input}
                    numComments={post.commentsCount}
                    date={formatRelativeDate(post.createdAt)}
                    originGroup={item.group.name}
                    tag
                    save
                    share
                    onPressPost={() => onPressPostAction(post.id)}
                    postId={post.id}
                  />
                )),
              )
            ) : (
              <GroupDataText font="inter-bold" color="#959393" size="20px">
                Não há Posts...
              </GroupDataText>
            )}
          </HomeContainerListMural>
        </HomeContainerMural>
      </HomePageWhite>
    </HomePageBlue>
  );
}
