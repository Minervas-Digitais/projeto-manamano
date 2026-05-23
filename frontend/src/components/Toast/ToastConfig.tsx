import React from 'react';
import styled from 'styled-components/native';

const ToastContainer = styled.View`
  border-width: 2px;
  border-color: rgba(141, 140, 140, 0.2);
  border-left-width: 5px;
  border-left-color: #160e47;
  background-color: #ffffff;
  padding: 15px;
  border-radius: 8px;
  width: 90%;
`;

const ToastText1 = styled.Text`
  font-family: 'inter-bold';
  font-size: 16px;
  color: #160e47;
`;

const ToastText2 = styled.Text`
  font-family: 'inter-regular';
  font-size: 14px;
  color: #160e47;
`;

export const toastConfig = {
  success: ({ text1, text2, ...rest }: any) => (
    <ToastContainer {...rest}>
      <ToastText1>{text1}</ToastText1>
      {text2 ? <ToastText2>{text2}</ToastText2> : null}
    </ToastContainer>
  ),
  error: ({ text1, text2, ...rest }: any) => (
    <ToastContainer {...rest}>
      <ToastText1>{text1}</ToastText1>
      {text2 ? <ToastText2>{text2}</ToastText2> : null}
    </ToastContainer>
  ),
};
