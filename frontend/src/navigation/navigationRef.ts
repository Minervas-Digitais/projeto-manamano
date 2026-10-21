/* eslint-disable import/prefer-default-export */
import { createNavigationContainerRef } from '@react-navigation/native';

// Referência global de navegação, usada para reagir a eventos que acontecem
// fora de uma tela (ex.: sessão encerrada pelo servidor).
export const navigationRef = createNavigationContainerRef();
