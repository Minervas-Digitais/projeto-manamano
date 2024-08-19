/* eslint-disable import/prefer-default-export */
import styled from 'styled-components/native';

export const BlueBackground = styled.View`
  background-color: #170e49;
  width: 100vw;
  height: 100vh;
`;
export const WhiteBackground = styled.ScrollView`
  background-color: #f2f6fa;
  width: 100vw;
  height: 100vh;
  margin-top: 10vh;
  border-top-right-radius: 40px;
  border-top-left-radius: 40px;
  position: absolute;
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
  margin-left: 5.8vw;
  margin-top: 5.4vh;
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
  width: 45vw;
  margin-top: 8vh;
  flex-direction: row;
  gap: 8.8vw;
`;
export const NamePart = styled.View`
  width: 88vw;
  margin-left: 5.81vw;
`;
export const MiddlePart = styled.View`
  width: 88vw;
  margin-left: 5.81vw;
  flex-direction: row;
`;
export const BottomPart = styled.View`
  width: 88vw;
  margin-left: 5.81vw;
  gap: 3.5vw;
`;
