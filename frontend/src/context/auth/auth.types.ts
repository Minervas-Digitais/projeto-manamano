export type AuthContextType = {
  accessToken: string | null;
  loggedId: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};
