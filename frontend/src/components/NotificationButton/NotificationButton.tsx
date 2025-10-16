import React from 'react';
import {
  ButtonImage,
  ConfigNotifText,
  NotifButtonContainer,
  ToggleThumbContainer,
} from './NotificationButtonStyle';
import EllipseB from '../../assets/ellipse-confignotf.svg';
import EllipseW from '../../assets/ellipsew.svg';
import Rect from '../../assets/rect-confignotif.svg';
import RectActv from '../../assets/rectactv-confignotif.svg';
import { Pressable } from 'react-native';

export default function NotificationButton({ text, font, isActive, onToggle }: any) {
  return (
    <Pressable onPress={onToggle}>
      <NotifButtonContainer>
        <ConfigNotifText font={font}>{text}</ConfigNotifText>
        <ToggleThumbContainer
          isMoved={isActive}
          testID={`toggle-${text.replace(/\s+/g, '-')}`}
          pointerEvents="box-none">
          {isActive ? (
            <EllipseW
              width={32}
              testID={`EllipseW-${text.replace(/\s+/g, '-')}`}
              pointerEvents="box-none"
            />
          ) : (
            <EllipseB
              pointerEvents="box-none"
              width={32}
              testID={`EllipseB-${text.replace(/\s+/g, '-')}`}
            />
          )}
        </ToggleThumbContainer>
        <ButtonImage>
          {isActive ? (
            <RectActv testID={`RectActv-${text.replace(/\s+/g, '-')}`} />
          ) : (
            <Rect testID={`Rect-${text.replace(/\s+/g, '-')}`} />
          )}
        </ButtonImage>
      </NotifButtonContainer>
    </Pressable>
  );
}
