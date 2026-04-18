/* eslint-disable global-require */
import React from 'react';
import { useFonts } from 'expo-font';
import {
  EventCardContainer,
  EventCardDateRow,
  EventCardHeader,
  EventCardTitle,
} from './EventCardStyle';
import { GroupDataText } from '../../pages/GroupData/GroupDataStyle';
import CalendarIcon from '../../assets/calendar-icon.svg';

export default function EventCard({ date, title, description }: any) {
  const [fontsLoaded] = useFonts({
    'inter-bold': require('../../fonts/Inter-Bold.ttf'),
    'inter-regular': require('../../fonts/Inter-Regular.ttf'),
  });
  if (!fontsLoaded) {
    return undefined;
  }

  return (
    <EventCardContainer activeOpacity={0.9}>
      <EventCardHeader>
        <GroupDataText font="inter-regular" color="#7A7A7A" size="11px">
          Evento
        </GroupDataText>
        <EventCardDateRow>
          <CalendarIcon width="14px" height="14px" />
          <GroupDataText font="inter-bold" size="11px" color="#160E47">
            {date}
          </GroupDataText>
        </EventCardDateRow>
      </EventCardHeader>

      <EventCardTitle numberOfLines={2}>{title}</EventCardTitle>

      <GroupDataText numberOfLines={4} font="inter-regular" size="12px" color="#515151">
        {description}
      </GroupDataText>
    </EventCardContainer>
  );
}
