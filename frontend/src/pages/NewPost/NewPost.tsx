/* eslint-disable global-require */
import { useFonts } from 'expo-font';
import React, { useRef, useState } from 'react';
import { Image, View } from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import HeaderCustom from '../../components/HeaderCustom/HeaderCustom';
import CategoryButton from '../../components/CategoryButton/CategoryButton';
import { GroupPageCategoryContainer, GroupPageCategoryList } from '../GroupPage/GroupPageStyle';
import { GroupDataText } from '../GroupData/GroupDataStyle';
import {
  BottomPartContainer,
  LinkIcon,
  NewEventInputContainer,
  NewPostContainer,
  NewPostInputContainer,
  NewPostInputTextContainer,
} from './NewPostStyle';
import BigInputTextCustom from '../../components/BigInputText/BigInputText';
import ButtonCustom from '../../components/ButtonCustom/ButtonCustom';
import ErrorWarning from '../../components/ErrorWarning/ErrorWarning';
import { MiddlePart, NamePart } from '../EditProfile/EditProfileStyle';
import InputTextCustom from '../../components/InputText/InputTextCustom';

export default function NewPost() {
  const arrowIcon = require('../../assets/arrow-icon.svg');
  const linkIcon = require('../../assets/comment-link-icon.svg');
  const calendarIcon = require('../../assets/calendar-icon.svg');
  const [filterPosts, setFilterPosts] = useState('Geral');
  const dateRef = useRef(null);
  const hourRef = useRef(null);
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({});
  const onSubmit = (data: any) => {
    let filteredData;
    if (filterPosts === 'Geral') {
      filteredData = {
        type: filterPosts,
        input: data.input,
      };
    } else {
      const datetimeISO = `${data.date}T${data.hour}Z`;
      filteredData = {
        type: filterPosts,
        title: data.title,
        datetime: datetimeISO,
        description: data.description,
      };
    }
    // eslint-disable-next-line no-alert
    alert(JSON.stringify(filteredData));
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
    <View style={{ backgroundColor: '#f2f6fa', height: '100%' }}>
      <HeaderCustom font="inter-bold" text="Publicação" />
      <NewPostContainer>
        <GroupPageCategoryContainer>
          <GroupDataText color="#4E4E4E" font="inter-semiBold" size="18px">
            Categorias
          </GroupDataText>
          <GroupPageCategoryList>
            <CategoryButton
              categoryName="Geral"
              onPress={() => {
                setFilterPosts('Geral');
              }}
              filter={filterPosts}
            />
            <CategoryButton
              categoryName="Eventos"
              onPress={() => {
                setFilterPosts('Eventos');
              }}
              filter={filterPosts}
            />
            <CategoryButton
              categoryName="Avisos"
              onPress={() => {
                setFilterPosts('Avisos');
              }}
              filter={filterPosts}
            />
          </GroupPageCategoryList>
        </GroupPageCategoryContainer>
        {filterPosts === 'Geral' ? (
          <NewPostInputContainer>
            <NewPostInputTextContainer>
              <Controller
                control={control}
                name="input"
                rules={{
                  required: true,
                }}
                render={({ field: { onChange, value } }) => (
                  <BigInputTextCustom onChangeText={onChange} value={value} imageIcon={null} />
                )}
              />
              {errors.input && <ErrorWarning errorText="Campo obrigatório" />}
              <LinkIcon>
                <Image source={linkIcon} />
              </LinkIcon>
            </NewPostInputTextContainer>
            <View style={{ paddingBottom: 30 }}>
              <ButtonCustom
                onPress={handleSubmit(onSubmit)}
                backColor="#160E47"
                fontColor="white"
                text="Publicar"
                rightIcon={arrowIcon}
              />
            </View>
          </NewPostInputContainer>
        ) : (
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
                    label="Título"
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
                      innerRef={(value) => (hourRef.current = value)}
                    />
                  )}
                />
                {errors.hour && <ErrorWarning errorText={errors.hour.message} />}
              </View>
            </MiddlePart>
            <BottomPartContainer>
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
                    label="Descrição"
                  />
                )}
              />
              {errors.description && <ErrorWarning errorText="Campo obrigatório" />}
              <ButtonCustom
                onPress={handleSubmit(onSubmit)}
                backColor="#160E47"
                fontColor="white"
                text="Publicar"
                rightIcon={arrowIcon}
              />
            </BottomPartContainer>
          </NewEventInputContainer>
        )}
      </NewPostContainer>
    </View>
  );
}
