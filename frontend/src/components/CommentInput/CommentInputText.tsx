/* eslint-disable global-require */
import React, { useEffect, useState } from 'react';
import { Pressable } from 'react-native';
import { Buffer } from 'buffer';
import { AxiosError } from 'axios';
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
import api from '../../services/api';
import { useAuth } from '../../context/auth/useAuth';

export default function CommentInputTextCustom({
  onChangeText,
  value,
  isFocused,
  onPressSubmit,
  onPressLink,
  onBlur,
}: any) {
  const defaultAvatar = require('../../assets/user-profile.png');
  const [profileImage, setProfileImage] = useState<any>(defaultAvatar);
  const { accessToken, loggedId } = useAuth();

  useEffect(() => {
    const fetchProfileImage = async () => {
      if (!loggedId || !accessToken) {
        setProfileImage(defaultAvatar);
        return;
      }

      try {
        const response = await api.get(`/user/${loggedId}/profile-picture`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          responseType: 'arraybuffer',
        });

        const imageBase64 = Buffer.from(response.data, 'binary').toString('base64');
        const imageUri = `data:image/jpeg;base64,${imageBase64}`;
        setProfileImage({ uri: imageUri });
      } catch (error) {
        console.error('Erro ao carregar imagem de perfil do input:', error);
        setProfileImage(defaultAvatar);
      }
    };

    fetchProfileImage();
  }, [defaultAvatar]);

  return (
    <CommentInputTextContainer>
      <LargerProfileImage source={profileImage} />
      {isFocused ? (
        <CommentInputContainerFocused>
          <CommentInputTextFocused
            testID="input-comentario"
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
            <Pressable onPress={onPressSubmit} testID="enviar-comentario">
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
