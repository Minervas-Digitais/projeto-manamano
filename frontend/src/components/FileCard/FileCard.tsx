/* eslint-disable no-nested-ternary */
/* eslint-disable global-require */
import React from 'react';
import { useFonts } from 'expo-font';
import { Image, Linking } from 'react-native';
import { FileCardContainer, FileCardImageContainer, FileCardInfoContainer } from './FileCardStyle';
import { GroupDataText } from '../../pages/GroupData/GroupDataStyle';

export default function FileCard({ info, type }: any) {
  const link = require('../../assets/link-icon.svg');
  const file = require('../../assets/file-icon.svg');

  const [fontsLoaded] = useFonts({
    'inter-bold': require('../../fonts/Inter-Bold.ttf'),
  });
  if (!fontsLoaded) {
    return undefined;
  }

  return (
    <FileCardContainer
      onPress={() => {
        Linking.openURL(info);
      }}
    >
      <FileCardInfoContainer>
        {type === 'Links' ? (
          <FileCardImageContainer>
            <Image style={{ width: '30px', height: '30px' }} source={link} />
          </FileCardImageContainer>
        ) : type === 'Documentos' ? (
          <FileCardImageContainer>
            <Image style={{ width: '30px', height: '30px' }} source={file} />
          </FileCardImageContainer>
        ) : (
          ''
        )}

        <GroupDataText font="inter-bold" color="black" size="13px" numberOfLines={1}>
          {info}
        </GroupDataText>
      </FileCardInfoContainer>
    </FileCardContainer>
  );
}
