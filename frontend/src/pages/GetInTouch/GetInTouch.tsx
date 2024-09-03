/* eslint-disable global-require */
import { useFonts } from 'expo-font';
import { Controller, useForm } from 'react-hook-form';
import { View } from 'react-native';
import HeaderCustom from '../../components/HeaderCustom/HeaderCustom';
import { SignInForm, SignInInputContainer } from '../SignIn/SignInStyle';
import InputTextCustom from '../../components/InputText/InputTextCustom';
import ButtonCustom from '../../components/ButtonCustom/ButtonCustom';
import ErrorWarning from '../../components/ErrorWarning/ErrorWarning';
import { RedText, SemiBoldRedText } from './GetInTouchStyle';
import BigInputTextCustom from '../../components/BigInputText/BigInputText';

export default function GetInTouch() {
  const arrowIcon = require('../../assets/arrow-icon.svg');
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({});
  const onSubmit = (data: any) => {
    // eslint-disable-next-line no-alert
    alert(JSON.stringify(data));
  };
  const [fontsLoaded] = useFonts({
    'inter-regular': require('../../fonts/Inter-Regular.ttf'),
    'inter-semibold': require('../../fonts/Inter-SemiBold.ttf'),
  });
  if (!fontsLoaded) {
    return undefined;
  }
  return (
    <View style={{ flex: 1, backgroundColor: '#f2f6fa' }}>
      <HeaderCustom font="inter-bold" text="Fale Conosco" />
      <SignInForm>
        <SignInInputContainer style={{ gap: 30 }}>
          <Controller
            control={control}
            name="subject"
            rules={{
              required: true,
            }}
            render={({ field: { onChange, value } }) => (
              <InputTextCustom
                onChangeText={onChange}
                value={value}
                label="Assunto"
                imageIcon={null}
              />
            )}
          />
          {errors.subject && <ErrorWarning errorText="Campo obrigatório" />}
          <Controller
            control={control}
            name="getintouch"
            rules={{
              required: true,
            }}
            render={({ field: { onChange, value } }) => (
              <BigInputTextCustom
                onChangeText={onChange}
                value={value}
                label="Mensagem"
                imageIcon={null}
              />
            )}
          />
          {errors.getintouch && <ErrorWarning errorText="Campo obrigatório" />}
          <ButtonCustom
            onPress={handleSubmit(onSubmit)}
            backColor="#160E47"
            fontColor="white"
            text="Enviar"
            rightIcon={arrowIcon}
          />
          <RedText>
            * Sua mensagem será
            <SemiBoldRedText> encaminhada </SemiBoldRedText>
            para o <SemiBoldRedText>e-mail do ManaMano.</SemiBoldRedText> Portanto, caso necessário,{' '}
            <SemiBoldRedText>confira seu e-mail para obter respostas. </SemiBoldRedText>
          </RedText>
        </SignInInputContainer>
      </SignInForm>
    </View>
  );
}
