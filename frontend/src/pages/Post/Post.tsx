/* eslint-disable global-require */
import { useFonts } from 'expo-font';
import { Controller, useForm } from 'react-hook-form';
import { Pressable, ScrollView, View } from 'react-native';
import { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
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
import DotsButton from '../../components/DotsButton/DotsButton';

export default function Post() {
  const [isFocused, setIsFocused] = useState(false);
  const profileImage = require('../../assets/test-profile-icon.png');
  const fakePost: any = [
    {
      input:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris egestas urna vLorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris egestas urna vel nisi dictum, a accumsan libero imperdiet. Nullam lacinia conLorem ipsum dolor sit amet, consecte.',
      createdAt: '2024-05-08T21:33:30Z',
      fullName: 'Jorgelina Silva',
    },
  ];
  const fakeComment: any = [
    { fullName: 'Jorgelina Silva', createdAt: '2024-05-08T21:33:30Z', input: 'Falou e disse!' },
    { fullName: 'Jorgelina Silva', createdAt: '2024-05-08T21:33:30Z', input: 'Falou e disse!' },
    { fullName: 'Jorgelina Silva', createdAt: '2024-05-08T21:33:30Z', input: 'Falou e disse!' },
    { fullName: 'Jorgelina Silva', createdAt: '2024-07-18T21:33:30Z', input: 'Falou e disse!' },
    { fullName: 'Jorgelina Silva', createdAt: '2024-05-08T21:33:30Z', input: 'Falou e disse!' },
  ];
  const postDate = new Date(fakePost[0].createdAt);
  const formattedDate = format(postDate, "dd 'de' MMM'.', HH:mm", { locale: ptBR });
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
    // eslint-disable-next-line global-require
    'inter-bold': require('../../fonts/Inter-Bold.ttf'),
    'inter-regular': require('../../fonts/Inter-Regular.ttf'),
    'inter-semibold': require('../../fonts/Inter-SemiBold.ttf'),
  });
  if (!fontsLoaded) {
    return undefined;
  }
  return (
    <ScrollView showsVerticalScrollIndicator={false} style={{ backgroundColor: '#f2f6fa' }}>
      <HeaderCustom font="inter-bold" text="Publicação" headerButton={<DotsButton />} icon />
      <PostContainer>
        <PostUpperPart>
          <ProfileImage source={profileImage} />
          <ProfileName font="inter-bold">{fakePost[0].fullName}</ProfileName>
          <PostDate font="inter-semibold">{formattedDate}</PostDate>
        </PostUpperPart>
        <PostText font="inter-regular">{fakePost[0].input}</PostText>
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
          {fakeComment?.length > 0 ? (
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
function setModalOptions(arg0: boolean): void {
  throw new Error('Function not implemented.');
}

