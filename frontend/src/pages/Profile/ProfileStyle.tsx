/* eslint-disable import/prefer-default-export */
import styled from 'styled-components/native';

export const ProfileContainerInfo = styled.View`
  display: flex;
  width: 100vw;
  height: auto;
  padding: 50px 25px 25px 25px;
  gap: 30px;
`;

export const ProfileContainerButtons = styled.View`
  display: flex;
  flex-direction: row;
  width: 100%;
  justify-content: space-between;
`;

export const ProfileImage = styled.Image<{ radius?: boolean; width?: any; height?: any }>`
  width: ${(prop) => prop.width};
  height: ${(prop) => prop.height};
  border-radius: ${(prop) => (prop.radius ? '50%' : 0)};
  border: ${(prop) => (prop.radius ? 'solid 1.6px white' : 'none')};
`;

export const ProfileContainerData = styled.View<{ gap?: any; center?: boolean }>`
  display: flex;
  flex-direction: row;
  align-items: ${(prop) => (prop.center ? 'center' : '')};
  gap: ${(prop) => (prop.gap ? prop.gap : '20px')};
`;

export const ProfileTabsContainer = styled.TouchableOpacity`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 50%;
  padding: 20px 0px;
`;

export const ProfileTextContainer = styled.View`
  display: flex;
  padding: 0px 25px 0px 25px;
`;

export const ProfilePostsContainer = styled.View`
  display: flex;
  overflow-y: auto;
  flex-direction: column;
  width: 100%;
  flex: 1;
  gap: 30px;
  padding: 25px 25px 25px 30px;
`;
