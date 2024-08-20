/* eslint-disable global-require */
import React from 'react';
import { useFonts } from 'expo-font';
import {
  CommentCardContainer,
  CommentCardIcons,
  CommentCardImage,
  CommentCardSpaceBetween,
  CommentCardImageUser,
  CommentCardTag,
} from './PostCardStyle';
import { GroupDataText } from '../../pages/GroupData/GroupDataStyle';

export default function CommentCard({
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
    <CommentCardContainer>
      <CommentCardTag>
        <GroupDataText font="inter-regular" color="#fff" size="7px">
          Postado no Grupo
        </GroupDataText>
        <GroupDataText numberOfLines={1} font="inter-bold" color="#fff" size="8px">
          {originGroup}
        </GroupDataText>
      </CommentCardTag>
      <CommentCardSpaceBetween>
        <CommentCardIcons>
          <CommentCardImageUser source={imageUser} />
          <GroupDataText font="inter-bold" color="#000000" size="12px">
            {nameUser}
          </GroupDataText>
        </CommentCardIcons>
        <CommentCardIcons>
          <CommentCardImage width="20px" height="20px" source={shareIcon} />
          <CommentCardImage width="20px" height="20px" source={saveIcon} />
        </CommentCardIcons>
      </CommentCardSpaceBetween>
      <GroupDataText numberOfLines={4} font="inter-regular" color="#515151" size="12px">
        {postContent}
      </GroupDataText>
      <CommentCardSpaceBetween style={{ alignItems: 'flex-end', paddingTop: '15px' }}>
        <CommentCardIcons>
          <CommentCardImage width="15px" height="15px" source={commentIcon} />
          <GroupDataText font="inter-bold" color="#160E47" size="10px">
            {numComments}
          </GroupDataText>
        </CommentCardIcons>
        <GroupDataText font="inter-regular" color="#515151" size="10px">
          {date}
        </GroupDataText>
      </CommentCardSpaceBetween>
    </CommentCardContainer>
  );
}
