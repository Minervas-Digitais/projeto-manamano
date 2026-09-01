/* eslint-disable react/jsx-indent */
/* eslint-disable no-nested-ternary */
/* eslint-disable react/jsx-closing-bracket-location */
/* eslint-disable global-require */

import React from 'react';
import {
  ModalGroupOptionsContainer,
  ModalGroupOptionsOptionContainer,
  ModalGroupOptionsText,
} from './ModalGroupOptionsStyle';
import LinkIcon from '../../assets/link-icon.svg';
import BellIcon from '../../assets/notification-icon.svg';

type ModalGroupOptionsProps = {
  onNotification: () => void;
  onCopyInviteCode: () => void;
};

export default function ModalGroupOptions({
  onNotification,
  onCopyInviteCode,
}: ModalGroupOptionsProps) {
  return (
    <ModalGroupOptionsContainer>
      <ModalGroupOptionsOptionContainer onPress={onNotification}>
        <BellIcon />
        <ModalGroupOptionsText font="inter-regular" color="#515151" size="13px">
          Notificações
        </ModalGroupOptionsText>
      </ModalGroupOptionsOptionContainer>

      <ModalGroupOptionsOptionContainer onPress={onCopyInviteCode}>
        <LinkIcon />
        <ModalGroupOptionsText font="inter-regular" color="#515151" size="13px">
          Copiar código do grupo
        </ModalGroupOptionsText>
      </ModalGroupOptionsOptionContainer>
    </ModalGroupOptionsContainer>
  );
}
