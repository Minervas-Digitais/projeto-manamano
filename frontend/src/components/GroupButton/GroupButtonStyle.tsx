import styled from 'styled-components/native';
import { LinearGradient } from 'expo-linear-gradient';

// eslint-disable-next-line import/prefer-default-export
export const GroupButtonContainer = styled.TouchableOpacity`
  border-radius: 15px;
  display: flex;
  width: 157px;
  height: 133px;
  border-radius: 15px;
  padding: 18px;
  justify-content: space-between;
  overflow: hidden;
`;

export const GroupTextContainer = styled.View`
  z-index: 1;
  width: 100%;
  gap: 8px;
  display: flex;
`;

export const GroupName = styled.Text<{ fontFamily: string }>`
  font-family: ${(prop) => prop.fontFamily};
  color: white;
  font-size: 16px;
`;

export const GroupOnlineContainer = styled.View`
  display: flex;
  flex-direction: row;
  gap: 5px;
  align-items: center;
`;

export const GroupOnline = styled.Text<{ fontFamily: string }>`
  font-family: ${(prop) => prop.fontFamily};
  color: white;
  font-size: 12px;
`;

export const GroupOnlineCircle = styled.View`
  background-color: #ef4036;
  width: 12px;
  height: 12px;
  border-radius: 50px;
`;

export const GroupFilterContainer = styled.TouchableOpacity`
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
`;

export const GroupButtonImage = styled.TouchableOpacity<{ $size?: any }>`
  display: ${(prop) => (prop.$size ? 'none' : 'flex')};
`;
