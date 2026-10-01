import React from 'react';
import styled from 'styled-components/native';

const ToastContainer = styled.View`
  flex-direction: row;
  align-items: stretch;
  border-width: 2px;
  border-color: rgba(141, 140, 140, 0.2);
  background-color: #ffffff;
  padding: 15px;
  border-radius: 8px;
  width: 90%;
`;

const AccentBar = styled.View<{ color: string }>`
  width: 5px;
  border-radius: 3px;
  background-color: ${(props) => props.color};
  margin-right: 12px;
`;

const ToastContent = styled.View`
  flex: 1;
  justify-content: center;
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
      <AccentBar color="#160e47" />
      <ToastContent>
        <ToastText1>{text1}</ToastText1>
        {text2 ? <ToastText2>{text2}</ToastText2> : null}
      </ToastContent>
    </ToastContainer>
  ),
  error: ({ text1, text2, ...rest }: any) => (
    <ToastContainer {...rest}>
      <AccentBar color="#EF4036" />
      <ToastContent>
        <ToastText1>{text1}</ToastText1>
        {text2 ? <ToastText2>{text2}</ToastText2> : null}
      </ToastContent>
    </ToastContainer>
  ),
  warning: ({ text1, text2, ...rest }: any) => (
    <ToastContainer {...rest}>
      {text2 && <AccentBar color="#e6a817" />}
      <ToastContent>
        <ToastText1>{text1}</ToastText1>
        {text2 ? <ToastText2>{text2}</ToastText2> : null}
      </ToastContent>
    </ToastContainer>
  ),
  info: ({ text1, text2, ...rest }: any) => (
    <ToastContainer {...rest}>
      <AccentBar color="#2d9cdb" />
      <ToastContent>
        <ToastText1>{text1}</ToastText1>
        {text2 ? <ToastText2>{text2}</ToastText2> : null}
      </ToastContent>
    </ToastContainer>
  ),
};
