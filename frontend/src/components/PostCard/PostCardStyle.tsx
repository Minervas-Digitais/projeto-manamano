/* eslint-disable import/prefer-default-export */
import { Platform } from 'react-native';
import styled from 'styled-components/native';

export const PostCardContainer = styled.TouchableOpacity<{ shadowColor?: string }>`
  display: flex;
  flex-direction: column;
  position: relative;
  width: 98%;
  padding: 0px 15px 10px 20px;
  gap: 5px;
  border-radius: 15px;
  background-color: #f2f6fa;
  ${Platform.select({
    ios: `
      shadow-color: ${(props) => (props.shadowColor ? '#ef3f36' : 'rgba(0, 0, 0, 0.1)')};
      shadow-offset: 0px 3px;
      shadow-opacity: 0.5;
      shadow-radius: 6px;
    `,
    android: `
      elevation: 3;
    `,
  })}
  border: solid 1px #d8d7d7;
  background-color: white;

  ${Platform.OS === 'android'
    ? `
    elevation: 8;
  `
    : ''}

  ${Platform.OS === 'ios'
    ? (props) => `
    shadow-color: ${props.shadowColor ? props.shadowColor : 'rgba(0, 0, 0, 0.1)'};
    shadow-offset: 0px 3px;
    shadow-opacity: 0.5;
    shadow-radius: 6px;
  `
    : ''}
`;

export const PostCardTag = styled.View`
  display: flex;
  width: 93px;
  height: 27px;
  overflow: hidden;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  border-radius: 0px 0px 10px 10px;
  background-color: #170e49;
  padding: 0px 3px 0px 3px;
`;

export const PostCardSpaceBetween = styled.View`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-start;
  width: 100%;
`;

export const PostCardIcons = styled.View`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 3px;
`;

export const PostCardImageUser = styled.Image`
  width: 40px;
  height: 40px;
  border-radius: 20px;
`;
