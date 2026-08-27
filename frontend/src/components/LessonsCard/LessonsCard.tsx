/* eslint-disable prettier/prettier */
/* eslint-disable react/jsx-indent */
/* eslint-disable global-require */
import React, { useCallback, useEffect, useState } from 'react';
import { Linking } from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import Toast from 'react-native-toast-message';

import {
  FileButtonContainer,
  FileButtonIconContainer,
  FileButtonText,
  LessonsCardButtonContainer,
  LessonsCardButtonContainerRow,
  LessonsCardContainer,
  LessonsCardDateText,
  LessonsCardDivider,
  LessonsCardFileContainer,
  LessonsCardInfoContainer,
  LessonsCardInfoContainerSpaceBetween,
  LessonsCardInfoContainerWithGap,
  LessonsCardLinkIcon,
  LessonsCardOption,
  LessonsCardOptionDivider,
  LessonsCardOptionText,
  LessonsCardOptionTextDanger,
  LessonsCardOptionsMenu,
  LessonsCardThreeDotsButton,
  LessonsCardTitleContainer,
  LessonsCardTitleText,
  LessonsCardWrapper,
} from './LessonsCardStyle';
import { GroupDataText } from '../../pages/GroupData/GroupDataStyle';
import CalendarIcon from '../../assets/calendar-icon.svg';
import BookIcon from '../../assets/book-icon.svg';
import LinkIcon from '../../assets/link-icon.svg';
import DotsMenuIcon from '../../assets/dots-menu-icon.svg';
import EditIcon from '../../assets/edit-icon.svg';
import EyeIcon from '../../assets/eye-open-icon.svg';
import TrashCan from '../../assets/trash-can.svg';
import DeleteOneConfirmation from '../DeleteOneConfirmation/DeleteOneConfirmation';
import api from '../../services/api';

type File = {
  contentBase64: string;
  groupId: string;
  id: string;
  mimeType: string;
  name: string;
  postId: string;
  type: string;
  userId: string;
};

type LessonsCardProps = {
  id: string;
  date: string | Date;
  title: string;
  urlLive?: string;
  urlVOD?: string;
  isInstructor?: boolean;
  onDeleteSuccess?: () => void;
};

export default function LessonsCard({
  id,
  date,
  title,
  urlLive,
  urlVOD,
  isInstructor = false,
  onDeleteSuccess,
}: LessonsCardProps) {
  const [selected, setSelected] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const isScheduled = new Date() < new Date(date);

  const fetchFiles = useCallback(async () => {
    try {
      const response = await api.get(`/archives/post/${id}`);
      setFiles(response.data);
    } catch {
      setFiles([]);
    }
  }, [id]);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  const getUrl = () => {
    if (isScheduled) {
      return urlLive;
    }
    return urlVOD;
  };

  function formatDateTime(createdAt: string | Date): string {
    const createdAtDate = new Date(createdAt);

    const day = String(createdAtDate.getDate()).padStart(2, '0');
    const month = String(createdAtDate.getMonth() + 1).padStart(2, '0');
    const year = String(createdAtDate.getFullYear()).slice(-2);
    const hours = String(createdAtDate.getHours()).padStart(2, '0');
    const minutes = String(createdAtDate.getMinutes()).padStart(2, '0');

    return `${day}/${month}/${year} - ${hours}:${minutes}`;
  }

  const openLink = async () => {
    const url = getUrl();

    if (!url) {
      Toast.show({
        type: 'error',
        text1: 'Link não disponível para esta aula.',
        visibilityTime: 2000,
      });
      return;
    }

    const supported = await Linking.canOpenURL(url);

    if (supported) {
      await Linking.openURL(url);
    } else {
      Toast.show({
        type: 'error',
        text1: `Não foi possível abrir este link: ${url}`,
        visibilityTime: 2000,
      });
    }
  };

  const copyLink = () => {
    const url = getUrl();

    if (!url) {
      Toast.show({
        type: 'error',
        text1: 'Link não disponível para esta aula.',
        visibilityTime: 2000,
      });
      return;
    }

    Clipboard.setString(url);

    Toast.show({
      type: 'success',
      text1: 'Link Copiado!',
      visibilityTime: 1000,
    });
  };

  const handleEdit = () => {
    // TODO criar pagina de edição de aulas
  };

  const handleDelete = () => {
    setShowMenu(false);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await api.delete(`/post/${id}`);
      Toast.show({
        type: 'success',
        text1: 'Aula excluída com sucesso!',
      });
      setShowDeleteModal(false);
      if (onDeleteSuccess) {
        onDeleteSuccess();
      }
    } catch (error: any) {
      const msg = error?.response?.data?.message || 'Erro ao excluir aula.';
      Toast.show({
        type: 'error',
        text1: msg,
      });
      setShowDeleteModal(false);
    }
  };

  const handleViewFiles = () => {
    // TODO criar pagina de visualização de arquivos
  };

  return (
    <>
      <LessonsCardWrapper showMenu={showMenu}>
        <LessonsCardContainer
          onPress={() => {
            if (showMenu) {
              setShowMenu(false);
              return;
            }
            setSelected(!selected);
          }}
          selected={selected}
          activeOpacity={0.8}>
          {isInstructor && (
            <LessonsCardThreeDotsButton
              selected={selected}
              onPress={(e) => {
                if (e && (e as any).stopPropagation) (e as any).stopPropagation();
                setShowMenu(!showMenu);
              }}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              testID={`lesson-options-${id}`}>
              <DotsMenuIcon width={20} height={20} />
            </LessonsCardThreeDotsButton>
          )}

          {selected ? (
            <>
              <LessonsCardInfoContainer style={{ paddingRight: isInstructor ? 36 : 0 }}>
                <GroupDataText font="inter-bold" size="16px" color="#4E4E4E" numberOfLines={1}>
                  {title}
                </GroupDataText>
              </LessonsCardInfoContainer>
              <LessonsCardInfoContainer>
                <CalendarIcon />
                <GroupDataText font="inter-bold" size="12px" color="#4E4E4E">
                  {isScheduled ? 'Começa em' : 'Terminou em'}
                  <GroupDataText font="inter-bold" size="12px" color="#160E47">
                    {' '}
                  </GroupDataText>
                </GroupDataText>
                <GroupDataText font="inter-bold" size="12px" color="#160E47">
                  {formatDateTime(date)}
                  <GroupDataText font="inter-bold" size="12px" color="#160E47" />
                </GroupDataText>
                <GroupDataText font="inter-bold" size="12px" color="#160E47" />
              </LessonsCardInfoContainer>
              <LessonsCardInfoContainerWithGap>
                <LessonsCardButtonContainer backgroundColor="#160E47" onPress={openLink}>
                  <GroupDataText font="inter-bold" size="13px" color="white">
                    Entrar na aula
                  </GroupDataText>
                </LessonsCardButtonContainer>
                <LessonsCardButtonContainerRow backgroundColor="none" border onPress={copyLink}>
                  <LessonsCardLinkIcon>
                    <LinkIcon style={{ width: 20, height: 21 }} />
                  </LessonsCardLinkIcon>
                  <GroupDataText font="inter-bold" size="13px" color="#160E47">
                    {' '}
                    Copiar link
                  </GroupDataText>
                </LessonsCardButtonContainerRow>
              </LessonsCardInfoContainerWithGap>
              {files.length > 0 && (
                <LessonsCardFileContainer>
                  <LessonsCardDivider />
                  <FileButtonContainer onPress={handleViewFiles}>
                    <FileButtonIconContainer>
                      <EyeIcon width={20} height={21} />
                    </FileButtonIconContainer>
                    <FileButtonText>Visualizar conteúdos a aula</FileButtonText>
                  </FileButtonContainer>
                </LessonsCardFileContainer>
              )}
            </>
          ) : (
            <LessonsCardInfoContainerSpaceBetween style={{ paddingRight: isInstructor ? 32 : 0 }}>
              <LessonsCardTitleContainer>
                <BookIcon />
                <LessonsCardTitleText numberOfLines={1}>{title}</LessonsCardTitleText>
              </LessonsCardTitleContainer>
              <LessonsCardDateText>{formatDateTime(date)}</LessonsCardDateText>
            </LessonsCardInfoContainerSpaceBetween>
          )}
        </LessonsCardContainer>

        {isInstructor && showMenu && (
          <LessonsCardOptionsMenu selected={selected}>
            <LessonsCardOption
              onPress={(e) => {
                if (e && (e as any).stopPropagation) (e as any).stopPropagation();
                handleEdit();
              }}
              testID={`lesson-edit-${id}`}>
              <EditIcon width={16} height={16} />
              <LessonsCardOptionText>Editar</LessonsCardOptionText>
            </LessonsCardOption>
            <LessonsCardOptionDivider />
            <LessonsCardOption
              onPress={(e) => {
                if (e && (e as any).stopPropagation) (e as any).stopPropagation();
                handleDelete();
              }}
              testID={`lesson-delete-${id}`}>
              <TrashCan width={16} height={16} />
              <LessonsCardOptionTextDanger>Apagar</LessonsCardOptionTextDanger>
            </LessonsCardOption>
          </LessonsCardOptionsMenu>
        )}
      </LessonsCardWrapper>

      <DeleteOneConfirmation
        visible={showDeleteModal}
        text={`Tem certeza que deseja apagar a aula "${title}"?`}
        onConfirm={confirmDelete}
        onCancel={() => setShowDeleteModal(false)}
      />
    </>
  );
}
