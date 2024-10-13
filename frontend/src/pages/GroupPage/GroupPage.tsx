/* eslint-disable react/jsx-indent */
/* eslint-disable no-nested-ternary */
/* eslint-disable react/jsx-closing-bracket-location */
/* eslint-disable global-require */
import React, { useState } from 'react';
import { useFonts } from 'expo-font';
import { StyleSheet, View, Text, Image, Dimensions } from 'react-native';
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

export default function GroupPage({ navigation }: nay) {
  const notificationIcon = require('../../assets/notification-icon.svg');
  const duckImage = require('../../assets/duck.png');
  const addPost = require('../../assets/add-post-icon.svg');

  const [muralSelect, setMuralSelect] = useState(true);
  const [classesSelect, setClassesSelect] = useState(false);
  const [filesSelect, setFilesSelect] = useState(false);
  const [filterPosts, setFilterPosts] = useState('Geral');
  const [filterFiles, setFilterFiles] = useState('Fotos');
  const [sideMenu, setSideMenu] = useState(true);

  const [fontsLoaded] = useFonts({
    'inter-bold': require('../../fonts/Inter-Bold.ttf'),
    'inter-regular': require('../../fonts/Inter-Regular.ttf'),
    'inter-semiBold': require('../../fonts/Inter-SemiBold.ttf'),
  });
  if (!fontsLoaded) {
    return undefined;
  }
  const groupName = 'Turma 24.1';
  const fakePosts: any = [
    {
      nameUser: 'Geral Moreira',
      imageUser: duckImage,
      postContent: 'Alguém mora perto de Bonsucesso? Alguém mora perto de Bonsucesso?',
      numComments: 5,
      date: 'Ontem, 21:32',
      originGroup: 'Vetereanos 22.1',
      categoryName: 'Geral',
    },
    {
      nameUser: 'Geral Silva',
      imageUser: duckImage,
      postContent: 'Já postaram o link da aula?',
      numComments: 5,
      date: 'Ontem, 21:32',
      originGroup: 'Calouros 23.2',
      categoryName: 'Geral',
    },
    {
      nameUser: 'Geral Moreira',
      imageUser: duckImage,
      postContent: 'Alguém mora perto de Bonsucesso? Alguém mora perto de Bonsucesso?',
      numComments: 5,
      date: 'Ontem, 21:32',
      originGroup: 'Vetereanos 22.1',
      categoryName: 'Geral',
    },
    {
      nameUser: 'Geral Silva',
      imageUser: duckImage,
      postContent: 'Já postaram o link da aula?',
      numComments: 5,
      date: 'Ontem, 21:32',
      originGroup: 'Calouros 23.2',
      categoryName: 'Geral',
    },
    {
      nameUser: 'Avisos Moreira',
      imageUser: duckImage,
      postContent: 'Alguém mora perto de Bonsucesso?',
      numComments: 5,
      date: 'Ontem, 21:32',
      originGroup: 'Vetereanos 22.1',
      categoryName: 'Avisos',
    },
    {
      nameUser: 'Eventos Silva',
      imageUser: duckImage,
      postContent: 'Já postaram o link da aula?',
      numComments: 5,
      date: 'Ontem, 21:32',
      originGroup: 'Calouros 23.2',
      categoryName: 'Eventos',
    },
    {
      nameUser: 'Outros Silva',
      imageUser: duckImage,
      postContent: 'Já postaram o link da aula?',
      numComments: 656,
      date: 'Ontem, 21:32',
      originGroup: 'Calouros 23.2',
      categoryName: 'Outros',
    },
  ];

  const fakeCategoryList = [
    { categoryName: 'Geral' },
    { categoryName: 'Avisos' },
    { categoryName: 'Eventos' },
    { categoryName: 'Outros' },
  ];

  const fakeCategory = [
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
        onPressTitle={() => navigation.navigate('GroupData')}
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
              {fakePosts?.length > 0 ? (
                fakePosts?.map((item: any) => (
                  <PostCard
                    nameUser={item.nameUser}
                    imageUser={item.imageUser}
                    postContent={item.postContent}
                    numComments={item.numComments}
                    date={item.date}
                    originGroup={item.originGroup}
                    dotsMenu
                    fix
                  />
                ))
              ) : (
                <View />
              )}
            </GroupPageListFixPost>
            <GroupPageCategoryContainer>
              <GroupDataText color="#4E4E4E" font="inter-semiBold" size="18px">
                Categorias
              </GroupDataText>
              <GroupPageCategoryList>
                {fakeCategoryList?.length > 0 ? (
                  fakeCategoryList?.map((item: any) => (
                    <CategoryButton
                      categoryName={item.categoryName}
                      onPress={() => {
                        setFilterPosts(item.categoryName);
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
              {fakePosts?.length > 0 ? (
                fakePosts?.map((item: any) => {
                  if (filterPosts === item.categoryName) {
                    return (
                      <PostCard
                        nameUser={item.nameUser}
                        imageUser={item.imageUser}
                        postContent={item.postContent}
                        numComments={item.numComments}
                        date={item.date}
                        originGroup={item.originGroup}
                        dotsMenu
                      />
                    );
                  }
                })
              ) : (
                <View />
              )}
            </GroupPagePostList>
            <GroupPageAddPostButton onPress={() => {}}>
              <Image source={addPost} />
            </GroupPageAddPostButton>
          </>
        ) : classesSelect ? (
          <GroupPageLessonsContainer>
            {fakeLessonsCard?.length > 0 ? (
              fakeLessonsCard?.map((item: any) => (
                <LessonsCard date={item.date} time={item.time} title={item.title} />
              ))
            ) : (
              <View />
            )}
          </GroupPageLessonsContainer>
        ) : (
          <>
            <GroupPageLessonsContainer style={{ justifyContent: 'center', flexDirection: 'row' }}>
              {fakeCategory?.length > 0 ? (
                fakeCategory?.map((item: any) => (
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
