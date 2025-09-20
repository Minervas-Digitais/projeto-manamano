import React from 'react';
import {
  ButtonImage,
  ConfigNotifText,
  NotifButtonContainer,
  PressableCustom,
} from './NotificationButtonStyle';
import EllipseB from '../../assets/ellipse-confignotf.svg';
import EllipseW from '../../assets/ellipsew.svg';
import Rect from '../../assets/rect-confignotif.svg';
import RectActv from '../../assets/rectactv-confignotif.svg';
import { Pressable } from 'react-native';

export default function NotificationButton({ text, font, isActive, onToggle }: any) {
  return (
    <Pressable onPress={onToggle}>
        <NotifButtonContainer >
        <ConfigNotifText font={font}>{text}</ConfigNotifText>
        <PressableCustom isMoved={isActive} testID={`toggle-${text.replace(/\s+/g, '-')}`}>
            {isActive ? <EllipseW width={32} testID={`EllipseW-${text.replace(/\s+/g, '-')}`} /> : <EllipseB  width={32}  testID={`EllipseB-${text.replace(/\s+/g, '-')}`} />}
        </PressableCustom>
        <ButtonImage>{isActive ? <RectActv testID={`RectActv-${text.replace(/\s+/g, '-')}`} /> : <Rect testID={`Rect-${text.replace(/\s+/g, '-')}`} />}</ButtonImage>
        </NotifButtonContainer>
    </Pressable>
  );
}
