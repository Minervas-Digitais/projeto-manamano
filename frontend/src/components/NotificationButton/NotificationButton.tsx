/* eslint-disable global-require */
import React, { useState } from 'react';
import { Image } from 'react-native';
import {
  ButtonImage,
  ConfigNotifText,
  NotifButtonContainer,
  PressableCustom,
} from './NotificationButtonStyle';

export default function NotificationButton({ text, font }: any) {
  const ellipseb = require('../../assets/ellipse-confignotf.svg');
  const ellipsew = require('../../assets/ellipsew.svg');
  const rect = require('../../assets/rect-confignotif.svg');
  const rectactv = require('../../assets/rectactv-confignotif.svg');
  const [isMoved, setIsMoved] = useState(false);
  const handleClick = () => {
    setIsMoved(!isMoved);
  };
  return (
    <NotifButtonContainer>
      <ConfigNotifText font={font}>{text}</ConfigNotifText>
      <PressableCustom onPress={handleClick} isMoved={isMoved}>
        <Image source={isMoved ? ellipsew : ellipseb} style={{ transform: 'translateY(0.25vh)' }} />
      </PressableCustom>
      <ButtonImage source={isMoved ? rectactv : rect} />
    </NotifButtonContainer>
  );
}
