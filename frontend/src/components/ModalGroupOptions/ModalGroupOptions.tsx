/* eslint-disable react/jsx-indent */
/* eslint-disable no-nested-ternary */
/* eslint-disable react/jsx-closing-bracket-location */
/* eslint-disable global-require */

import React from 'react';
import {
  ModalGroupOptionsContainer,
  ModalGroupOptionsInfo,
  ModalGroupOptionsOptionContainer,
  ModalGroupOptionsText,
} from './ModalGroupOptionsStyle';
import LinkIcon from '../../assets/link-icon.svg';
import BellIcon from '../../assets/notification-icon.svg';

type ModalGroupOptionsProps = {
  onNotification: () => void;
  onCopyInviteCode: () => void;
  onRegenerateInvite: () => void;
  onRevokeInvite: () => void;
  inviteCode?: string | null;
  inviteExpirationLabel?: string;
  inviteHasError?: boolean;
};

export default function ModalGroupOptions({
  onNotification,
  onCopyInviteCode,
  onRegenerateInvite,
  onRevokeInvite,
  inviteCode,
  inviteExpirationLabel,
  inviteHasError,
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

      <ModalGroupOptionsInfo>
        {inviteHasError
          ? 'Erro ao carregar convite'
          : inviteCode
            ? `Código: ${inviteCode}\n${inviteExpirationLabel ?? 'Sem convite ativo'}`
            : 'Sem convite ativo'}
      </ModalGroupOptionsInfo>

      <ModalGroupOptionsOptionContainer onPress={onRegenerateInvite}>
        <ModalGroupOptionsText font="inter-regular" color="#160E47" size="13px">
          Gerar novo código
        </ModalGroupOptionsText>
      </ModalGroupOptionsOptionContainer>

      <ModalGroupOptionsOptionContainer onPress={onRevokeInvite}>
        <ModalGroupOptionsText font="inter-regular" color="#EF4036" size="13px">
          Revogar código
        </ModalGroupOptionsText>
      </ModalGroupOptionsOptionContainer>
    </ModalGroupOptionsContainer>
  );
}
