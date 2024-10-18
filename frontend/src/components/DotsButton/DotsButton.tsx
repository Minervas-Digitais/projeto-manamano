/* eslint-disable global-require */
import React, { useState } from 'react';
import { TouchableOpacity, View } from 'react-native';
import { PostCardImage } from '../PostCard/PostCardStyle';
import ModalOptions from '../ModalOptions/ModalOptions';

export default function DotsButton() {
  const [modalOptions, setModalOptions] = useState(false);
  const dotsMenuIcon = require('../../assets/dotsMenu-icon.svg');
  return (
    <View>
      {modalOptions ? <ModalOptions /> : ''}
      <TouchableOpacity onPress={() => setModalOptions(!modalOptions)}>
        <PostCardImage width="30px" height="30px" source={dotsMenuIcon} />
      </TouchableOpacity>
    </View>
  );
}
