/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-alert */
/* eslint-disable global-require */
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useFonts } from 'expo-font';
import { Image, StatusBar, View } from 'react-native';
import { MMKV } from 'react-native-mmkv';
import ErrorWarning from '../../components/ErrorWarning/ErrorWarning';
import { SignInContainer, SignInForm, SignInInputContainer } from './SignInStyle';
import ButtonCustom from '../../components/ButtonCustom/ButtonCustom';
import InputTextCustom from '../../components/InputText/InputTextCustom';
import BackButton from '../../components/BackButton/BackButton';
import api from '../../services/api';
import IconEmail from '../../assets/e-mail-icon.svg';
import IconPassword from '../../assets/lock-icon.svg';
import ManaManoLogo from '../../assets/logo-boas-vindas.svg';
import { registerForPushNotificationsAsync } from '../../hooks/useNotification';

export const storage = new MMKV();

export default function SignIn({ navigation }: any) {
    storage.clearAll();
    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm({});
    const onSubmit = (data: any) => {
        api.post('/auth/login', data)
            .then(async (res) => {
                if (res.data.accessToken) {
                    alert(res.data.accessToken);
                    alert(res.data.loggedId);
                    storage.set('accessToken', res?.data.accessToken);
                    storage.set('loggedId', res?.data.loggedId);

                    const pushToken = await registerForPushNotificationsAsync();

                    if (pushToken) {
                        try {
                            await api.post(
                                '/notifications/register-token',
                                { pushNotifToken: pushToken },
                                {
                                    headers: {
                                        Authorization: `Bearer ${res.data.accessToken}`,
                                    },
                                }
                            );
                        } catch (error) {
                            console.error('Erro ao enviar push token para o backend:', error);
                        }
                    }

                    navigation.navigate('Home');
                } else {
                    alert('E-mail ou senha incorretos');
                }
            })
            .catch((error) => {
                console.error('Erro ao fazer login:', error);
                alert('Erro ao conectar com o servidor. Verifique sua conexão e tente novamente.');
            });

    };

    const [fontsLoaded] = useFonts({
        'inter-bold': require('../../fonts/Inter-Bold.ttf'),
    });
    if (!fontsLoaded) {
        return undefined;
    }

    return (
        <SignInContainer>
            <StatusBar backgroundColor="black" />
            <SignInForm>
                <View style={{ gap: 45 }}>
                    <BackButton />
                    <ManaManoLogo />
                    <SignInInputContainer>
                        <Controller
                            control={control}
                            name="email"
                            rules={{
                                required: true,
                            }}
                            render={({ field: { onChange, value } }) => (
                                <InputTextCustom
                                    onChangeText={onChange}
                                    value={value}
                                    label="E-mail"
                                    imageIcon={<IconEmail />}
                                />
                            )}
                        />
                        {errors.email && <ErrorWarning errorText="Campo obrigatório" />}
                        <Controller
                            control={control}
                            name="password"
                            rules={{
                                required: true,
                            }}
                            render={({ field: { onChange, value } }) => (
                                <InputTextCustom
                                    onChangeText={onChange}
                                    value={value}
                                    label="Senha"
                                    imageIcon={<IconPassword />}
                                    isPassword
                                />
                            )}
                        />
                        {errors.password && <ErrorWarning errorText="Campo obrigatório" />}
                    </SignInInputContainer>
                </View>
                <ButtonCustom
                    onPress={handleSubmit(onSubmit)}
                    backColor="transparent"
                    fontColor="#160E47"
                    text="Entrar"
                    border
                />
            </SignInForm>
        </SignInContainer>
    );
}
