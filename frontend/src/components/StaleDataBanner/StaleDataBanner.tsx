import React from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import {
  BannerContainer,
  BannerButton,
  BannerButtonText,
  BannerText,
} from './StaleDataBannerStyle';

type StaleDataBannerProps = {
  onRefresh: () => void;
  refreshing?: boolean;
  testID?: string;
  style?: StyleProp<ViewStyle>;
};

export default function StaleDataBanner({
  onRefresh,
  refreshing = false,
  testID = 'stale-data-banner',
  style,
}: StaleDataBannerProps) {
  return (
    <BannerContainer testID={testID} style={style}>
      <BannerText>
        Não foi possível atualizar. Os dados exibidos podem estar desatualizados.
      </BannerText>
      <BannerButton
        testID="stale-data-refresh"
        onPress={onRefresh}
        disabled={refreshing}
        activeOpacity={0.7}>
        <BannerButtonText>{refreshing ? 'Atualizando...' : 'Atualizar'}</BannerButtonText>
      </BannerButton>
    </BannerContainer>
  );
}
