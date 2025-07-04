/* eslint-disable import/prefer-default-export */
import { Platform } from 'react-native';
import styled from 'styled-components/native';

const getShadow = (color?: string) => Platform.select({
  ios: `
    shadow-color: ${color || 'rgba(0, 0, 0, 0.1)'};
    shadow-offset: 0px 3px;
    shadow-opacity: 0.5;
    shadow-radius: 6px;
  `,
  android: `
    elevation: 3;
  `
});

export const PostCardContainer = styled.TouchableOpacity<{ shadowColor?: string }>`
  display: flex;
  flex-direction: column;
  position: relative;
  width: 98%;
  padding: 0px 15px 10px 20px;
  border-radius: 15px;
  ${({ shadowColor }) => getShadow(shadowColor)}
  border: solid 1px #d8d7d7;
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
`;

export const PostCardImageUser = styled.Image`
  width: 40px;
  height: 40px;
  border-radius: 20px;
`;

interface ImageProps {
  width?: number;
  height?: number;
}

export const PostCardImage = styled.Image<ImageProps>`
  width: ${(props) => (props.width ? `${props.width}px` : '20px')};
  height: ${(props) => (props.height ? `${props.height}px` : '20px')};
  /* Outras propriedades básicas que podem ser comuns, ex: */
`;