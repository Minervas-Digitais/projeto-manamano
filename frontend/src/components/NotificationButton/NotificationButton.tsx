/* eslint-disable global-require */
import React, { useState } from 'react';
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

export default function NotificationButton({ text, font }: any) {
  const [isMoved, setIsMoved] = useState(false);
  const handleClick = () => {
    setIsMoved(!isMoved);
  };
  return (
    <NotifButtonContainer>
      <ConfigNotifText font={font}>{text}</ConfigNotifText>
      <PressableCustom onPress={handleClick} isMoved={isMoved}>
        {isMoved ? <EllipseW /> : <EllipseB />}
      </PressableCustom>
      <ButtonImage>{isMoved ? <RectActv /> : <Rect />}</ButtonImage>
    </NotifButtonContainer>
  );
}
