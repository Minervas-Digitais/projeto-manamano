import { useFonts } from 'expo-font';
import { Controller, useForm } from 'react-hook-form';
import { View, Text } from 'react-native';
import HeaderCustom from '../../components/HeaderCustom/HeaderCustom';
import { SignInForm, SignInInputContainer } from '../SignIn/SignInStyle';
import InputTextCustom from '../../components/InputText/InputTextCustom';
import ButtonCustom from '../../components/ButtonCustom/ButtonCustom';
import ErrorWarning from '../../components/ErrorWarning/ErrorWarning';
import { RedText } from './GetInTouchStyle';

export default function GetInTouch() {
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
    // eslint-disable-next-line global-require
    'inter-bold': require('../../fonts/Inter-Bold.ttf'),
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
              <InputTextCustom
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
          />
          <RedText>
            * Sua mensagem será encaminhada para o e-mail do ManaMano. Portanto, caso necessário,
            confira seu e-mail para obter respostas.
          </RedText>
        </SignInInputContainer>
      </SignInForm>
    </View>
  );
}
