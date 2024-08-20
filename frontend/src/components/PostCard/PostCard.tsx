/* eslint-disable global-require */
import React from 'react';
import { useFonts } from 'expo-font';
import {
  PostCardContainer,
  PostCardIcons,
  PostCardImage,
  PostCardSpaceBetween,
  PostCardImageUser,
  PostCardTag,
} from './PostCardStyle';
import { GroupDataText } from '../../pages/GroupData/GroupDataStyle';

export default function PostCard({
  nameUser,
  imageUser,
  postContent,
  numComments,
  date,
  originGroup,
}: any) {
  const shareIcon = require('../../assets/share-icon.svg');
  const saveIcon = require('../../assets/save-icon.svg');
  const commentIcon = require('../../assets/comment-icon.svg');

  const [fontsLoaded] = useFonts({
    'inter-bold': require('../../fonts/Inter-Bold.ttf'),
    'inter-regular': require('../../fonts/Inter-Regular.ttf'),
  });
  if (!fontsLoaded) {
    return undefined;
  }
  return (
    <PostCardContainer>
      <PostCardTag>
        <GroupDataText font="inter-regular" color="#fff" size="7px">
          Postado no Grupo
        </GroupDataText>
        <GroupDataText numberOfLines={1} font="inter-bold" color="#fff" size="8px">
          {originGroup}
        </GroupDataText>
      </PostCardTag>
      <PostCardSpaceBetween>
        <PostCardIcons>
          <PostCardImageUser source={imageUser} />
          <GroupDataText font="inter-bold" color="#000000" size="12px">
            {nameUser}
          </GroupDataText>
        </PostCardIcons>
        <PostCardIcons>
          <PostCardImage width="20px" height="20px" source={shareIcon} />
          <PostCardImage width="20px" height="20px" source={saveIcon} />
        </PostCardIcons>
      </PostCardSpaceBetween>
      <GroupDataText numberOfLines={4} font="inter-regular" color="#515151" size="12px">
        {postContent}
      </GroupDataText>
      <PostCardSpaceBetween style={{ alignItems: 'flex-end', paddingTop: '15px' }}>
        <PostCardIcons>
          <PostCardImage width="15px" height="15px" source={commentIcon} />
          <GroupDataText font="inter-bold" color="#160E47" size="10px">
            {numComments}
          </GroupDataText>
        </PostCardIcons>
        <GroupDataText font="inter-regular" color="#515151" size="10px">
          {date}
        </GroupDataText>
      </PostCardSpaceBetween>
    </PostCardContainer>
  );
}
