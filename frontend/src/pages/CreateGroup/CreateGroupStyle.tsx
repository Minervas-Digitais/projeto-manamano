import styled from 'styled-components/native';

export const Container = styled.View`
  font-family: sans-serif;
  background-color: #f2f6fa;
  flex: 1;
  width: 100%;
`;

export const ContentContainer = styled.View`
  padding: 20px;
  flex-grow: 1;
`;

export const Input = styled.TextInput`
  background-color: #fff;
  width: 100%;
  border-radius: 8px;
  padding: 12px;
  font-size: 14px;
  margin-bottom: 36px;
  outline: none;
  box-shadow: none;
`;

export const TextArea = styled(Input)`
  height: 100px;
  text-align-vertical: top;
  margin-bottom: 36px;
`;

export const CategoryContainer = styled.View`
  flex-direction: row;
  align-items: center;
  background-color: #fff;
  border-radius: 8px;
`;

export const AddCategoryButton = styled.TouchableOpacity`
  background-color: #e8e8e8;
  border-width: 1px;
  border-color: #e8e8e8;
  border-radius: 20px;
  width: 30px;
  height: 30px;
  justify-content: center;
  align-items: center;
`;

export const Category = styled.Text`
  background-color: #e8e8e8;
  color: #757474;
  border-radius: 20px;
  padding: 8px 16px;
  margin-top: 8px;
  margin-right: 8px;
  margin-left: 8px;
  font-size: 14px;
  flex-direction: row;
  align-items: center;
`;
