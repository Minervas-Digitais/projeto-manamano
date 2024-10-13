/* eslint-disable global-require */
import React, { useState } from 'react';
import { useFonts } from 'expo-font';
import { TouchableOpacity, View } from 'react-native';
import {
  PostCardContainer,
  PostCardIcons,
  PostCardImage,
  PostCardSpaceBetween,
  PostCardImageUser,
  PostCardTag,
} from './PostCardStyle';
import { GroupDataText } from '../../pages/GroupData/GroupDataStyle';
import ModalOptions from '../ModalOptions/ModalOptions';

export default function PostCard({
  nameUser,
  imageUser,
  postContent,
  numComments,
  date,
  originGroup,
  share,
  save,
  dotsMenu,
  tag,
  fix,
}: any) {
  const shareIcon = require('../../assets/share-icon.svg');
  const saveIcon = require('../../assets/save-icon.svg');
  const commentIcon = require('../../assets/comment-icon.svg');
  const fixIcon = require('../../assets/fix-icon.svg');
  const dotsMenuIcon = require('../../assets/dotsMenu-icon.svg');
  const [modalOptions, setModalOptions] = useState(false);

  const [fontsLoaded] = useFonts({
    'inter-bold': require('../../fonts/Inter-Bold.ttf'),
    'inter-regular': require('../../fonts/Inter-Regular.ttf'),
  });
  if (!fontsLoaded) {
    return undefined;
  }
  return (
    <PostCardContainer shadowColor={fix}>
      {modalOptions ? <ModalOptions /> : ''}
      <PostCardSpaceBetween style={{ position: 'relative' }}>
        {tag ? (
          <PostCardTag>
            <GroupDataText font="inter-regular" color="#fff" size="7px">
              Postado no Grupo
            </GroupDataText>
            <GroupDataText numberOfLines={1} font="inter-bold" color="#fff" size="8px">
              {originGroup}
            </GroupDataText>
          </PostCardTag>
        ) : (
          <View style={{ paddingTop: '14px' }} />
        )}
        <PostCardIcons
          style={{
            flex: 1,
            justifyContent: 'flex-end',
            position: 'absolute',
            paddingTop: '10px',
            right: 0,
          }}>
          {share ? (
            <TouchableOpacity>
              <PostCardImage width="20px" height="20px" source={shareIcon} />
            </TouchableOpacity>
          ) : (
            <View />
          )}
          {save ? (
            <TouchableOpacity>
              <PostCardImage width="20px" height="20px" source={saveIcon} />
            </TouchableOpacity>
          ) : (
            <View />
          )}
          {dotsMenu ? (
            <TouchableOpacity onPress={() => setModalOptions(!modalOptions)}>
              <PostCardImage width="20px" height="20px" source={dotsMenuIcon} />
            </TouchableOpacity>
          ) : (
            <View />
          )}
        </PostCardIcons>
      </PostCardSpaceBetween>

      <PostCardSpaceBetween>
        <PostCardIcons>
          <PostCardImageUser source={imageUser} />
          <GroupDataText font="inter-bold" color="#000000" size="12px">
            {nameUser}
          </GroupDataText>
        </PostCardIcons>
      </PostCardSpaceBetween>
      <GroupDataText numberOfLines={4} font="inter-regular" color="#515151" size="12px">
        {postContent}
      </GroupDataText>
      <PostCardSpaceBetween style={{ alignItems: 'flex-end', paddingTop: '15px' }}>
        <PostCardIcons>
          <TouchableOpacity>
            <PostCardImage width="15px" height="15px" source={commentIcon} />
          </TouchableOpacity>
          <GroupDataText font="inter-bold" color="#160E47" size="10px">
            {numComments}
          </GroupDataText>
          {fix ? (
            <TouchableOpacity>
              <PostCardImage width="15px" height="15px" source={fixIcon} />
            </TouchableOpacity>
          ) : (
            ''
          )}
        </PostCardIcons>
        <GroupDataText
          font="inter-regular"
          color="#515151"
          size="10px"
          style={{ marginRight: '8px' }}
        >
          {date}
        </GroupDataText>
      </PostCardSpaceBetween>
    </PostCardContainer>
  );
}
