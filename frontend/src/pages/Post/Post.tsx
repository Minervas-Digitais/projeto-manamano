/* eslint-disable import/no-duplicates */
/* eslint-disable global-require */
import { useFonts } from 'expo-font';
import { Controller, useForm } from 'react-hook-form';
import { Dimensions, Pressable, ScrollView, View } from 'react-native';
import { useEffect, useState } from 'react';
import { format, isValid } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useNavigation, useRoute } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import React from 'react';
import { StackNavigationProp } from '@react-navigation/stack';
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
import ModalOptions from '../../components/ModalOptions/ModalOptions';
import { storage } from '../SignIn/SignIn';
import api from '../../services/api';
import { toastConfig } from '../GlobalNotificationPage/GlobalNotificationPageStyle';
import DotsMenuIcon from '../../assets/dotsMenu-icon.svg';
import { RootStackParamList } from '../../navigation/types';

const { width, height } = Dimensions.get('window');

interface Comment {
  id: string;
  content: string;
  userId: string;
  createdAt: string;
}

interface Post {
  id: string;
  input: string;
  userId: string;
  groupId: string;
  createdAt: string;
  Comment: Comment[];
}

interface User {
  id: string;
  fullName: string;
}

interface Archive {
  id: string;
  name: string;
}

export default function Post() {
  const route = useRoute();
  const { postId } = route.params as { postId: string };
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [loggedIdState, setLoggedIdState] = useState('');
  const [accessTokenState, setAccessTokenState] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [post, setPost] = useState<Post | null>(null);
  const [postUser, setPostUser] = useState<User | null>(null);
  const [commentUsers, setCommentUsers] = useState<Record<string, User>>({});
  const [postArchives, setPostArchives] = useState<Archive[]>([]);
  const profileImage = require('../../assets/test-profile-icon.png');
  const [recipientId, setRecipientId] = useState('');
  const [idGroup, setIdGroup] = useState('');
  const [groupName, setGroupName] = useState<string>('');
  const [userName, setUserName] = useState('');

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
        .then((res) => setUserName(res.data.fullName));
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
        setRecipientId(response.data.userId);
        setIdGroup(response.data.groupId);
      } catch (error) {
        console.error('Erro ao buscar publicação', error);
        Toast.show({
          type: 'error',
          text1: 'Erro ao buscar publicação. Tente novamente mais tarde.',
        });
      }
    };
    fetchPost();
  }, [accessTokenState, postId]);

  useEffect(() => {
    if (!accessTokenState || !post?.userId) return;
    const fetchPostUser = async () => {
      try {
        const response = await api.get(`user/${post.userId}`, {
          headers: {
            Authorization: `Bearer ${accessTokenState}`,
          },
        });
        setPostUser(response.data);
      } catch (error) {
        console.error('Erro ao buscar usuário do post', error);
        Toast.show({
          type: 'error',
          text1: 'Erro ao buscar usuário da publicação. Tente novamente mais tarde.',
        });
      }
    };
    fetchPostUser();
  }, [accessTokenState, post?.userId]);
  
  useEffect(() => {
    if (!accessTokenState) return;
    const fetchArchives = async () => {
      try {
        const response = await api.get(`archives/post/${postId}`, {
          headers: {
            Authorization: `Bearer ${accessTokenState}`,
          },
        });
        setPostArchives(response.data);
      } catch (error) {
        console.error('Erro ao buscar arquivos do post', error);
        Toast.show({
          type: 'error',
          text1: 'Erro ao buscar arquivos da publicação. Tente novamente mais tarde.',
        });
      }
    };

    fetchArchives();
  }, [accessTokenState, postId]);

  useEffect(() => {
    if (!accessTokenState || !post?.Comment?.length) return;
    const fetchCommentUsers = async () => {
      try {
        const uniqueUserIds = [...new Set(post.Comment.map((comment) => comment.userId))];
        const usersData = await Promise.all(
          uniqueUserIds.map(async (userId) => {
            const response = await api.get(`user/${userId}`, {
              headers: {
                Authorization: `Bearer ${accessTokenState}`,
              },
            });
            return { userId, data: response.data };
          }),
        );
        const usersMap = usersData.reduce<Record<string, User>>((acc, user) => {
          acc[user.userId] = user.data;
          return acc;
        }, {});
        setCommentUsers(usersMap);
      } catch (error) {
        console.error('Erro ao buscar usuários dos comentários', error);
        Toast.show({
          type: 'error',
          text1: 'Erro ao buscar usuários dos comentários. Tente novamente mais tarde.',
        });
      }
    };

    fetchCommentUsers();
  }, [accessTokenState, post?.Comment]);
  const postDate = post?.createdAt ? new Date(post.createdAt) : null;
  const formattedDate =
    postDate && isValid(postDate)
      ? format(postDate, "dd 'de' MMM'.', HH:mm", { locale: ptBR })
      : '';
  const [modalOptions, setModalOptions] = useState(false);
  const {
    control,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm({});
  const onSubmit = async (data: any) => {
    try {
      const response = await api.post(
        '/comment',
        {
          userId: loggedIdState,
          content: data.input,
          postId,
        },
        {
          headers: {
            Authorization: `Bearer ${accessTokenState}`,
          },
        },
      );

      const groupResponse = await api.get(`/group/${idGroup}`, {
        headers: {
          Authorization: `Bearer ${accessTokenState}`,
        },
      });
      if (post && post.userId !== loggedIdState) {
        const groupNameFromApi = groupResponse.data.name;
        console.log({
          senderId: loggedIdState,
          senderName: userName,
          recipientId,
          groupName: groupNameFromApi,
          type: 'COMMENT',
          body: '',
        });
        await api.post(
          '/notifications',
          {
            senderId: loggedIdState,
            senderName: userName,
            recipientId,
            groupName: groupNameFromApi,
            type: 'COMMENT',
            body: '',
          },
          {
            headers: {
              Authorization: `Bearer ${accessTokenState}`,
            },
          },
        );
      }
      Toast.show({
        type: 'success',
        text1: 'Comentário enviado com sucesso!',
      });
      setTimeout(() => {
        navigation.replace('Post', { postId });
      }, 500);
    } catch (error) {
      console.error('Erro ao enviar comentário:', error);
      Toast.show({
        type: 'error',
        text1: 'Erro ao enviar comentário. Tente novamente mais tarde.',
      });
    }
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
    <View
      style={{
        backgroundColor: '#f2f6fa',
        height: '100%',
        display: loggedIdState && accessTokenState ? 'flex' : 'none',
      }}>
      <HeaderCustom
        font="inter-bold"
        text="Publicação"
        icon
        onPress={() => setModalOptions(!modalOptions)}
        headerButton={<DotsMenuIcon width="30px" height="30px" />}
      />
      {modalOptions ? <ModalOptions postId={postId} /> : ''}
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{ backgroundColor: '#f2f6fa', flex: 1 }}>
        <PostContainer>
          <PostUpperPart>
            <ProfileImage source={profileImage} />
            <ProfileName font="inter-bold">{postUser?.fullName}</ProfileName>
            <PostDate font="inter-semibold">{formattedDate}</PostDate>
          </PostUpperPart>
          <PostText font="inter-regular">{post?.input}</PostText>
          <ScrollView
            showsHorizontalScrollIndicator={false}
            horizontal
            contentContainerStyle={{ gap: 15 }}
            style={{ maxHeight: 85 }}>
            {postArchives.map((archive) => (
              <PostAttachment archive key={archive.id} text={archive.name} file={archive} />
            ))}
          </ScrollView>
          <View style={{ width: '100%', left: -0.06 * width }}>
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
                <Pressable testID="input-container" onPress={() => setIsFocused(true)}>
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
            {errors.input && <ErrorWarning errorText="Campo obrigatório" />}
            {Array.isArray(post?.Comment) && post.Comment.length > 0 ? (
              post?.Comment.map((item: any) => {
                const formattedDate = format(new Date(item.createdAt), "dd 'de' MMM'.', HH:mm", {
                  locale: ptBR,
                });
                const commentUser = commentUsers[item.userId];
                return (
                  <CommentCard
                    key={item.id}
                    fullName={commentUser?.fullName || 'Usuário desconhecido'}
                    input={item.content}
                    createdAt={formattedDate}
                  />
                );
              })
            ) : (
              <View />
            )}
          </CommentsContainer>
          <Toast config={toastConfig} />
        </PostContainer>
      </ScrollView>
    </View>
  );
}
