/* eslint-disable global-require */
import React from 'react';
import { useFonts } from 'expo-font';
import { CategoryEditGroupContainer, CategoryIcon } from './CategoryEditGroupStyle';
import { GroupDataText } from '../../pages/GroupData/GroupDataStyle';

export default function CategoryEditGroup({ categoryName, onPress, noIcon }: any) {
  const minusIcon = require('../../assets/minus-icon.svg');
  const [fontsLoaded] = useFonts({
    'inter-regular': require('../../fonts/Inter-Regular.ttf'),
  });
  if (!fontsLoaded) {
    return undefined;
  }
  return (
    <CategoryEditGroupContainer onPress={onPress}>
      <GroupDataText font="inter-regular" color="#757474" size="14px">
        {categoryName}
      </GroupDataText>
      <CategoryIcon noIcon={noIcon} source={minusIcon} />
    </CategoryEditGroupContainer>
  );
}
