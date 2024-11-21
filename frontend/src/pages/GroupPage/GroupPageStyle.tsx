/* eslint-disable import/prefer-default-export */
import styled from 'styled-components/native';

export const GroupPageContainer = styled.View`
  display: flex;
  position: relative;
  background-color: #f2f6fa;
  width: 100vw;
  height: 100vh;
`;

export const GroupPageTabs = styled.View`
  display: flex;
  width: 100%;
  flex-direction: row;
  justify-content: space-evenly;
`;
export const GroupPageTabsContainer = styled.TouchableOpacity`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 33.3%;
  padding: 20px 0px;
`;

export const GroupPageContent = styled.View`
  display: flex;
  height: fit-content;
  flex: 1;
`;

export const GroupPageListFixPost = styled.View`
  display: flex;
  width: 100%;
  flex-direction: row;
  overflow-x: auto;
  scrollbar-width: none;
  padding: 25px;
  gap: 10px;
`;

export const GroupPageCategoryContainer = styled.View`
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 15px;
  padding: 0px 0px 0px 25px;
`;

export const GroupPageCategoryList = styled.View`
  display: flex;
  flex-direction: row;
  width: 100%;
  padding-right: 25px;
  padding-bottom: 25px;
  overflow-x: auto;
  scrollbar-width: none;
  gap: 17px;
`;

export const GroupPagePostList = styled.View`
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  overflow-x: auto;
  padding: 0px 25px 25px 25px;
  scrollbar-width: none;
  gap: 17px;
`;

export const GroupPageAddPostButton = styled.TouchableOpacity`
  display: flex;
  position: absolute;
  bottom: 0;
  right: 0;
  justify-content: center;
  align-items: center;
  width: 70px;
  height: 70px;
  border-radius: 50%;
  background-image: linear-gradient(to bottom, #1c1049, #363061);
  margin: 0px 25px 50px 0px;
`;

export const GroupPageLessonsContainer = styled.View`
  display: flex;
  width: 100%;
  flex-direction: column;
  overflow-y: auto;
  scrollbar-width: none;
  padding: 25px;
  gap: 10px;
`;

export const GroupPageImageContainer = styled.View`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
`;

export const GroupPageImage = styled.Image`
  width: 100%;
  height: 100%;
  aspect-ratio: 1 / 1; /* Proporção quadrada */
  object-fit: cover;
`;

export const ImageContainer = styled.View`
  display: flex;
  padding: 0px 25px 25px 25px;
  overflow-y: auto;
  flex: 1;
`;
