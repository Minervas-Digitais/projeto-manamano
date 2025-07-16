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

// Import SVGs and images
import ShareIcon from '../../assets/share-icon.svg';
import SaveIcon from '../../assets/save-icon.svg';
import SavedIcon from '../../assets/saved-icon.svg';
import CommentIcon from '../../assets/comment-icon.svg';
import FixIcon from '../../assets/fix-icon.svg';
import DotsMenuIcon from '../../assets/dotsMenu-icon.svg';

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
            <TouchableOpacity onPress={onShare}>
              <ShareIcon width={20} height={20} />
            </TouchableOpacity>
          ) : (
            <View />
          )}
          {save ? (
            <TouchableOpacity>
              <SaveIcon width={20} height={20} />
            </TouchableOpacity>
          ) : (
            <View />
          )}
          {saved ? (
            <TouchableOpacity>
              <SavedIcon width={20} height={20} />
            </TouchableOpacity>
          ) : (
            <View />
          )}
          {dotsMenu ? (
            <TouchableOpacity onPress={() => setModalOptions(!modalOptions)}>
              <DotsMenuIcon width={20} height={20} />
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
      <GroupDataText
        numberOfLines={4}
        font="inter-regular"
        color="#515151"
        size="12px"
        style={{ textAlign: 'justify' }}>
        {postContent}
      </GroupDataText>
      <PostCardSpaceBetween style={{ alignItems: 'flex-end', paddingTop: '15px' }}>
        <PostCardIcons>
          <TouchableOpacity>
            <CommentIcon width={15} height={15} />
          </TouchableOpacity>
          <GroupDataText font="inter-bold" color="#160E47" size="10px">
            {numComments}
          </GroupDataText>
          {fix ? (
            <TouchableOpacity>
              <FixIcon width={15} height={15} />
            </TouchableOpacity>
          ) : (
            ''
          )}
        </PostCardIcons>
        <GroupDataText
          font="inter-regular"
          color="#515151"
          size="10px"
          style={{ marginRight: '8px' }}>
          {date}
        </GroupDataText>
      </PostCardSpaceBetween>
    </PostCardContainer>
  );
}
