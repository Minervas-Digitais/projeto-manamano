/* eslint-disable global-require */
import React, { useState } from 'react';
import { Pressable, Image } from 'react-native';
import { ConfigNotifText, NotifButtonContainer } from './NotificationButtonStyle';

export default function NotificationButton({ text, font }: any) {
  const ellipse = require('../../assets/ellipse-confignotf.svg');
  const rect = require('../../assets/rect-confignotif.svg');
  const [isMoved, setIsMoved] = useState(false);
  const handleClick = () => {
    setIsMoved(!isMoved);
  };
  return (
    <NotifButtonContainer>
      <ConfigNotifText font={font}>{text}</ConfigNotifText>
      <Pressable
        onPress={handleClick}
        style={{
          transform: `translateX(${isMoved ? 28 : 0}px)`,
          position: 'absolute',
        }}>
        <Image source={ellipse} style={{ marginLeft: '80vw', transform: `translateY(0.25vh)` }} />
      </Pressable>
      <Image source={rect} style={{ position: 'absolute', marginLeft: '80vw' }} />
    </NotifButtonContainer>
  );
}
