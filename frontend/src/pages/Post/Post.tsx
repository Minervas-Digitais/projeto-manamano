/* eslint-disable import/no-duplicates */
/* eslint-disable global-require */
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  Dimensions,
  Pressable,
  ScrollView,
  View,
  Share,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { format, isValid } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useNavigation, useRoute } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import { StackNavigationProp } from '@react-navigation/stack';
import { Buffer } from 'buffer'; // se necessário pra conversão base64
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
import api from '../../services/api';
import useFetch from '../../hooks/useFetch';
import ErrorState from '../../components/ErrorState/ErrorState';
import DotsMenuIcon from '../../assets/dots-menu-icon.svg';
import { RootStackParamList } from '../../navigation/types';
import { useSavedPosts } from '../../context/SavedPostsContext';
import ScreenWithHeader from '../../components/ScreenWithHeader/ScreenWithHeader';
import { useAuth } from '../../context/auth/useAuth';

const { width } = Dimensions.get('window');
const defaultAvatar = require('../../assets/user-profile.png');

interface Comment {
  id: string;
  content: string;
  userId: string;
  createdAt: string;
}

interface PostInterface {
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
  const { loggedId } = useAuth();
  const { postId } = route.params as { postId: string };
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [isFocused, setIsFocused] = useState(false);
  const [modalOptions, setModalOptions] = useState(false);

  const meQuery = useFetch(() => api.get(`/user/${loggedId}`).then((res) => res.data), [loggedId], {
    enabled: !!loggedId,
    onError: (_error, { hadData }) => {
      if (hadData) {
        Toast.show({
          type: 'error',
          text1: 'Erro inesperado',
          text2: 'Não foi possível atualizar o nome do usuário logado.',
        });
      }
    },
  });
  const userName = meQuery.data?.fullName ?? 'Usuário';

  const postQuery = useFetch(
    () => api.get(`post/${postId}`).then((response) => response.data),
    [loggedId, postId],
    { enabled: !!loggedId },
  );
  const post: PostInterface | null = postQuery.data ?? null;
  const recipientId = post?.userId ?? '';
  const idGroup = post?.groupId ?? '';

  const postUserQuery = useFetch(
    async () => {
      const responseUser = await api.get(`/user/${post?.userId}`);
      const userData: User = responseUser.data;
      const image = await getUserProfileImage(userData.id);
      return { user: userData, image };
    },
    [loggedId, post?.userId],
    {
      enabled: !!loggedId && !!post?.userId,
      onError: (_error, { hadData }) => {
        if (hadData) {
          Toast.show({
            type: 'error',
            text1: 'Erro inesperado',
            text2: 'Não foi possível atualizar o usuário ou a imagem do post.',
          });
        }
      },
    },
  );
  const postUser = postUserQuery.data?.user ?? null;
  const postUserImage = postUserQuery.data?.image ?? defaultAvatar;

  const archivesQuery = useFetch(
    () => api.get(`archives/post/${postId}`).then((response) => response.data),
    [loggedId, postId],
    {
      enabled: !!loggedId,
      onError: (_error, { hadData }) => {
        if (hadData) {
          Toast.show({
            type: 'error',
            text1: 'Erro ao buscar arquivos da publicação. Tente novamente mais tarde.',
          });
        }
      },
    },
  );
  const postArchives: Archive[] = Array.isArray(archivesQuery.data) ? archivesQuery.data : [];

  const commentUserIds = post?.Comment?.length
    ? [...new Set(post.Comment.map((comment) => comment.userId))]
    : [];
  const commentUsersQuery = useFetch(
    async () => {
      const usersData = await Promise.all(
        commentUserIds.map(async (userId) => {
          const response = await api.get(`/user/${userId}`);
          return { userId, data: response.data };
        }),
      );
      return usersData.reduce<Record<string, User>>((acc, user) => {
        acc[user.userId] = user.data;
        return acc;
      }, {});
    },
    [loggedId, post?.Comment],
    {
      enabled: !!loggedId && commentUserIds.length > 0,
      onError: (_error, { hadData }) => {
        if (hadData) {
          Toast.show({
            type: 'error',
            text1: 'Erro ao buscar usuários dos comentários. Tente novamente mais tarde.',
          });
        }
      },
    },
  );
  const commentUsers = commentUsersQuery.data ?? {};
  const postDate = post?.createdAt ? new Date(post.createdAt) : null;
  const formattedDate =
    postDate && isValid(postDate)
      ? format(postDate, "dd 'de' MMM'.', HH:mm", { locale: ptBR })
      : '';

  const getUserProfileImage = async (userId: string): Promise<any> => {
    if (!loggedId) {
      return defaultAvatar;
    }
    try {
      const response = await api.get(`/user/${userId}/profile-picture`, {
        responseType: 'arraybuffer',
      });
      const imageStr = Buffer.from(response.data, 'binary').toString('base64');
      const imageUri = `data:image/jpeg;base64,${imageStr}`;
      return { uri: imageUri };
    } catch (error) {
      return defaultAvatar;
    }
  };

  // Formulário de comentário etc.
  const {
    control,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm({});
  const onSubmit = async (data: any) => {
    try {
      await api.post('/comment', {
        content: data.input,
        postId,
      });

      const groupResponse = await api.get(`/group/${idGroup}`);
      if (post && post.userId !== loggedId) {
        const groupNameFromApi = groupResponse.data.name;
        await api.post('/notifications', {
          senderName: userName,
          recipientId,
          groupName: groupNameFromApi,
          type: 'COMMENT',
          body: '',
        });
      }
      Toast.show({
        type: 'success',
        text1: 'Comentário enviado com sucesso!',
      });
      setTimeout(() => {
        navigation.replace('Post', { postId });
      }, 500);
    } catch (error) {
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

  const { savedPostIds, savePost, unsavePost } = useSavedPosts();
  const isSaved = savedPostIds.has(postId);

  const handleSavePress = async () => {
    if (isSaved) {
      await unsavePost(postId);
      return;
    }
    if (post?.userId && loggedId && post.userId === loggedId) {
      Toast.show({
        type: 'error',
        text1: 'Você não pode salvar sua própria publicação.',
      });
      return;
    }
    await savePost(postId, post?.userId);
  };

  const createDeepLink = () => `manamano://post/${postId}`;

  const onShare = async () => {
    const deepLink = createDeepLink();
    try {
      await Share.share({
        message: `Confira este post: ${deepLink}`,
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Erro inesperado',
        text2: 'Não foi possível compartilhar o post.',
      });
    }
  };

  return (
    <ScreenWithHeader
      headerProps={{
        font: 'inter-bold',
        text: 'Publicação',
        icon: <DotsMenuIcon width="30px" height="30px" />,
        onPress: () => setModalOptions(!modalOptions),
      }}>
      <View
        style={{
          backgroundColor: '#f2f6fa',
          height: '100%',
          display: loggedId ? 'flex' : 'none',
        }}>
        {modalOptions ? (
          <ModalOptions
            postId={postId}
            fixed={false}
            handleSavePress={handleSavePress}
            onShare={onShare}
            onPressFix={() => {}}
          />
        ) : (
          ''
        )}
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={{ backgroundColor: '#f2f6fa', flex: 1 }}
          refreshControl={
            <RefreshControl
              refreshing={postQuery.refreshing}
              onRefresh={() => {
                postQuery.refresh();
                archivesQuery.refresh();
                commentUsersQuery.refresh();
              }}
              colors={['#EF4036']}
              tintColor="#EF4036"
            />
          }>
          {postQuery.loading && !post ? (
            <ActivityIndicator size="large" color="#EF4036" style={{ marginTop: 40 }} />
          ) : !!postQuery.error && !post ? (
            <ErrorState
              inline
              text="Não foi possível carregar a publicação."
              onRetry={postQuery.refetch}
            />
          ) : (
            <PostContainer>
              <PostUpperPart>
                <ProfileImage source={postUserImage} />
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
                    const commentDate = format(new Date(item.createdAt), "dd 'de' MMM'.', HH:mm", {
                      locale: ptBR,
                    });
                    const commentUser = commentUsers[item.userId];
                    return (
                      <CommentCard
                        key={item.id}
                        fullName={commentUser?.fullName || 'Usuário desconhecido'}
                        input={item.content}
                        createdAt={commentDate}
                        userId={item.userId}
                      />
                    );
                  })
                ) : (
                  <View />
                )}
              </CommentsContainer>
            </PostContainer>
          )}
        </ScrollView>
      </View>
    </ScreenWithHeader>
  );
}
