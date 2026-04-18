import styled from 'styled-components/native';

export const EventCardContainer = styled.TouchableOpacity`
  width: 98%;
  border: solid 1px #d8d7d7;
  border-radius: 15px;
  background-color: #ffffff;
  padding: 12px 15px 12px 20px;
  gap: 8px;
`;

export const EventCardHeader = styled.View`
  width: 100%;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

export const EventCardDateRow = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 5px;
`;

export const EventCardTitle = styled.Text`
  font-family: 'inter-bold';
  color: #4e4e4e;
  font-size: 16px;
`;
