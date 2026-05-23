/* eslint-disable import/prefer-default-export */
import { useContext } from 'react';
import { AuthContext } from './AuthContext';

export function useAuth() {
  return useContext(AuthContext);
}
