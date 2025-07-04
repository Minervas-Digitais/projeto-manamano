/* eslint-disable global-require */
import React, { useState } from 'react';
import { useFonts } from 'expo-font';
import { Share, TouchableOpacity, View } from 'react-native';
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
import api from '../../services/api';
import { storage } from '../../pages/SignIn/SignIn';

export default function PostCard({
  nameUser,
  imageUser,
  postContent,
  numComments,
  date,
  originGroup,
  share,
  save,
  saved,
  dotsMenu,
  tag,
  fix,
  postId,
  onPressPost,
  onPressFix,
}: any) {
  const createDeepLink = () => `manamano://post/${postId}`;
  const onShare = async () => {
    const deepLink = createDeepLink();
    try {
      await Share.share({
        message: `Confira este post: ${deepLink}`,
      });
    } catch (error) {
      console.error('Erro ao compartilhar:', error);
    }
  };
  const shareIcon = require('../../assets/share-icon.svg');
  const saveIcon = require('../../assets/save-icon.svg');
  const savedIcon = require('../../assets/saved-icon.svg');
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
    <PostCardContainer shadowColor={fix} onPress={onPressPost}>
      {modalOptions ? <ModalOptions onShare={onShare} onPressFix={onPressFix} fixed={fix} /> : ''}
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
          <View style={{ paddingTop: 14 }} />
        )}
        <PostCardIcons
          style={{
            flex: 1,
            justifyContent: 'flex-end',
            position: 'absolute',
            paddingTop: 10,
            right: 0,
          }}>
          {share ? (
            <TouchableOpacity onPress={onShare}>
                <PostCardImage width={20} height={20} source={shareIcon} />
            </TouchableOpacity>
          ) : (
            <View />
          )}
          {save ? (
            <TouchableOpacity>
              <PostCardImage width={20} height={20} source={saveIcon} />
            </TouchableOpacity>
          ) : (
            <View />
          )}
          {saved ? (
            <TouchableOpacity>
              <PostCardImage width={20} height={20} source={savedIcon} />
            </TouchableOpacity>
          ) : (
            <View />
          )}
          {dotsMenu ? (
            <TouchableOpacity onPress={() => setModalOptions(!modalOptions)}>
              <PostCardImage width={20} height={20} source={dotsMenuIcon} />
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
      <PostCardSpaceBetween style={{ alignItems: 'flex-end', paddingTop: 15 }}>
        <PostCardIcons>
          <TouchableOpacity>
            <PostCardImage width={20} height={20} source={commentIcon} />
          </TouchableOpacity>
          <GroupDataText font="inter-bold" color="#160E47" size="10px">
            {numComments}
          </GroupDataText>
          {fix ? (
            <TouchableOpacity>
              <PostCardImage width={20} height={20} source={fixIcon} />
            </TouchableOpacity>
          ) : (
            ''
          )}
        </PostCardIcons>
        <GroupDataText
          font="inter-regular"
          color="#515151"
          size="10px"
          style={{ marginRight: 8 }}
        >
          {date}
        </GroupDataText>
      </PostCardSpaceBetween>
    </PostCardContainer>
  );
}
