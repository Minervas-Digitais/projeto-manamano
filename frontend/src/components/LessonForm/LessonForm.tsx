/* eslint-disable global-require */
import React, { useEffect, useRef, useState } from 'react';
import * as DocumentPicker from 'expo-document-picker';
import { ScrollView, View, Dimensions } from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import * as FileSystem from 'expo-file-system';
import Toast from 'react-native-toast-message';
import BigInputTextCustom from '../BigInputText/BigInputText';
import ButtonCustom from '../ButtonCustom/ButtonCustom';
import ErrorWarning from '../ErrorWarning/ErrorWarning';
import InputTextCustom from '../InputText/InputTextCustom';
import {
  LinkPart,
  MiddlePart,
  NamePart,
  NewLessonContainer,
} from '../../pages/NewLesson/NewLessonStyle';
import ArchiveCard from '../ArchiveCard/ArchiveCard';
import ArrowIcon from '../../assets/arrow-icon.svg';
import LinkIcon from '../../assets/input-link-icon.svg';
import CalendarIcon from '../../assets/calendar-icon.svg';

interface InputRef {
  getRawValue: () => string;
  isValid: () => boolean;
}

export type LessonFormDefaultValues = {
  title?: string;
  date?: string;
  hour?: string;
  link?: string;
  vod?: string;
  input?: string;
};

export type LessonFormFile = {
  id: number;
  name: string;
  uri: string;
  mimeType?: string;
};

type LessonFormProps = {
  defaultValues?: LessonFormDefaultValues;
  onSubmit: (data: any, files: LessonFormFile[]) => Promise<void> | void;
  submitLabel: string;
  submitTestID?: string;
  validationMode: 'create' | 'edit';
  existingFiles?: {
    id: string | number;
    name: string;
    mimeType?: string;
    uri?: string;
    contentBase64?: string;
  }[];
};

export default function LessonForm({
  defaultValues,
  onSubmit,
  submitLabel,
  submitTestID = 'btn-publish',
  validationMode,
  existingFiles = [],
}: LessonFormProps) {
  const [files, setFiles] = useState<LessonFormFile[]>([]);
  const [visibility, setVisibility] = useState<{ [key: number]: boolean }>({});

  const handleClick = (id: number) => {
    setFiles((prevFiles) => prevFiles.filter((file) => file.id !== id));
    setVisibility((prevState) => {
      const updatedState = { ...prevState };
      delete updatedState[id];
      return updatedState;
    });
  };

  const dateRef = useRef<InputRef | null>(null);
  const hourRef = useRef<InputRef | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<any>({
    defaultValues: (defaultValues as any) ?? {},
  });

  useEffect(() => {
    if (defaultValues) {
      reset(defaultValues as any);
    }
  }, [defaultValues, reset]);

  const validateDate = () => {
    if (!dateRef.current) return 'Data inválida';
    if (!dateRef.current.isValid()) return 'Data inválida';
    if (validationMode === 'edit') return true;
    const inputDate = new Date(dateRef.current.getRawValue());
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    if (inputDate < currentDate) {
      return 'Data inválida';
    }
    return true;
  };

  const validateHour = () => {
    if (!hourRef.current) return 'Hora inválida';
    if (!hourRef.current.isValid()) {
      return 'Hora inválida';
    }
    if (validationMode === 'edit') return true;
    if (!dateRef.current) return 'Data inválida';
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
    if (inputDate.getTime() === currentDate.getTime() && currentHourMin > inputHourMin) {
      return 'Esta hora já passou';
    }
    return true;
  };

  const pickFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        multiple: true,
      });

      if (result.assets && result.assets.length > 0) {
        const newFiles = await Promise.all(
          result.assets.map(async (file) => {
            const base64 = await FileSystem.readAsStringAsync(file.uri, {
              encoding: FileSystem.EncodingType.Base64,
            });
            return {
              id: Date.now() + Math.random(),
              name: file.name,
              uri: base64,
              mimeType: file.mimeType,
            };
          }),
        );
        setFiles((prevFiles) => [...prevFiles, ...newFiles]);
        setVisibility((prevState) => {
          const updatedVisibility = { ...prevState };
          newFiles.forEach((file) => {
            updatedVisibility[file.id] = false;
          });
          return updatedVisibility;
        });
      } else {
        Toast.show({
          type: 'error',
          text1: 'Nenhum arquivo selecionado.',
        });
      }
    } catch (error) {
      console.error('Erro ao selecionar os arquivos: ', error);
      Toast.show({
        type: 'error',
        text1: 'Erro ao selecionar os arquivos.',
      });
    }
  };

  const { width } = Dimensions.get('window');

  const handleFormSubmit = async (data: any) => {
    await onSubmit(data, files);
  };

  return (
    <NewLessonContainer>
      <NamePart>
        <Controller
          control={control}
          name="title"
          rules={{
            required: 'Campo obrigatório',
          }}
          render={({ field: { onChange, value } }) => (
            <InputTextCustom
              testID="input-title"
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
        <View style={{ flex: 1, marginRight: width * 0.03135 }}>
          <Controller
            control={control}
            name="date"
            rules={{
              required: 'Campo Obrigatório',
              validate: validateDate,
            }}
            render={({ field: { onChange, value } }) => (
              <InputTextCustom
                testID="input-date"
                onChangeText={onChange}
                value={value}
                label="Data"
                imageIcon={<CalendarIcon />}
                type="datetime"
                options={{ format: 'DD/MM/YYYY' }}
                innerRef={(input: any) => {
                  dateRef.current = input;
                }}
              />
            )}
          />
          {errors.date && <ErrorWarning errorText={errors.date.message} />}
        </View>
        <View style={{ flex: 1, marginLeft: width * 0.03135 }}>
          <Controller
            control={control}
            name="hour"
            rules={{
              required: 'Campo Obrigatório',
              validate: validateHour,
            }}
            render={({ field: { onChange, value } }) => (
              <InputTextCustom
                testID="input-hour"
                onChangeText={onChange}
                value={value}
                label="Horário"
                imageIcon={null}
                type="datetime"
                options={{ format: 'HH:mm' }}
                innerRef={(input: null) => {
                  hourRef.current = input;
                }}
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
              testID="input-link"
              onChangeText={onChange}
              value={value}
              label="Link"
              imageIcon={<LinkIcon />}
            />
          )}
        />
        {errors.link && <ErrorWarning errorText={errors.link.message} />}
        <Controller
          control={control}
          name="vod"
          rules={{
            required: false,
          }}
          render={({ field: { onChange, value } }) => (
            <InputTextCustom
              testID="input-vod"
              onChangeText={onChange}
              value={value}
              label="Aula gravada (opcional)"
              imageIcon={<LinkIcon />}
            />
          )}
        />
        <Controller
          control={control}
          name="input"
          rules={{
            required: true,
          }}
          render={({ field: { onChange, value } }) => (
            <BigInputTextCustom
              testID="input-description"
              onChangeText={onChange}
              value={value}
              imageIcon={null}
              label="Descrição da aula"
            />
          )}
        />
        {(errors as any).input && <ErrorWarning errorText="Campo obrigatório" />}
        <ScrollView
          showsHorizontalScrollIndicator={false}
          horizontal
          style={{ flex: 1, paddingTop: 10, paddingBottom: 10 }}
          contentContainerStyle={{ alignItems: 'center' }}>
          {existingFiles.map((item) => (
            <ArchiveCard
              key={`existing-${item.id}`}
              name={item.name}
              mimeType={item.mimeType}
              uri={item.contentBase64 ?? item.uri}
              testID={`existing-file-${item.id}`}
              archive
            />
          ))}
          {files.map((item) => (
            <ArchiveCard
              key={item.id}
              name={item.name}
              mimeType={item.mimeType}
              uri={item.uri}
              testID={`file-item-${item.id}`}
              archive
              removed={visibility[item.id]}
              onPress={() => handleClick(item.id)}
            />
          ))}
          <ArchiveCard testID="btn-add-file" onClick={pickFile} />
        </ScrollView>
        <ButtonCustom
          testID={submitTestID}
          onPress={handleSubmit(handleFormSubmit)}
          backColor="#160E47"
          fontColor="white"
          text={submitLabel}
          rightIcon={<ArrowIcon />}
        />
      </LinkPart>
    </NewLessonContainer>
  );
}
