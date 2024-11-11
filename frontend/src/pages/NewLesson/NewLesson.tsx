/* eslint-disable global-require */
import { useFonts } from 'expo-font';
import React, { useRef } from 'react';
import { ScrollView, View } from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import HeaderCustom from '../../components/HeaderCustom/HeaderCustom';
import { NewEventInputContainer, NewPostContainer } from '../NewPost/NewPostStyle';
import BigInputTextCustom from '../../components/BigInputText/BigInputText';
import ButtonCustom from '../../components/ButtonCustom/ButtonCustom';
import ErrorWarning from '../../components/ErrorWarning/ErrorWarning';
import { MiddlePart, NamePart } from '../EditProfile/EditProfileStyle';
import InputTextCustom from '../../components/InputText/InputTextCustom';
import { LessonBottomPartContainer, LinkPart } from './NewLessonStyle';
import ArchiveCard from '../../components/ArchiveCard/ArchiveCard';

export default function NewLesson() {
  const arrowIcon = require('../../assets/arrow-icon.svg');
  const linkIcon = require('../../assets/input-link-icon.svg');
  const calendarIcon = require('../../assets/calendar-icon.svg');
  const dateRef = useRef(null);
  const hourRef = useRef(null);
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({});
  const onSubmit = (data: any) => {
    // eslint-disable-next-line no-alert
    alert(JSON.stringify(data));
  };
  const validateDate = () => {
    const inputDate = new Date(dateRef.current.getRawValue());
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    if (!dateRef.current.isValid() || inputDate < currentDate) {
      return 'Data inválida';
    }
    return true;
  };
  const validateHour = () => {
    const inputDate = new Date(dateRef.current.getRawValue());
    const currentDate = new Date();
    const currentHours = currentDate.getHours();
    const currentMinutes = currentDate.getMinutes();
    const currentHourMin = `${currentHours}:${currentMinutes}`;
    const inputDateHours = new Date(hourRef.current.getRawValue());
    const inputHours = inputDateHours.getHours();
    const inputMinutes = inputDateHours.getMinutes();
    const inputHourMin = `${inputHours}:${inputMinutes}`;
    currentDate.setHours(0, 0, 0, 0);
    if (!hourRef.current.isValid()) {
      return 'Hora inválida';
    }
    if (inputDate.getTime() === currentDate.getTime() && currentHourMin > inputHourMin) {
      return 'Esta hora já passou';
    }
    return true;
  };
  const [fontsLoaded] = useFonts({
    'inter-regular': require('../../fonts/Inter-Regular.ttf'),
    'inter-semibold': require('../../fonts/Inter-SemiBold.ttf'),
    'inter-bold': require('../../fonts/Inter-Bold.ttf'),
  });
  if (!fontsLoaded) {
    return undefined;
  }
  return (
    <ScrollView
      style={{ backgroundColor: '#f2f6fa', minHeight: '100%' }}
      contentContainerStyle={{ minHeight: '100%' }}>
      {' '}
      <HeaderCustom font="inter-bold" text="Publicação" />
      <NewPostContainer>
        <NewEventInputContainer>
          <NamePart>
            <Controller
              control={control}
              name="title"
              rules={{
                required: 'Campo obrigatório',
              }}
              render={({ field: { onChange, value } }) => (
                <InputTextCustom
                  onChangeText={onChange}
                  value={value}
                  label="Título da aula"
                  imageIcon={null}
                />
              )}
            />
            {errors.title && <ErrorWarning errorText={errors.title.message} />}
          </NamePart>
          <MiddlePart>
            <View style={{ flex: 1, marginRight: `${6.27 / 2}vw` }}>
              <Controller
                control={control}
                name="date"
                rules={{
                  required: 'Campo Obrigatório',
                  validate: validateDate,
                }}
                render={({ field: { onChange, value } }) => (
                  <InputTextCustom
                    onChangeText={onChange}
                    value={value}
                    label="Data"
                    imageIcon={calendarIcon}
                    type="datetime"
                    options={{ format: 'DD/MM/YYYY' }}
                    innerRef={(value) => (dateRef.current = value)}
                  />
                )}
              />
              {errors.date && <ErrorWarning errorText={errors.date.message} />}
            </View>
            <View style={{ flex: 1, marginLeft: `${6.27 / 2}vw` }}>
              <Controller
                control={control}
                name="hour"
                rules={{
                  required: 'Campo Obrigatório',
                  validate: validateHour,
                }}
                render={({ field: { onChange, value } }) => (
                  <InputTextCustom
                    onChangeText={onChange}
                    value={value}
                    label="Horário"
                    imageIcon={null}
                    type="datetime"
                    options={{ format: 'HH:mm' }}
                    innerRef={(value: null) => (hourRef.current = value)}
                  />
                )}
              />
              {errors.hour && <ErrorWarning errorText={errors.hour.message} />}
            </View>
          </MiddlePart>
          <LinkPart>
            <Controller
              control={control}
              name="link"
              rules={{
                required: 'Campo obrigatório',
              }}
              render={({ field: { onChange, value } }) => (
                <InputTextCustom
                  onChangeText={onChange}
                  value={value}
                  label="Link"
                  imageIcon={linkIcon}
                />
              )}
            />
            {errors.link && <ErrorWarning errorText={errors.link.message} />}
            <Controller
              control={control}
              name="vod"
              rules={{
                required: 'Campo obrigatório',
              }}
              render={({ field: { onChange, value } }) => (
                <InputTextCustom
                  onChangeText={onChange}
                  value={value}
                  label="Aula gravada"
                  imageIcon={linkIcon}
                />
              )}
            />
            {errors.vod && <ErrorWarning errorText={errors.vod.message} />}
          </LinkPart>
          <LessonBottomPartContainer>
            <Controller
              control={control}
              name="description"
              rules={{
                required: true,
              }}
              render={({ field: { onChange, value } }) => (
                <BigInputTextCustom
                  onChangeText={onChange}
                  value={value}
                  imageIcon={null}
                  label="Descrição da aula"
                />
              )}
            />
            {errors.description && <ErrorWarning errorText="Campo obrigatório" />}
            <ScrollView
              showsHorizontalScrollIndicator={false}
              horizontal
              style={{ flex: 1, paddingBottom: 65, paddingTop: 65 }}
              contentContainerStyle={{ gap: 15, alignItems: 'center' }}>
              <ArchiveCard archive />
              <ArchiveCard archive />
              <ArchiveCard archive />
              <ArchiveCard archive />
              <ArchiveCard archive />
              <ArchiveCard />
            </ScrollView>
            <ButtonCustom
              onPress={handleSubmit(onSubmit)}
              backColor="#160E47"
              fontColor="white"
              text="Publicar"
              rightIcon={arrowIcon}
            />
          </LessonBottomPartContainer>
        </NewEventInputContainer>
      </NewPostContainer>
    </ScrollView>
  );
}
