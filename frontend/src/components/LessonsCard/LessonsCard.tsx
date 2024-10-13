/* eslint-disable prettier/prettier */
/* eslint-disable react/jsx-indent */
/* eslint-disable global-require */
import React, { useState } from 'react';
import { useFonts } from 'expo-font';
import { Image } from 'react-native';
import {
  LessonsCardButtonContainer,
  LessonsCardContainer,
  LessonsCardInfoContainer,
} from './LessonsCardStyle';
import { GroupDataText } from '../../pages/GroupData/GroupDataStyle';

export default function LessonsCard({ date, time, title }: any) {
  const [selected, setSelected] = useState(false);
  const calendar = require('../../assets/calendar-icon.svg');
  const book = require('../../assets/book-icon.svg');
  const link = require('../../assets/link-icon.svg');

  const [fontsLoaded] = useFonts({
    'inter-bold': require('../../fonts/Inter-Bold.ttf'),
    'inter-regular': require('../../fonts/Inter-Regular.ttf'),
  });
  if (!fontsLoaded) {
    return undefined;
  }

  return (
    <LessonsCardContainer onPress={() => setSelected(!selected)} selected={selected}>
      {selected ? (
        <>
          <LessonsCardInfoContainer>
            <GroupDataText font="inter-bold" size="16px" color="#4E4E4E" numberOfLines={1}>
              {title}
            </GroupDataText>
          </LessonsCardInfoContainer>

          <LessonsCardInfoContainer>
            <Image source={calendar} />
            <GroupDataText font="inter-bold" size="12px" color="#4E4E4E">
              Começa em
              <GroupDataText font="inter-bold" size="12px" color="#160E47">
                {' '}
              </GroupDataText>
            </GroupDataText>
            <GroupDataText font="inter-bold" size="12px" color="#160E47">
              {date}
              <GroupDataText font="inter-bold" size="12px" color="#160E47">
                {' - '}
              </GroupDataText>
            </GroupDataText>
            <GroupDataText font="inter-bold" size="12px" color="#160E47">
              {time}
            </GroupDataText>
          </LessonsCardInfoContainer>
          <LessonsCardInfoContainer style={{ gap: '10px' }}>
            <LessonsCardButtonContainer backgroundColor="#160E47">
              <GroupDataText font="inter-bold" size="13px" color="white">
                Entrar na aula
              </GroupDataText>
            </LessonsCardButtonContainer>
            <LessonsCardButtonContainer
              backgroundColor="none"
              border
              style={{ flexDirection: 'row' }}
            >
              <Image source={link} />

              <GroupDataText font="inter-bold" size="13px" color="#160E47">
                {' '}
                Copiar link da aula
              </GroupDataText>
            </LessonsCardButtonContainer>
          </LessonsCardInfoContainer>
        </>
      ) : (
        <LessonsCardInfoContainer style={{ justifyContent: 'space-between', position: 'relative' }}>
          <LessonsCardInfoContainer style={{ width: 'fit-content', gap: '3px' }}>
            <Image source={book} />
            <GroupDataText
              font="inter-bold"
              size="16px"
              color="#4E4E4E"
              numberOfLines={1}
              style={{ zIndex: 3 }}
            >
              {title}
            </GroupDataText>
          </LessonsCardInfoContainer>
          <GroupDataText font="inter-bold" size="12px" color="#160E47">
            {date}
          </GroupDataText>
        </LessonsCardInfoContainer>
      )}
    </LessonsCardContainer>
  );
}
