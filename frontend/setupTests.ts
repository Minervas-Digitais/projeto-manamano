jest.mock('expo-secure-store', () => ({
  setItemAsync: jest.fn(async () => undefined),
  getItemAsync: jest.fn(async () => null),
  deleteItemAsync: jest.fn(async () => undefined),
}));

// HeaderCustom (usado por quase toda tela) chama useSideMenu, que exige
// SideMenuProvider. Os testes renderizam telas isoladas, sem o provider do
// App — então fornecemos um fallback aqui
jest.mock('./src/context/SideMenuContext', () => {
  const noop = () => undefined;
  return {
    SideMenuProvider: ({ children }: { children: any }) => children,
    useSideMenu: () => ({ isOpen: false, openMenu: noop, closeMenu: noop, toggleMenu: noop }),
  };
});

(global as any).alert = jest.fn();
