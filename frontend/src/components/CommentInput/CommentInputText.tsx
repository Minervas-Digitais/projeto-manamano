/* eslint-disable global-require */
import React from 'react';
import { Image, Pressable } from 'react-native';
import {
  CommentInputText,
  CommentInputTextFocused,
  CommentInputTextContainer,
  CommentInputContainer,
  CommentInputContainerFocused,
  ButtonContainer,
  LargerProfileImage,
} from './CommentInputTextStyle';

export default function CommentInputTextCustom({
  onChangeText,
  value,
  isFocused,
  onPressSubmit,
  onPressLink,
  onBlur,
}: any) {
  const profileImage = require('../../assets/test-profile-icon.png');
  const sendButton = require('../../assets/submit-comment.svg');
  const linkIcon = require('../../assets/comment-link-icon.svg');
  return (
    <CommentInputTextContainer>
      <LargerProfileImage source={profileImage} />
      {isFocused ? (
        <CommentInputContainerFocused>
          <CommentInputTextFocused
            maxLength={255}
            multiline
            onChangeText={onChangeText}
            value={value}
            onBlur={onBlur}
            autoFocus
          />
          <ButtonContainer>
            <Pressable onPress={onPressLink}>
              <Image source={linkIcon} />
            </Pressable>
            <Pressable onPress={onPressSubmit}>
              <Image source={sendButton} />
            </Pressable>
          </ButtonContainer>
        </CommentInputContainerFocused>
      ) : (
        <CommentInputContainer>
          <CommentInputText
            multiline
            onChangeText={onChangeText}
            value={value}
            placeholder="Deixe um comentário"
          />
        </CommentInputContainer>
      )}
    </CommentInputTextContainer>
  );
}
