import React, { useEffect, useState } from 'react';
import { Linking, Modal } from 'react-native';
import Constants from 'expo-constants';
import Toast from 'react-native-toast-message';
import api from '../../services/api';
import {
  Card,
  Description,
  ErrorText,
  Overlay,
  Title,
  UpdateButton,
  UpdateButtonText,
  VersionText,
} from './AppUpdateGuardStyle';

type AppUpdateStatus = 'current' | 'optional' | 'required';

type VersionInfo = {
  status: AppUpdateStatus | null;
  latest: string | null;
  minimum: string | null;
  releaseUrl: string;
  downloadUrl: string;
};

export default function AppUpdateGuard() {
  const [versionInfo, setVersionInfo] = useState<VersionInfo | null>(null);
  const [openError, setOpenError] = useState(false);

  const installedVersion = Constants.expoConfig?.version ?? '0.0.0';

  useEffect(() => {
    let isMounted = true;

    api
      .get<VersionInfo>('/version', { params: { current: installedVersion } })
      .then((response) => {
        if (isMounted) setVersionInfo(response.data);
      })
      .catch(() => null);

    return () => {
      isMounted = false;
    };
  }, [installedVersion]);

  const status = versionInfo?.status ?? 'current';
  const latestVersion = versionInfo?.latest ?? undefined;
  const isRequired = status === 'required';
  const updateUrl = versionInfo?.downloadUrl ?? versionInfo?.releaseUrl;

  useEffect(() => {
    if (status !== 'optional') return;

    Toast.show({
      type: 'info',
      text1: 'Nova versão disponível',
      text2: latestVersion
        ? `A versão ${latestVersion} já está disponível.`
        : 'Atualize para receber as novidades.',
    });
  }, [status, latestVersion]);

  const handleUpdatePress = async () => {
    if (!updateUrl) {
      setOpenError(true);
      return;
    }

    try {
      await Linking.openURL(updateUrl);
      setOpenError(false);
    } catch {
      setOpenError(true);
    }
  };

  return (
    <Modal
      visible={isRequired}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={() => undefined}>
      <Overlay>
        <Card>
          <Title>Atualização obrigatória</Title>
          <Description>
            Esta versão do ManaMano não é mais suportada. Atualize para continuar usando o
            aplicativo.
          </Description>
          {latestVersion ? <VersionText>Versão disponível: {latestVersion}</VersionText> : null}
          {openError ? (
            <ErrorText>
              Não foi possível abrir a página de atualização.
              {versionInfo?.releaseUrl ? ` Acesse ${versionInfo.releaseUrl} pelo navegador.` : ''}
            </ErrorText>
          ) : null}
          <UpdateButton onPress={handleUpdatePress}>
            <UpdateButtonText>Atualizar agora</UpdateButtonText>
          </UpdateButton>
        </Card>
      </Overlay>
    </Modal>
  );
}
