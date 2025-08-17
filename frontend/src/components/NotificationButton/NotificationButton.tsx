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
      <PressableCustom onPress={handleClick} isMoved={isMoved} testID={`toggle-${text.replace(/\s+/g, '-')}`}>
        {isMoved ? <EllipseW testID={`EllipseW-${text.replace(/\s+/g, '-')}`} /> : <EllipseB testID={`EllipseB-${text.replace(/\s+/g, '-')}`}/>}
      </PressableCustom>
      <ButtonImage>{isMoved ? <RectActv testID={`RectActv-${text.replace(/\s+/g, '-')}`} /> : <Rect testID={`Rect-${text.replace(/\s+/g, '-')}`} />}</ButtonImage>
    </NotifButtonContainer>
  );
}
