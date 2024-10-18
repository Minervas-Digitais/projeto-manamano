import { useFonts } from 'expo-font';
import { View } from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import HeaderCustom from '../../components/HeaderCustom/HeaderCustom';
import InputTextCustom from '../../components/InputText/InputTextCustom';
import ErrorWarning from '../../components/ErrorWarning/ErrorWarning';
import ButtonCustom from '../../components/ButtonCustom/ButtonCustom';
import { SignInForm, SignInInputContainer } from '../SignIn/SignInStyle';

export default function EnterGroup() {
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
      <HeaderCustom font="inter-bold" text="Entrar em Grupo" />
      <SignInForm>
        <SignInInputContainer style={{ gap: 30 }}>
          <Controller
            control={control}
            name="groupcode"
            rules={{
              required: true,
            }}
            render={({ field: { onChange, value } }) => (
              <InputTextCustom
                onChangeText={onChange}
                value={value}
                label="Código de Convite"
                imageIcon={null}
              />
            )}
          />
          {errors.groupcode && <ErrorWarning errorText="Campo obrigatório" />}
          <ButtonCustom
            onPress={handleSubmit(onSubmit)}
            backColor="#160E47"
            fontColor="white"
            text="Entrar"
          />
        </SignInInputContainer>
      </SignInForm>
    </View>
  );
}
