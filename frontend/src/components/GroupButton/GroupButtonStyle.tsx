import styled from 'styled-components/native';

// eslint-disable-next-line import/prefer-default-export
export const GroupButtonContainer = styled.TouchableOpacity<{ size?: any }>`
  display: flex;
  background-image: linear-gradient(to bottom, #1c1049, #363061);
  width: ${(prop) => (prop.size ? '100%' : '157px')};
  height: 133px;
  border-radius: 15px;
  padding: 18px;
  justify-content: space-between;
`;

export const GroupTextContainer = styled.View`
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

export const GroupButtonImage = styled.TouchableOpacity<{ size?: any }>`
  display: ${(prop) => (prop.size ? 'none' : 'flex')};
`;
