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
import SendButton from '../../assets/submit-comment.svg';
import LinkIcon from '../../assets/comment-link-icon.svg';

export default function CommentInputTextCustom({
  onChangeText,
  value,
  isFocused,
  onPressSubmit,
  onPressLink,
  onBlur,
}: any) {
  const profileImage = require('../../assets/test-profile-icon.png');
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
              <LinkIcon />
            </Pressable>
            <Pressable onPress={onPressSubmit}>
              <SendButton />
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
            editable={false}
          />
        </CommentInputContainer>
      )}
    </CommentInputTextContainer>
  );
}
