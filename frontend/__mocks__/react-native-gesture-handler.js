// Mock dos componentes do react-native-gesture-handler para evitar erros nos testes,
// Esses mocks simplificam a renderização, pois os gestos não são testados e podem causar error.


import React from "react"

const PanGestureHandler = React.forwardRef(({ children }, ref) => {
  return <>{children}</>;
});

module.exports = {
    PanGestureHandler,
    GestureHandlerRootView: ({ children }) => children,
    Swipeable: () => null,
    DrawerLayout: () => null,
    State: {},
};
