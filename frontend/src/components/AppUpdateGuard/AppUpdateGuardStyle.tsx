import styled from 'styled-components/native';

export const Overlay = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background-color: rgba(22, 14, 71, 0.96);
`;

export const Card = styled.View`
  width: 100%;
  max-width: 420px;
  gap: 14px;
  padding: 28px 24px;
  border-radius: 20px;
  background-color: #fff;
`;

export const Title = styled.Text`
  font-family: 'inter-bold';
  font-size: 22px;
  color: #160e47;
  text-align: center;
`;

export const Description = styled.Text`
  font-family: 'inter-regular';
  font-size: 16px;
  line-height: 24px;
  color: #160e47;
  text-align: center;
`;

export const VersionText = styled.Text`
  font-family: 'inter-semiBold';
  font-size: 14px;
  color: #ef4036;
  text-align: center;
`;

export const ErrorText = styled.Text`
  font-family: 'inter-regular';
  font-size: 13px;
  line-height: 19px;
  color: #ef4036;
  text-align: center;
`;

export const UpdateButton = styled.TouchableOpacity`
  align-items: center;
  justify-content: center;
  height: 56px;
  margin-top: 8px;
  border-radius: 10px;
  background-color: #ef4036;
`;

export const UpdateButtonText = styled.Text`
  font-family: 'inter-bold';
  font-size: 17px;
  color: #fff;
`;
