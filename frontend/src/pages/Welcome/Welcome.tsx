/* eslint-disable react/jsx-closing-bracket-location */
/* eslint-disable global-require */
import { Image, ImageBackground, StyleSheet } from 'react-native';
import React from 'react';
import { ButtomContainer, RectContainer } from './WelcomeStyle';
import ButtonCustom from '../../components/ButtonCustom/ButtonCustom';

export default function WelcomeScreen({ navigation: { navigate } }) {
  const manamanoPattern = require('../../assets/Manamano-pattern-random.svg');
  const Logo = require('../../assets/logo-boas-vindas.svg');

  return (
    <ImageBackground
      source={manamanoPattern}
      style={styles.backg}
      imageStyle={styles.backgroundImage}>
      <RectContainer>
        <Image source={Logo} style={styles.logo} />
        <ButtomContainer>
          <ButtonCustom
            onPress={() => navigation.navigate('SignUp')}
            backColor="#160E47"
            fontColor="#FFF"
            text="Cadastre-se"
            border
          />
          <ButtonCustom
            onPress={() => navigation.navigate('SignIn')}
            backColor="transparent"
            fontColor="#160E47"
            text="Entrar"
            border
          />
        </ButtomContainer>
      </RectContainer>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    resizeMode: 'repeat',
  },
  logo: {
    top: '-25%',
  },
  backg: {
    backgroundColor: '#160e47',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
  },
});
