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

export default function NotificationButton({ text, font, isActive, onToggle }: any) {
  return (
    <NotifButtonContainer>
      <ConfigNotifText font={font}>{text}</ConfigNotifText>
      <PressableCustom onPress={onToggle} isMoved={isActive} testID={`toggle-${text.replace(/\s+/g, '-')}`}>
        {isActive ? <EllipseW testID={`EllipseW-${text.replace(/\s+/g, '-')}`} /> : <EllipseB testID={`EllipseB-${text.replace(/\s+/g, '-')}`} />}
      </PressableCustom>
      <ButtonImage>{isActive ? <RectActv testID={`RectActv-${text.replace(/\s+/g, '-')}`} /> : <Rect testID={`Rect-${text.replace(/\s+/g, '-')}`} />}</ButtonImage>
    </NotifButtonContainer>
  );
}
