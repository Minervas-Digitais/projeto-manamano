import React, { ReactNode } from 'react';
import { Platform, StatusBar, StyleProp, View, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import HeaderCustom from '../HeaderCustom/HeaderCustom';

type HeaderProps = {
  font?: string;
  text: string;
  icon?: ReactNode;
  onPress?: () => void;
  onPressTitle?: () => void;
  menu?: boolean;
  testID?: string;
};

type ScreenWithHeaderProps = {
  headerProps: HeaderProps;
  children: ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
};

export default function ScreenWithHeader({
  headerProps,
  children,
  containerStyle,
  contentStyle,
}: ScreenWithHeaderProps) {
  return (
    <SafeAreaView
      edges={Platform.OS === 'android' ? ['left', 'right', 'bottom'] : ['left', 'right', 'top', 'bottom']}
      style={[{ flex: 1, backgroundColor: '#f2f6fa' }, containerStyle]}>
      <StatusBar hidden />
      <HeaderCustom {...headerProps} />
      <View style={[{ flex: 1 }, contentStyle]}>{children}</View>
    </SafeAreaView>
  );
}