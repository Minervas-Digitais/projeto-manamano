/* eslint-disable global-require */
import React from 'react';
import { useFonts } from 'expo-font';
import { Pressable, View } from 'react-native';
import {
  AttachmentArchiveIcon,
  AttachmentContainer,
  AttachmentLinkIcon,
  AttachmentText,
  AttachmentType,
  VerticalSeparator,
} from './PostAttachmentStyle';

export default function PostAttachment({ archive, text }: any) {
  const linkIcon = require('../../assets/link-icon.svg');
  const archiveIcon = require('../../assets/archive-icon.svg');
  const [fontsLoaded] = useFonts({
    'inter-semibold': require('../../fonts/Inter-SemiBold.ttf'),
    'inter-regular': require('../../fonts/Inter-Regular.ttf'),
  });
  if (!fontsLoaded) {
    return undefined;
  }
  return (
    <Pressable
      onPress={() => {
        alert('link');
      }}>
      <AttachmentContainer>
        {archive ? (
          <AttachmentArchiveIcon source={archiveIcon} />
        ) : (
          <AttachmentLinkIcon source={linkIcon} />
        )}
        <VerticalSeparator />
        <View style={{ flexDirection: 'column' }}>
          <AttachmentText font="inter-semibold" size="12px">
            {text}
          </AttachmentText>

          {archive ? (
            <AttachmentType font="inter-regular">Arquivo</AttachmentType>
          ) : (
            <AttachmentType font="inter-regular">Link</AttachmentType>
          )}
        </View>
      </AttachmentContainer>
    </Pressable>
  );
}
