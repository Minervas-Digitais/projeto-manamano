/* eslint-disable react/jsx-closing-bracket-location */
/* eslint-disable no-alert */
/* eslint-disable global-require */
import React from 'react';
import { useFonts } from 'expo-font';
import ShareIcon from '../../assets/share-icon.svg';
import Fix from '../../assets/fix-blue-icon.svg';
import Save from '../../assets/save-icon.svg';
import SavedIcon from '../../assets/saved-icon.svg';
import {
  ModalOptionsContainer,
  ModalOptionsOptionsContainer,
  ModalOptionsOptionsText,
} from './ModalOptionsStyle';
import { useSavedPosts } from '../../context/SavedPostsContext';

type ModalOptionsProps = {
  onShare: () => void;
  onPressFix: () => void;
  fixed: boolean;
  handleSavePress: () => void;
  postId: string;
};

export default function ModalOptions({
  onShare,
  onPressFix,
  fixed,
  handleSavePress,
  postId,
}: ModalOptionsProps) {
  const [fontsLoaded] = useFonts({
    'inter-regular': require('../../fonts/Inter-Regular.ttf'),
  });

  const { savedPostIds } = useSavedPosts();
  const isSaved = savedPostIds.has(postId);

  if (!fontsLoaded) {
    return undefined;
  }

  return (
    <ModalOptionsContainer>
      <ModalOptionsOptionsContainer onPress={onShare}>
        <ShareIcon />
        <ModalOptionsOptionsText font="inter-regular" color="#515151" size="13px">
          Compartilhar
        </ModalOptionsOptionsText>
      </ModalOptionsOptionsContainer>

      <ModalOptionsOptionsContainer
        onPress={(e) => {
          e.stopPropagation();
          handleSavePress();
        }}>
        {isSaved ? <SavedIcon /> : <Save />}
        <ModalOptionsOptionsText font="inter-regular" color="#515151" size="13px">
          {isSaved ? 'Salvo' : 'Salvar'}
        </ModalOptionsOptionsText>
      </ModalOptionsOptionsContainer>

      {fixed ? (
        <ModalOptionsOptionsContainer>
          <Fix />
          <ModalOptionsOptionsText
            font="inter-regular"
            color="#515151"
            size="13px"
            onPress={onPressFix}>
            Desfixar
          </ModalOptionsOptionsText>
        </ModalOptionsOptionsContainer>
      ) : (
        <ModalOptionsOptionsContainer>
          <Fix />
          <ModalOptionsOptionsText
            font="inter-regular"
            color="#515151"
            size="13px"
            onPress={onPressFix}>
            Fixar
          </ModalOptionsOptionsText>
        </ModalOptionsOptionsContainer>
      )}
    </ModalOptionsContainer>
  );
}
