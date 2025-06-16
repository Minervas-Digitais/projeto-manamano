/* eslint-disable import/prefer-default-export */
import { Dimensions } from 'react-native';
import styled from 'styled-components/native';
const { width, height } = Dimensions.get('window');

export const BlueBackground = styled.View`
  background-color: #170e49;
  width: ${width}px;
  height: ${height}px;
`;

export const WhiteBackground = styled.ScrollView`
  background-color: #f2f6fa;
  margin-top: ${height * 0.1}px;
  border-top-right-radius: 40px;
  border-top-left-radius: 40px;
`;

export const EditImageButton = styled.Pressable`
  margin-left: 20px;
  z-index: 1;
  width: 140px;
  height: 140px;
  border-radius: 100%;
  bottom: 45px;
`;

export const MenuW = styled.Image`
  margin-left: ${width * 0.058}px;
  margin-top: ${height * 0.054}px;
  position: absolute;
`;

export const ProfilePic = styled.Image`
  margin-left: 25px;
  width: 116px;
  height: 116px;
  border-radius: 100%;
  position: absolute;
  bottom: 50px;
`;

export const PencilButton = styled.Image`
  margin-top: 60px;
  margin-left: 110px;
  position: absolute;
  z-index: 0;
`;

export const UpperPart = styled.View`
  width: ${width * 0.45}px;
  margin-top: ${height * 0.08}px;
  flex-direction: row;
  gap: ${width * 0.088}px;
`;

export const NamePart = styled.View`
  width: ${width * 0.88}px;
  margin-left: ${width * 0.0581}px;
`;

export const MiddlePart = styled.View`
  width: ${width * 0.88}px;
  margin-left: ${width * 0.0581}px;
  flex-direction: row;
`;

export const BottomPart = styled.View`
  width: ${width * 0.88}px;
  margin-left: ${width * 0.0581}px;
  gap: ${width * 0.035}px;
`;