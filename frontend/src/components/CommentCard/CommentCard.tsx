/* eslint-disable global-require */
import React from 'react';
import { useFonts } from 'expo-font';
import { View } from 'react-native';
import { PostDate, PostUpperPart, ProfileImage, ProfileName } from '../../pages/Post/PostStyle';
import { CommentText, CommentTextContainer } from './CommentCardStyle';

export default function CommentCard({ fullName, createdAt, input }: any) {
  const profileImage = require('../../assets/test-profile-icon.png');
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
