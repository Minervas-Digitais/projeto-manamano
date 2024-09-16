/* eslint-disable global-require */
import { useFonts } from 'expo-font';
import { useState } from 'react';
import { TouchableOpacity, View } from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import DropdownComponent from '../../components/DropdownButton/DropdownCustom';
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
import ButtonCustom from '../../components/ButtonCustom/ButtonCustom';
import { district, ethnicity, expertise } from './EditProfileData';
import BigInputTextCustom from '../../components/BigInputText/BigInputText';

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
      ethnicity: '',
      expertise: '',
      district: '',
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
  const profileData: any = {
    profileImage: defaultProfImage,
    phoneNumber: '21912345678',
    pName: 'Maria Fernanda',
    email: 'marifer@gmail.com',
    ethnicity: '2',
    dob: '15/09/1990',
    cpf: '12345678900',
    bio: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam eget ligula eu lectus lobortis condimentum. Aliquam nonummy auctor massa. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Nulla at risus. Quisque purus magna, auctor et, sagittis ac, posuere eu, lectus. Nam mattis, felis ut adipiscing',
    expertise: '3',
    district: '1',
    enterprise: 'Confeitaria da Maria',
  };
  setValue('whatsApp', profileData.phoneNumber);
  setValue('fullName', profileData.pName);
  setValue('email', profileData.email);
  setValue('dob', profileData.dob);
  setValue('cpf', profileData.cpf);
  setValue('enterprise', profileData.enterprise);
  setValue('bio', profileData.bio);
  setValue('ethnicity', profileData.ethnicity);
  setValue('expertise', profileData.expertise);
  setValue('district', profileData.district);
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
              // eslint-disable-next-line no-alert
              alert('teste');
            }}
          />
          <ProfilePic source={profileData.profileImage} />
          <PencilButton source={editButton} />
          <Controller
            control={control}
            name="whatsApp"
            rules={{
              pattern: {
                value: /^[0-9]+$/,
                message: 'Telefone inválido',
              },
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
          {errors.whatsApp && <ErrorWarning errorText={errors.whatsApp.message} />}
        </UpperPart>
        <View style={{ gap: '3.5vw', marginBottom: 10 }}>
          <NamePart>
            <Controller
              control={control}
              name="fullName"
              rules={{
                required: 'Campo obrigatório',
                pattern: {
                  value: /^[A-Za-z\s]+$/,
                  message: 'Apenas letras são permitidas',
                },
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
            {errors.fullName && <ErrorWarning errorText={errors.fullName.message} />}
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
                  pattern: {
                    value: /^[0-9]+$/,
                    message: 'CPF inválido',
                  },
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
              {errors.cpf && <ErrorWarning errorText={errors.cpf.message} />}
            </View>
          </MiddlePart>
          <BottomPart>
            <Controller
              control={control}
              name="email"
              rules={{
                required: 'Campo obrigatório',
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: 'Endereço de e-mail inválido',
                },
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
            {errors.email && <ErrorWarning errorText={errors.email.message} />}
            <Controller
              control={control}
              name="ethnicity"
              rules={{
                required: true,
              }}
              render={({ field: { onChange, value } }) => (
                <DropdownComponent
                  data={ethnicity}
                  label="Etnia"
                  onChange={onChange}
                  value={value}
                />
              )}
            />
            <Controller
              control={control}
              name="expertise"
              rules={{
                required: true,
              }}
              render={({ field: { onChange, value } }) => (
                <DropdownComponent
                  data={expertise}
                  label="Especialidade"
                  onChange={onChange}
                  value={value}
                />
              )}
            />
            <Controller
              control={control}
              name="district"
              rules={{
                required: true,
              }}
              render={({ field: { onChange, value } }) => (
                <DropdownComponent
                  data={district}
                  label="Bairro"
                  onChange={onChange}
                  value={value}
                />
              )}
            />
            <Controller
              control={control}
              name="bio"
              rules={{
                maxLength: { value: 500, message: 'Excedido o máximo de caracteres' },
              }}
              render={({ field: { onChange, value } }) => (
                <BigInputTextCustom
                  onChangeText={onChange}
                  value={value}
                  label="Bio"
                  imageIcon={null}
                />
              )}
            />
            {errors.bio && <ErrorWarning errorText={errors.bio.message} />}
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
            <ButtonCustom
              onPress={handleSubmit(onSubmit)}
              backColor="#32936F"
              fontColor="white"
              text="Salvar"
            />
          </BottomPart>
        </View>
      </WhiteBackground>
    </BlueBackground>
  );
}
