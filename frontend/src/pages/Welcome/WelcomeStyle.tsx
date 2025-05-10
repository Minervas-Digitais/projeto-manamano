import styled from 'styled-components/native';
import Logo from '../../assets/logo-boas-vindas.svg';
import manamanoPattern from '../../assets/Manamano-pattern-random.svg';

export const RectContainer = styled.View`
  padding-top: 40px;
  padding-bottom: 40px;
  align-items: center;
  justify-content: space-between;
  align-self: center;
  background-color: #fff;
  border-radius: 20px;
  width: 90%;
  height: 75%;
  gap: 10px;
`;
export const ButtomContainer = styled.View`
  width: 90%;
  gap: 20px;
`;
export const LogoSVG = styled(Logo)``;

export const ManamanoPattern = styled(manamanoPattern)``;

export const WelcomeContainer = styled.View`
  flex: 1;
  background-color: #160e47;
  justify-content: center;
`;

export const PatternWrapper = styled.View`
  position: absolute;
  top: 0;
  left: 0;
  z-index: 0;
  width: 100%;
  height: 100%;
`;
