/* eslint-disable global-require */
import { useFonts } from 'expo-font';
import { useState } from 'react';
import { TouchableOpacity, View, Image, Text } from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import SideMenu from '../../components/SideMenu/SideMenu';
import {
  BlueBackground,
  BottomPart,
  EditImageButton,
  MenuW,
  MiddlePart,
  NamePart,
  PencilButton,
  ProfilePic,
  UpperPart,
  WhiteBackground,
} from './EditProfileStyle';
import InputTextCustom from '../../components/InputText/InputTextCustom';
import ErrorWarning from '../../components/ErrorWarning/ErrorWarning';

export default function EditProfile() {
  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm({
    defaultValues: {
      whatsApp: '',
      fullName: '',
      dob: '',
      cpf: '',
      email: '',
      enterprise: '',
      bio: '',
    },
  });
  const onSubmit = (data: any) => {
    // eslint-disable-next-line no-alert
    alert(JSON.stringify(data));
  };
  const [sideMenu, setSideMenu] = useState(true);
  const menu = require('../../assets/menuw-icon.svg');
  const editButton = require('../../assets/edit-button.svg');
  const defaultProfImage = require('../../assets/test-profile-icon.png');
  const calendarIcon = require('../../assets/calendar-icon.svg');
  const profileData: any = [
    {
      profileImage: defaultProfImage,
      phoneNumber: '21912345678',
      pName: 'Maria Fernanda',
      email: 'marifer@gmail.com',
    },
  ];
  setValue('whatsApp', profileData[0].phoneNumber);
  setValue('fullName', profileData[0].pName);
  setValue('email', profileData[0].email);
  const [fontsLoaded] = useFonts({
    'inter-bold': require('../../fonts/Inter-Bold.ttf'),
  });
  if (!fontsLoaded) {
    return undefined;
  }
  return (
    <BlueBackground>
      <SideMenu display={sideMenu} onPress={() => setSideMenu(!sideMenu)} />
      <TouchableOpacity onPress={() => setSideMenu(!sideMenu)}>
        <MenuW source={menu} />
      </TouchableOpacity>
      <WhiteBackground>
        <UpperPart>
          <EditImageButton
            onPress={() => {
              alert('oi');
            }}
          />
          <ProfilePic source={profileData[0].profileImage} />
          <PencilButton source={editButton} />
          <Controller
            control={control}
            name="whatsApp"
            rules={{
              required: true,
            }}
            render={({ field: { onChange, value } }) => (
              <InputTextCustom
                onChangeText={onChange}
                value={value}
                label="Telefone"
                imageIcon={null}
                type="cel-phone"
              />
            )}
          />
          {errors.whatsApp && <ErrorWarning errorText="Campo obrigatório" />}
        </UpperPart>
        <View style={{ gap: '3.5vw' }}>
          <NamePart>
            <Controller
              control={control}
              name="fullName"
              rules={{
                required: true,
              }}
              render={({ field: { onChange, value } }) => (
                <InputTextCustom
                  onChangeText={onChange}
                  value={value}
                  label="Nome"
                  imageIcon={null}
                />
              )}
            />
            {errors.fullName && <ErrorWarning errorText="Campo obrigatório" />}
          </NamePart>
          <MiddlePart>
            <View style={{ flex: 1, marginRight: `${6.27 / 2}vw` }}>
              <Controller
                control={control}
                name="dob"
                rules={{
                  required: true,
                }}
                render={({ field: { onChange, value } }) => (
                  <InputTextCustom
                    onChangeText={onChange}
                    value={value}
                    label="Data de Nascimento"
                    imageIcon={calendarIcon}
                    type="datetime"
                    options={{ format: 'DD/MM/YYYY' }}
                  />
                )}
              />
              {errors.dob && <ErrorWarning errorText="Campo obrigatório" />}
            </View>
            <View style={{ flex: 1, marginLeft: `${6.27 / 2}vw` }}>
              <Controller
                control={control}
                name="cpf"
                rules={{
                  required: true,
                }}
                render={({ field: { onChange, value } }) => (
                  <InputTextCustom
                    onChangeText={onChange}
                    value={value}
                    label="CPF"
                    imageIcon={null}
                    type="cpf"
                  />
                )}
              />
              {errors.cpf && <ErrorWarning errorText="Campo obrigatório" />}
            </View>
          </MiddlePart>
          <BottomPart>
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
                  imageIcon={null}
                />
              )}
            />
            {errors.email && <ErrorWarning errorText="Campo obrigatório" />}
            <Controller
              control={control}
              name="bio"
              rules={{
                required: true,
              }}
              render={({ field: { onChange, value } }) => (
                <InputTextCustom
                  onChangeText={onChange}
                  value={value}
                  label="Bio"
                  imageIcon={null}
                />
              )}
            />
            {errors.bio && <ErrorWarning errorText="Campo obrigatório" />}
            <Controller
              control={control}
              name="enterprise"
              rules={{
                required: true,
              }}
              render={({ field: { onChange, value } }) => (
                <InputTextCustom
                  onChangeText={onChange}
                  value={value}
                  label="Empreendimento"
                  imageIcon={null}
                />
              )}
            />
            {errors.enterprise && <ErrorWarning errorText="Campo obrigatório" />}
          </BottomPart>
        </View>
      </WhiteBackground>
    </BlueBackground>
  );
}
