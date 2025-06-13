import React from 'react';

const SvgMock = React.forwardRef<
  HTMLSpanElement, 
  React.ComponentProps<'span'>
>((props, ref) => <span ref={ref} {...props} />);

export default SvgMock;