import styled from 'styled-components/native';

export const LessonFilesContainer = styled.View`
  flex: 1;
  background-color: #f2f6fa;
  padding: 20px 16px;
`;

export const LessonFilesList = styled.ScrollView.attrs({
  showsVerticalScrollIndicator: false,
  contentContainerStyle: {
    gap: 12,
    paddingBottom: 20,
  },
})``;

export const LessonFilesGrid = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: center;
  width: 100%;
`;

export const LessonFileCard = styled.Pressable`
  width: 105px;
  height: 140px;
  background-color: #ffffff;
  border-radius: 12px;
  border-width: 1px;
  border-color: #e0e0e0;
  align-items: center;
  padding: 10px 6px 8px 6px;
  justify-content: space-between;
`;

export const LessonFilePreviewImage = styled.Image`
  width: 70px;
  height: 70px;
  border-radius: 8px;
  resize-mode: cover;
`;

export const LessonFileIconContainer = styled.View`
  width: 70px;
  height: 70px;
  justify-content: center;
  align-items: center;
  background-color: #f0f0f0;
  border-radius: 8px;
`;

export const LessonFileName = styled.Text`
  font-family: 'inter-semibold';
  font-size: 12px;
  color: #4e4e4e;
  text-align: center;
  margin-top: 6px;
`;

export const LessonFileType = styled.Text`
  font-family: 'inter-regular';
  font-size: 10px;
  color: #8f8f8f;
  text-align: center;
`;

export const LessonFilesEmptyContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  padding: 40px 20px;
`;

export const LessonFilesLoadingContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  padding: 40px 20px;
`;
