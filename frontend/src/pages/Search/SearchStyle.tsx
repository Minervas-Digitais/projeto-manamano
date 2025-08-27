import styled from 'styled-components/native';

export const PageContainer = styled.View`
  font-family: sans-serif;
  flex: 1;
`;

export const Title = styled.Text`
  flex-grow: 1;
  font-size: 20px;
  text-align: center;
  margin: 0;
  font-weight: bold;
  color: #160e47;
  margin-right: 20px;
`;

export const SearchInputWrapper = styled.View`
  flex-direction: row;
  align-items: center;
  background-color: #f1f1f1;
  border-radius: 8px;
  padding: 10px;
  margin-bottom: 20px;
  border: 1px solid #ddd;
`;

export const SearchIcon = styled.View`
  margin-right: 10px;
  font-size: 20px;
  color: #666;
`;

export const SearchInput = styled.TextInput`
  flex: 1;
  font-size: 16px;
  background-color: transparent;
  color: #333;
`;

export const RecentSection = styled.View`
  margin-top: 20px;
  flex: 1;
`;

export const RecentUsers = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-between;
`;

export const UserCard = styled.View`
  flex-direction: column;
  align-items: center;
  text-align: center;
`;

export const Avatar = styled.Image`
  width: 60px;
  height: 60px;
  border-radius: 30px;
  margin-bottom: 5px;
`;

export const ContentContainer = styled.View`
  padding: 20px;
  flex: 1;
`;
