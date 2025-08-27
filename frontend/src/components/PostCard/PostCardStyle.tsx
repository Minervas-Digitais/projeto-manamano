/* eslint-disable import/prefer-default-export */
import { Platform } from 'react-native';
import styled from 'styled-components/native';

export const PostCardContainer = styled.TouchableOpacity<{ shadowColor?: string }>((props) => ({
  display: 'flex',
  flexDirection: 'column',
  position: 'relative',
  width: '98%',
  paddingTop: 0,
  paddingRight: 15,
  paddingBottom: 10,
  paddingLeft: 20,
  gap: 5,
  borderRadius: 15,
  backgroundColor: 'white',
  borderWidth: 1,
  borderColor: '#d8d7d7',
  ...(Platform.OS === 'android' && {
    elevation: 8,
  }),
  ...(Platform.OS === 'ios' && {
    shadowColor: props.shadowColor || 'rgba(0, 0, 0, 0.1)',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
  }),
}));

export const PostCardTag = styled.View({
  display: 'flex',
  width: 93,
  height: 27,
  overflow: 'hidden',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  borderBottomLeftRadius: 10,
  borderBottomRightRadius: 10,
  backgroundColor: '#170e49',
  paddingHorizontal: 3,
});

export const PostCardSpaceBetween = styled.View({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  width: '100%',
});

export const PostCardIcons = styled.View({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  columnGap: 3,
});

export const PostCardImageUser = styled.Image({
  width: 40,
  height: 40,
  borderRadius: 20,
});
