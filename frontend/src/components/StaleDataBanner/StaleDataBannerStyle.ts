import styled from 'styled-components/native';

export const BannerContainer = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  background-color: #fff4e5;
  border-width: 1px;
  border-color: #f0c36d;
  border-radius: 8px;
  padding: 12px;
  /* Vertical simétrico: cada tela ajusta via prop style para casar com o
     padding/gap do próprio container */
  margin: 12px 16px;
`;

export const BannerText = styled.Text`
  flex: 1;
  font-family: 'inter-regular';
  font-size: 13px;
  color: #8a6d1f;
`;

export const BannerButton = styled.TouchableOpacity`
  background-color: #ef4036;
  border-radius: 6px;
  padding-vertical: 8px;
  padding-horizontal: 14px;
`;

export const BannerButtonText = styled.Text`
  font-family: 'inter-bold';
  font-size: 13px;
  color: #ffffff;
`;
