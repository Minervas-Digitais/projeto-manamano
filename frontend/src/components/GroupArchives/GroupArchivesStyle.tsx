/* eslint-disable import/prefer-default-export */
import styled from 'styled-components/native';

interface ArchiveTextProps {
  font: string;
}

export const ArchiveButtonContainer = styled.View`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 105px;
  height: 140px;
  background-color: #ffffff;
  border-radius: 12px;
  padding: 8px;
  margin: 4px;
  shadow-color: #000;
  shadow-offset: 0px 2px;
  shadow-opacity: 0.1;
  shadow-radius: 3px;
  elevation: 3;
`;

export const ArchivePreviewImage = styled.Image`
  width: 80px;
  height: 80px;
  border-radius: 8px;
  object-fit: cover;
`;

export const ArchiveIconContainer = styled.View`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  background-color: #f0f4f8;
  border-radius: 8px;
`;

export const ArchiveFileName = styled.Text<ArchiveTextProps>`
  font-family: ${(props) => props.font};
  font-size: 12px;
  color: #333;
  text-align: center;
  margin-top: 8px;
  width: 100%;
`;

export const ArchiveFileType = styled.Text<ArchiveTextProps>`
  font-family: ${(props) => props.font};
  font-size: 10px;
  color: #666;
  text-align: center;
  margin-top: 2px;
`;
