/* eslint-disable global-require */
import React, { useState, useEffect } from 'react';
import { useFonts } from 'expo-font';
import { Share, TouchableOpacity, View } from 'react-native';
import { ptBR } from 'date-fns/locale';
import { format, isValid } from 'date-fns';
import {
  PostCardContainer,
  PostCardIcons,
  PostCardSpaceBetween,
  PostCardImageUser,
  PostCardTag,
} from './PostCardStyle';
import { GroupDataText } from '../../pages/GroupData/GroupDataStyle';
import ModalOptions from '../ModalOptions/ModalOptions';
import ShareIcon from '../../assets/share-icon.svg';
import SaveIcon from '../../assets/save-icon.svg';
import SavedIcon from '../../assets/saved-icon.svg';
import CommentIcon from '../../assets/comment-icon.svg';
import FixIcon from '../../assets/fix-icon.svg';
import DotsMenuIcon from '../../assets/dotsMenu-icon.svg';
import { useSavedPosts } from '../../context/SavedPostsContext';

const defaultAvatar = require('../../assets/user-profile.png');

export default function PostCard({
  userId,
  getUserProfileImage,
  nameUser,
  postContent,
  numComments,
  date,
  originGroup,
  share,
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
  const [userProfile, setUserProfile] = useState(defaultAvatar);

  const { savedPostIds, savePost, unsavePost } = useSavedPosts();
  const isSaved = savedPostIds.has(postId);

  const handleSavePress = () => {
    if (isSaved) unsavePost(postId);
    else savePost(postId);
  };

  useEffect(() => {
    let isMounted = true;

    async function loadImage() {
      if (!getUserProfileImage || !userId) return;

      try {
        const img = await getUserProfileImage(userId);
        if (isMounted && img) setUserProfile(img);
      } catch (error) {
        if (isMounted) setUserProfile(defaultAvatar);
      }
    }

    loadImage();

    return () => {
      isMounted = false;
    };
  }, [userId, getUserProfileImage]);

  const postDate = date ? new Date(date) : null;

  const formattedDate =
    postDate && isValid(postDate)
      ? format(postDate, "dd 'de' MMM'.', HH:mm", { locale: ptBR })
      : '';

  const [fontsLoaded] = useFonts({
    'inter-bold': require('../../fonts/Inter-Bold.ttf'),
    'inter-regular': require('../../fonts/Inter-Regular.ttf'),
  });

  if (!fontsLoaded) {
    return undefined;
  }

  return (
    <PostCardContainer shadowColor={fix} onPress={onPressPost}>
      {modalOptions ? (
        <ModalOptions
          onShare={onShare}
          onPressFix={onPressFix}
          handleSavePress={handleSavePress}
          fixed={fix}
          postId={postId}
        />
      ) : (
        ''
      )}
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
              <ShareIcon width="20px" height="20px" />
            </TouchableOpacity>
          ) : (
            <View />
          )}
          <TouchableOpacity onPress={handleSavePress}>
            {isSaved ? (
              <SavedIcon width="20px" height="20px" />
            ) : (
              <SaveIcon width="20px" height="20px" />
            )}
          </TouchableOpacity>
          {dotsMenu ? (
            <TouchableOpacity onPress={() => setModalOptions(!modalOptions)}>
              <DotsMenuIcon width="20px" height="20px" />
            </TouchableOpacity>
          ) : (
            <View />
          )}
        </PostCardIcons>
      </PostCardSpaceBetween>

      <PostCardSpaceBetween>
        <PostCardIcons>
          <PostCardImageUser source={userProfile} />
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
      <PostCardSpaceBetween style={{ alignItems: 'flex-end', paddingTop: 15 }}>
        <PostCardIcons>
          <TouchableOpacity>
            <CommentIcon width="15px" height="15px" />
          </TouchableOpacity>
          <GroupDataText font="inter-bold" color="#160E47" size="10px">
            {numComments}
          </GroupDataText>
          {fix ? (
            <TouchableOpacity>
              <FixIcon width="15px" height="15px" />
            </TouchableOpacity>
          ) : (
            ''
          )}
        </PostCardIcons>
        <GroupDataText font="inter-regular" color="#515151" size="10px" style={{ marginRight: 8 }}>
          {formattedDate}
        </GroupDataText>
      </PostCardSpaceBetween>
    </PostCardContainer>
  );
}
