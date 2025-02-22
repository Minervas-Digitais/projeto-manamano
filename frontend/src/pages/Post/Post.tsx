/* eslint-disable global-require */
import { useFonts } from 'expo-font';
import { Controller, useForm } from 'react-hook-form';
import { Linking, Pressable, ScrollView, Share, TouchableOpacity, View } from 'react-native';
import { SetStateAction, useEffect, useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useRoute } from '@react-navigation/native';
import HeaderCustom from '../../components/HeaderCustom/HeaderCustom';
import PostAttachment from '../../components/PostAttachmentCard/PostAttachment';
import {
  CommentsContainer,
  HorizontalSeparator,
  PostContainer,
  PostDate,
  PostText,
  PostUpperPart,
  ProfileImage,
  ProfileName,
} from './PostStyle';
import CommentCard from '../../components/CommentCard/CommentCard';
import CommentInputTextCustom from '../../components/CommentInput/CommentInputText';
import ErrorWarning from '../../components/ErrorWarning/ErrorWarning';
import { PostCardImage } from '../../components/PostCard/PostCardStyle';
import ModalOptions from '../../components/ModalOptions/ModalOptions';
import { storage } from '../SignIn/SignIn';
import api from '../../services/api';

export default function Post() {
  const route = useRoute();
  const { postId } = route.params as { postId: string };
  const createDeepLink = () => `manamano://post/${postId}`;
  const [loggedIdState, setLoggedIdState] = useState('');
  const [accessTokenState, setAccessTokenState] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [post, setPost] = useState(null);
  const [user, setUser] = useState(null);
  const profileImage = require('../../assets/test-profile-icon.png');
  useEffect(() => {
    const accessToken = storage.getString('accessToken');
    const loggedId = storage.getString('loggedId');
    if (loggedId && accessToken) {
      setAccessTokenState(accessToken);
      setLoggedIdState(loggedId);
      api.get(`/user/${loggedId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
    }
  }, []);
  useEffect(() => {
    if (!accessTokenState) return;
    const fetchPost = async () => {
      try {
        const response = await api.get(`post/${postId}`, {
          headers: {
            Authorization: `Bearer ${accessTokenState}`,
          },
        });
        setPost(response.data);
      } catch (error) {
        console.error('Erro ao buscar publicação', error);
        alert('Erro ao buscar publicação');
      }
    };
    fetchPost();
  }, [accessTokenState, postId]);
  useEffect(() => {
    if (!accessTokenState) return;
    const fetchUser = async () => {
      try {
        const response = await api.get(`user/${post?.userId}`, {
          headers: {
            Authorization: `Bearer ${accessTokenState}`,
          },
        });
        setUser(response.data);
      } catch (error) {
        console.error('Erro ao buscar usuário', error);
        alert('Erro ao buscar usuário');
      }
    };
    fetchUser();
  }, [accessTokenState, postId]);
  const fakeComment: any = [
    { fullName: 'Jorgelina Silva', createdAt: '2024-05-08T21:33:30Z', input: 'Falou e disse!' },
    { fullName: 'Jorgelina Silva', createdAt: '2024-05-08T21:33:30Z', input: 'Falou e disse!' },
    { fullName: 'Jorgelina Silva', createdAt: '2024-05-08T21:33:30Z', input: 'Falou e disse!' },
    { fullName: 'Jorgelina Silva', createdAt: '2024-07-18T21:33:30Z', input: 'Falou e disse!' },
    { fullName: 'Jorgelina Silva', createdAt: '2024-05-08T21:33:30Z', input: 'Falou e disse!' },
  ];
  const postDate = new Date(post?.createdAt);
  const formattedDate = format(postDate, "dd 'de' MMM'.', HH:mm", { locale: ptBR });
  const [modalOptions, setModalOptions] = useState(false);
  const dotsMenuIcon = require('../../assets/dotsMenu-icon.svg');
  const {
    control,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm({});
  const onSubmit = (data: any) => {
    // eslint-disable-next-line no-alert
    alert(JSON.stringify(data));
  };
  const handleBlur = () => {
    const comment = getValues('input');
    if (comment === '') {
      setIsFocused(false);
    }
  };
  const [fontsLoaded] = useFonts({
    'inter-bold': require('../../fonts/Inter-Bold.ttf'),
    'inter-regular': require('../../fonts/Inter-Regular.ttf'),
    'inter-semibold': require('../../fonts/Inter-SemiBold.ttf'),
  });
  if (!fontsLoaded) {
    return undefined;
  }
  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      style={{ backgroundColor: '#f2f6fa', height: '100%' }}
      contentContainerStyle={{ display: loggedIdState && accessTokenState ? 'flex' : 'none' }}>
      <HeaderCustom
        font="inter-bold"
        text="Publicação"
        icon
        headerButton={
          <View>
            {modalOptions ? <ModalOptions createDeepLink={createDeepLink} /> : ''}
            <TouchableOpacity onPress={() => setModalOptions(!modalOptions)}>
              <PostCardImage width="30px" height="30px" source={dotsMenuIcon} />
            </TouchableOpacity>
          </View>
        }
      />
      <PostContainer>
        <PostUpperPart>
          <ProfileImage source={profileImage} />
          <ProfileName font="inter-bold">{user?.fullName}</ProfileName>
          <PostDate font="inter-semibold">{formattedDate}</PostDate>
        </PostUpperPart>
        <PostText font="inter-regular">{post?.input}</PostText>
        <ScrollView
          showsHorizontalScrollIndicator={false}
          horizontal
          contentContainerStyle={{ gap: 15 }}
          style={{ maxHeight: 85 }}>
          <PostAttachment text="Aula 1 - Whatsapp" />
          <PostAttachment archive text="Aula 1 - Drive" />
          <PostAttachment text="asfwhjeineif" />
          <PostAttachment text="asfwhjeineif" />
          <PostAttachment archive text="sdaghjsae8ig" />
          <PostAttachment text="asfwhjeineif" />
        </ScrollView>
        <View style={{ width: '100%', left: '-6vw' }}>
          <HorizontalSeparator />
        </View>
        <CommentsContainer>
          <Controller
            control={control}
            name="input"
            defaultValue=""
            rules={{
              required: true,
            }}
            render={({ field: { onChange, value } }) => (
              <Pressable onPress={() => setIsFocused(true)}>
                <CommentInputTextCustom
                  onChangeText={onChange}
                  value={value}
                  isFocused={isFocused}
                  onPressSubmit={handleSubmit(onSubmit)}
                  onBlur={handleBlur}
                />
              </Pressable>
            )}
          />
          {errors.groupcode && <ErrorWarning errorText="Campo obrigatório" />}
          {post?.Comment?.length > 0 ? (
            fakeComment.map((item: any) => {
              let formattedDate = format(new Date(item.createdAt), "dd 'de' MMM'.', HH:mm", {
                locale: ptBR,
              });
              return (
                <CommentCard
                  fullName={item.fullName}
                  input={item.input}
                  createdAt={formattedDate}
                />
              );
            })
          ) : (
            <View />
          )}
        </CommentsContainer>
      </PostContainer>
    </ScrollView>
  );
}
