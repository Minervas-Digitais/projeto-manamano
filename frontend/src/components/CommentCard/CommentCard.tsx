/* eslint-disable global-require */
import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { useFonts } from 'expo-font';
import { PostDate, PostUpperPart, ProfileImage, ProfileName } from '../../pages/Post/PostStyle';
import { CommentText, CommentTextContainer } from './CommentCardStyle';
import api from '../../services/api';
import { storage } from '../../pages/SignIn/SignIn';
import { Buffer } from 'buffer';

const defaultAvatar = require('../../assets/user-profile.png');

interface CommentCardProps {
  fullName: string;
  createdAt: string;
  input: string;
  userId: string;
}

export default function CommentCard({ fullName, createdAt, input, userId }: CommentCardProps) {
  const [profileImage, setProfileImage] = useState<any>(defaultAvatar);

  const [fontsLoaded] = useFonts({
    // eslint-disable-next-line global-require
    'inter-bold': require('../../fonts/Inter-Bold.ttf'),
    'inter-regular': require('../../fonts/Inter-Regular.ttf'),
    'inter-semibold': require('../../fonts/Inter-SemiBold.ttf'),
  });
  if (!fontsLoaded) {
    return undefined;
  }

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    const fetchProfileImage = async () => {
      const token = storage.getString('accessToken');
      if (!token || !userId) return;

      try {
        const response = await api.get(`/user/${userId}/profile-picture`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          responseType: 'arraybuffer',
        });

        const imageStr = Buffer.from(response.data, 'binary').toString('base64');
        const imageUri = `data:image/jpeg;base64,${imageStr}`;
        setProfileImage({ uri: imageUri });
      } catch (error) {
        console.error('Erro ao buscar imagem de perfil do comentário:', error);
        setProfileImage(defaultAvatar);
      }
    };

    fetchProfileImage();
  }, [userId]);

  if (!fontsLoaded) return null;

  return (
    <View style={{ backgroundColor: '#f2f6fa' }}>
      <PostUpperPart>
        <ProfileImage source={profileImage} />
        <ProfileName font="inter-bold">{fullName}</ProfileName>
        <PostDate font="inter-semibold">{createdAt}</PostDate>
      </PostUpperPart>
      <CommentTextContainer>
        <CommentText font="inter-regular">{input}</CommentText>
      </CommentTextContainer>
    </View>
  );
}
