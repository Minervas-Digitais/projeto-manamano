/* eslint-disable import/prefer-default-export */
import { Dimensions, Platform } from 'react-native';
import styled from 'styled-components/native';

const { width, height } = Dimensions.get('window');

export const NewPostContainer = styled.View`
  margin-top: ${height * 0.03}px;
  flex: 1;
`;

export const NewPostInputContainer = styled.View`
  padding-right: 25px;
  padding-left: 25px;
  justify-content: space-between;
  flex: 1;
`;

export const NewPostInputTextContainer = styled.View`
  padding-right: 15px;
  padding-left: 15px;
  height: ${height * 0.27}px;
  min-height: 250px;
  background-color: #fff;
  padding-top: 15px;
  ${Platform.select({
    ios: `
      shadow-color: rgba(0, 0, 0, 0.2);
      shadow-offset: 0px 4px;
      shadow-opacity: 0.2;
      shadow-radius: 4px;
    `,
    android: `
      elevation: 5;
    `,
    web: `  
    box-shadow: 0 4px 4px rgba(0, 0, 0, 0.2);
 `,
  })} z-index: 10;
`;

export const LinkIcon = styled.TouchableOpacity`
  align-self: end;
  margin-top: 20px;
  margin-right: 5px;
  flex-direction: row;
  gap: 20px;
`;

export const NewEventInputContainer = styled.View`
  flex: 1;
  gap: 20px;
`;

export const BottomPartContainer = styled.View`
  width: ${width * 0.88}px;
  margin-left: ${width * 0.0581}px;
  justify-content: space-between;
  flex: 1;
  padding-bottom: 30px;
`;
