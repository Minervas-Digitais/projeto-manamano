/* eslint-disable global-require */
import { useFonts } from 'expo-font';
import { useRef, useState, useEffect } from 'react';
import { TouchableOpacity, View, Dimensions } from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import { format } from 'date-fns';
import React from 'react';
import { storage } from '../SignIn/SignIn';
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
import api from '../../services/api';
import Menu from '../../assets/menuw-icon.svg';
import EditButton from '../../assets/edit-button.svg';
import CalendarIcon from '../../assets/calendar-icon.svg';
import { StatusBar } from 'expo-status-bar';
import { TextInputMask } from 'react-native-masked-text';

export default function EditProfile() {
  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm({
    defaultValues: {
      phone: '',
      fullName: '',
      birthday: '',
      email: '',
      enterprise: '',
      bio: '',
      ethnicity: '',
      expertise: '',
      neighborhood: '',
    },
    mode: 'onSubmit',
  });
  const { width, height } = Dimensions.get('window');
  const onSubmit = async (data: any) => {
    try {
      console.log('Form submitted with data:', data);

      // Convert birthday to ISO string (if it's not already)
      if (data.birthday) {
        const [day, month, year] = data.birthday.split('/');
        const formattedBirthday = new Date(`${year}-${month}-${day}`).toISOString();
        data.birthday = formattedBirthday;
      }

      const token = storage.getString('accessToken');
      const userId = storage.getString('loggedId');

      if (!token || !userId) {
        console.log('Missing token or user ID.');
        alert('No access token or user ID found. Please sign in again.');
        return;
      }

      console.log('Sending request to API...');
      const response = await api.patch(`/user/${userId}`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log('API response:', response.data);
      alert('Changes saved successfully!');
    } catch (error: any) {
      console.error('Error saving user data:', error);
      if (error.response && error.response.data) {
        console.error('Error response from API:', error.response.data);
        alert('Failed to save data: ' + (error.response.data.message || 'Unknown error'));
      } else {
        alert('There was an error saving your changes. Please try again.');
      }
    }
  };
  const cpfInputRef = useRef(null);
  const phoneInputRef = useRef<TextInputMask | null>(null);

  const validatePhoneNumber = (value: string) => {
    if (phoneInputRef.current) {
      // Ser visto com mais cuidado!!!
      const rawValue = (phoneInputRef.current as any).getRawValue();
      if (rawValue.length < 11) {
        return 'Telefone inválido';
      }
    }
    return true;
  };

  const [sideMenu, setSideMenu] = useState(true);
  const [profileData, setProfileData] = useState<any>(null);

  const defaultProfImage = require('../../assets/test-profile-icon.png');

  const formatDateToDDMMYYYY = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, 'dd/MM/yyyy'); // Using date-fns for formatting (optional)
  };

  useEffect(() => {
    const token = storage.getString('accessToken');
    const userId = storage.getString('loggedId');

    if (token && userId) {
      const fetchUser = async () => {
        try {
          const response = await api.get(`/user/${userId}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          const userData = response.data;

          const profileInfo = {
            profileImage: defaultProfImage,
            phone: userData.phone || '',
            fullName: userData.fullName || '',
            email: userData.email || '',
            ethnicity: userData.ethnicity || '',
            birthday: userData.birthday ? formatDateToDDMMYYYY(userData.birthday) : '',
            bio: userData.bio || '',
            expertise: userData.expertise || '',
            neighborhood: userData.neighborhood || '',
            enterprise: userData.enterprise || '',
          };

          setProfileData(profileInfo);

          setValue('phone', profileInfo.phone);
          setValue('fullName', profileInfo.fullName);
          setValue('email', profileInfo.email);
          setValue('birthday', profileInfo.birthday);
          setValue('enterprise', profileInfo.enterprise);
          setValue('bio', profileInfo.bio);
          setValue('ethnicity', profileInfo.ethnicity);
          setValue('expertise', profileInfo.expertise);
          setValue('neighborhood', profileInfo.neighborhood);
        } catch (error) {
          console.error('Erro ao buscar os dados do usuário:', error);
        }
      };

      fetchUser();
    }
  }, []);

  const [fontsLoaded] = useFonts({
    'inter-bold': require('../../fonts/Inter-Bold.ttf'),
  });
  if (!fontsLoaded) {
    return undefined;
  }

  return (
    <BlueBackground>
      <StatusBar />
      <SideMenu display={sideMenu} onPress={() => setSideMenu(!sideMenu)} />
      <TouchableOpacity onPress={() => setSideMenu(!sideMenu)}>
        <MenuW>
          <Menu width={24} height={24} />
        </MenuW>
      </TouchableOpacity>
      <WhiteBackground>
        <UpperPart>
          <EditImageButton
            onPress={() => {
              // eslint-disable-next-line no-alert
              alert('teste');
            }}
          />
          <ProfilePic source={profileData ? profileData.profileImage : defaultProfImage} />
          <PencilButton>
            <TouchableOpacity onPress={() => {}}>
              <EditButton width={24} height={24} />
            </TouchableOpacity>
          </PencilButton>
          <Controller
            control={control}
            name="phone"
            render={({ field: { onChange, value } }) => (
              <InputTextCustom
                onChangeText={onChange}
                value={value}
                label="Telefone"
                imageIcon={null}
                type="cel-phone"
                innerRef={(value: TextInputMask) => (phoneInputRef.current = value)}
              />
            )}
            rules={{
              required: 'Telefone obrigatório!',
              validate: validatePhoneNumber,
            }}
          />
          {errors.phone && <ErrorWarning errorText={errors.phone.message} />}
        </UpperPart>
        <View style={{ gap: width * 0.035, marginBottom: 10 }}>
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
            <Controller
              control={control}
              name="birthday"
              rules={{
                required: true,
              }}
              render={({ field: { onChange, value } }) => (
                <InputTextCustom
                  onChangeText={onChange}
                  value={value}
                  label="Data de Nascimento"
                  imageIcon={<CalendarIcon width={15} height={15} />}
                  type="datetime"
                  options={{ format: 'DD/MM/YYYY' }}
                />
              )}
            />
            {errors.birthday && <ErrorWarning errorText="Campo obrigatório" />}
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
              name="neighborhood"
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
              onPress={handleSubmit(
                (data) => {
                  console.log('Form is being submitted...');
                  console.log('handleSubmit called with data:', data);
                  onSubmit(data); // Directly call onSubmit after handleSubmit
                },
                (errors) => {
                  const errorMessages = Object.values(errors)
                    .map((error) => error.message)
                    .join('\n');

                  if (errorMessages) {
                    alert(`Erros:\n${errorMessages}`);
                  } else {
                    alert('A submissão falhou por erros desconhecidos.');
                  }

                  console.log('Form submission failed due to validation errors:', errors);
                },
              )}
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
