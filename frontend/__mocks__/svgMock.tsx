import React from 'react';

// Semelhantemente ao fileMock.ts, mas especificamente para SVGs
// que o jest precisa que seja mockado para realizar os testes

const SvgMock = React.forwardRef<HTMLSpanElement, React.ComponentProps<'span'>>((props, ref) => (
  <span ref={ref} {...props} />
));

export default SvgMock;
