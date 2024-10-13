/* eslint-disable no-alert */
/* eslint-disable no-unneeded-ternary */
/* eslint-disable global-require */
import React, { useState } from 'react';
import { useFonts } from 'expo-font';
import { CategoryButtonContainer } from './CategoryButtonStyle';
import { GroupDataText } from '../../pages/GroupData/GroupDataStyle';

export default function CategoryButton({ filter, categoryName, onPress }: any) {
  const [fontsLoaded] = useFonts({
    'inter-bold': require('../../fonts/Inter-Bold.ttf'),
    'inter-semiBold': require('../../fonts/Inter-SemiBold.ttf'),
  });
  if (!fontsLoaded) {
    return undefined;
  }

  return (
    <CategoryButtonContainer selected={filter === categoryName ? true : false} onPress={onPress}>
      <GroupDataText
        font="inter-semiBold"
        color={filter === categoryName ? '#EF4036' : '#757474'}
        size="14px"
      >
        {categoryName}
      </GroupDataText>
    </CategoryButtonContainer>
  );
}
