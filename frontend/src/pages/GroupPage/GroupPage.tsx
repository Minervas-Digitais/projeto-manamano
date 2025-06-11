/* eslint-disable react/jsx-indent */
/* eslint-disable no-nested-ternary */
/* eslint-disable react/jsx-closing-bracket-location */
/* eslint-disable global-require */
import React, { useState, useEffect } from 'react';
import { useFonts } from 'expo-font';
import { StyleSheet, View, Image, Dimensions, Button } from 'react-native';
import { useRoute } from '@react-navigation/native';

import { storage } from '../SignIn/SignIn';
import {
  GroupPageAddPostButton,
  GroupPageCategoryContainer,
  GroupPageCategoryList,
  GroupPageContainer,
  GroupPageContent,
  GroupPageImage,
  GroupPageImageContainer,
  GroupPageLessonsContainer,
  GroupPageListFixPost,
  GroupPagePostList,
  GroupPageTabs,
  GroupPageTabsContainer,
  ImageContainer,
} from './GroupPageStyle';
import HeaderCustom from '../../components/HeaderCustom/HeaderCustom';
import { GroupDataText } from '../GroupData/GroupDataStyle';
import PostCard from '../../components/PostCard/PostCard';
import CategoryButton from '../../components/CategoryButton/CategoryButton';
import LessonsCard from '../../components/LessonsCard/LessonsCard';
import FileCard from '../../components/FileCard/FileCard';
import SideMenu from '../../components/SideMenu/SideMenu';
import api from '../../services/api';
import { storageHome } from '../Home/Home';
import EventCard from '../../components/EventCard/EventCard';

export default function GroupPage({ navigation }: any) {
  const route = useRoute();
  const { groupId } = route.params as { groupId: string };
  const { groupName } = route.params as { groupName: string };

  useEffect(() => {
    getGroupPosts();
    getGroupCategory();
  }, []);
  const notificationIcon = require('../../assets/notification-icon.svg');
  const duckImage = require('../../assets/duck.png');
  const addPost = require('../../assets/add-post-icon.svg');

  const [muralSelect, setMuralSelect] = useState(true);
  const [classesSelect, setClassesSelect] = useState(false);
  const [filesSelect, setFilesSelect] = useState(false);
  const [filterPosts, setFilterPosts] = useState('Geral');
  const [filterFiles, setFilterFiles] = useState('Fotos');
  const [sideMenu, setSideMenu] = useState(true);
  const [categories, setCategories] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);

  const [fontsLoaded] = useFonts({
    'inter-bold': require('../../fonts/Inter-Bold.ttf'),
    'inter-regular': require('../../fonts/Inter-Regular.ttf'),
    'inter-semiBold': require('../../fonts/Inter-SemiBold.ttf'),
  });

  if (!fontsLoaded) {
    return undefined;
  }

  const fileCategory = [
    { categoryName: 'Fotos' },
    { categoryName: 'Links' },
    { categoryName: 'Documentos' },
  ];

  const fakeLessonsCard: any = [
    { title: 'Aula 1', date: '23/09/24', time: '12:30' },
    { title: 'Aula 2', date: '02/10/24', time: '16:00' },
    { title: 'Aula 3', date: '12/11/24', time: '13:30' },
    { title: 'Aula 4', date: '20/11/24', time: '17:00' },
  ];

  const fakeFiles: any = [
    { file: duckImage, type: 'Fotos' },
    { file: duckImage, type: 'Fotos' },
    { file: duckImage, type: 'Fotos' },
    { file: duckImage, type: 'Fotos' },
    { file: duckImage, type: 'Fotos' },
    { file: duckImage, type: 'Fotos' },
    { file: duckImage, type: 'Fotos' },
    { file: duckImage, type: 'Fotos' },
    { file: duckImage, type: 'Fotos' },
    { file: duckImage, type: 'Fotos' },
    { file: duckImage, type: 'Fotos' },
    { file: duckImage, type: 'Fotos' },
    { file: duckImage, type: 'Fotos' },
    { file: duckImage, type: 'Fotos' },
    { file: duckImage, type: 'Fotos' },
    { file: duckImage, type: 'Fotos' },
    { file: duckImage, type: 'Fotos' },
    { file: duckImage, type: 'Fotos' },
    { file: duckImage, type: 'Fotos' },
    { file: duckImage, type: 'Fotos' },
    {
      file: 'https://www.youtube.com/watch?v=M8r3x4Re8-I&list=RDnFYwcndNuOY&index=3',
      type: 'Links',
    },
    {
      file: 'https://www.youtube.com/watch?v=M8r3x4Re8-I&list=RDnFYwcndNuOY&index=3',
      type: 'Links',
    },
    {
      file: 'https://www.youtube.com/watch?v=M8r3x4Re8-I&list=RDnFYwcndNuOY&index=3',
      type: 'Links',
    },
    {
      file: 'https://www.youtube.com/watch?v=M8r3x4Re8-I&list=RDnFYwcndNuOY&index=3',
      type: 'Links',
    },
    {
      file: 'https://docs.google.com/document/d/1ey-q9oZH27DizO-vdU5kKc42Wgm9QWBcxOSdxQekZHQ/edit#heading=h.izon6a0gzjm',
      type: 'Documentos',
    },
    {
      file: 'https://docs.google.com/document/d/1ey-q9oZH27DizO-vdU5kKc42Wgm9QWBcxOSdxQekZHQ/edit#heading=h.izon6a0gzjm',
      type: 'Documentos',
    },
    {
      file: 'https://docs.google.com/document/d/1ey-q9oZH27DizO-vdU5kKc42Wgm9QWBcxOSdxQekZHQ/edit#heading=h.izon6a0gzjm',
      type: 'Documentos',
    },
    {
      file: 'https://docs.google.com/document/d/1ey-q9oZH27DizO-vdU5kKc42Wgm9QWBcxOSdxQekZHQ/edit#heading=h.izon6a0gzjm',
      type: 'Documentos',
    },
  ];
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
    const month = String(date.getMonth() + 1).padStart(2, '0'); // mês começa em 0
    const year = String(date.getFullYear()).slice(-2); // últimos 2 dígitos do ano
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${day}/${month}/${year} - ${hours}:${minutes}`;
  }
  const getGroupPosts = async () => {
    const token = storage.getString('accessToken');

    if (!token) {
      console.error('Access token is missing.');
      return;
    }

    try {
      const response = await fetch(`http://localhost:3000/post/group/${groupId}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      setPosts(data);
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  };

  const getGroupCategory = async () => {
    const token = storage.getString('accessToken');
    if (!token) {
      console.error('Access token is missing.');
      return;
    }

    try {
      const response = await fetch(`http://localhost:3000/category/group/${groupId}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      const filteredData = data.filter((category: any) => category.name !== 'Aulas');

      setCategories(filteredData);
      console.log('Categorias do grupo (filtradas):', filteredData);
    } catch (error) {
      console.error('Error fetching group categories:', error);
    }
  };

  const fixActions = async (id: string, isPinned: boolean) => {
    const token = storage.getString('accessToken');
    const loggedId = storage.getString('loggedId');

    try {
      await api.patch(
        `/post/${id}`,
        { isPinned: !isPinned },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!isPinned) {
        await api.post(
          '/notifications',
          {
            senderId: loggedId,
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

      await getGroupPosts();
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
        icon={notificationIcon}
        onPressMenu={() => {
          setSideMenu(!sideMenu);
        }}
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
          <>
            <GroupPageListFixPost>
              {posts.length > 0 ? (
                posts
                  .filter((item: any) => item.isPinned)
                  .toReversed()
                  .map((item: any) => {
                    if (item.type === 'NORMAL') {
                      return (
                        <PostCard
                          nameUser={item.nameUser}
                          imageUser={duckImage}
                          postContent={item.input}
                          numComments={item.numComments}
                          date={formatRelativeDate(item.createdAt)}
                          onPressFix={() => fixActions(item.id, item.isPinned)}
                          onPressPost={() => onPressPostAction(item.id)}
                          dotsMenu
                          fix
                          postId={item.id}
                        />
                      );
                    }
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
                        nameUser={item.nameUser}
                        imageUser={duckImage}
                        postContent={item.input}
                        numComments={item.numComments}
                        date={formatRelativeDate(item.createdAt)}
                        onPressFix={() => fixActions(item.id, item.isPinned)}
                        onPressPost={() => onPressPostAction(item.id)}
                        dotsMenu
                        postId={item.id}
                      />
                    );
                  }
                  if (filterPosts === item.categoryName && item.type === 'EVENT') {
                    return (
                      <EventCard
                        date={formatRelativeDate(item.createdAt)}
                        title={item.title}
                        description={item.input}
                      />
                    );
                  }
                })
              ) : (
                <View />
              )}
            </GroupPagePostList>
            <GroupPageAddPostButton
              onPress={() => {
                console.log('groupId no GroupPage', groupId);
                navigation.navigate('NewPost', { groupId });
              }}>
              <Image source={addPost} />
            </GroupPageAddPostButton>
          </>
        ) : classesSelect ? (
          <GroupPageLessonsContainer style={{ flex: 1 }}>
            {posts?.length > 0 ? (
              posts?.map((item: any) => {
                if (item.type === 'CLASS') {
                  return (
                    <LessonsCard
                      date={formatDateTime(item.schedule)}
                      title={item.title}
                      urlLive={item.urlLive}
                    />
                  );
                }
              })
            ) : (
              <View />
            )}
            <GroupPageAddPostButton
              onPress={() => {
                console.log('groupId no GroupPage', groupId);
                navigation.navigate('NewLesson', { groupId });
              }}>
              <Image source={addPost} />
            </GroupPageAddPostButton>
          </GroupPageLessonsContainer>
        ) : (
          <>
            <GroupPageLessonsContainer style={{ justifyContent: 'center', flexDirection: 'row' }}>
              {fileCategory?.length > 0 ? (
                fileCategory?.map((item: any) => (
                  <CategoryButton
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
            {fakeFiles?.length > 0 && filterFiles === 'Fotos' ? (
              <ImageContainer>
                <GroupPageImageContainer>
                  {fakeFiles?.map((item: any) => {
                    if (filterFiles === item.type) {
                      switch (filterFiles) {
                        case 'Fotos':
                          return <GroupPageImage source={item.file} />;
                        default:
                      }
                    }
                  })}
                </GroupPageImageContainer>
              </ImageContainer>
            ) : (
              <GroupPageLessonsContainer style={{ paddingTop: 0 }}>
                {fakeFiles?.map((item: any) => {
                  if (filterFiles === item.type) {
                    switch (filterFiles) {
                      case 'Links':
                        return <FileCard info={item.file} type={item.type} />;
                      case 'Documentos':
                        return <FileCard info={item.file} type={item.type} />;
                      default:
                    }
                  }
                })}
              </GroupPageLessonsContainer>
            )}
          </>
        )}
      </GroupPageContent>
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
});
