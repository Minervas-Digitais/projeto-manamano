/* eslint-disable import/prefer-default-export */
import { createContext } from 'react';
import { AuthContextType } from './auth.types';

export const AuthContext = createContext<AuthContextType>({} as AuthContextType);
