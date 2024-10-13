/* eslint-disable global-require */
import { useFonts } from 'expo-font';
import React, { useState } from 'react';
import { StyleSheet, View, Text } from 'react-native';
// eslint-disable-next-line import/no-extraneous-dependencies
import { Dropdown } from 'react-native-element-dropdown';
import { LabelInputText } from '../InputText/InputTextCustomStyle';

export default function DropdownComponent({ data, label, onChange, value }: any) {
  const [fontsLoaded] = useFonts({
    'inter-regular': require('../../fonts/Inter-Regular.ttf'),
  });
  if (!fontsLoaded) {
    return undefined;
  }
  const renderItem = (item) => (
    <View style={styles.item}>
      <Text style={styles.textItem}>{item.label}</Text>
      {item.value === value}
    </View>
  );

  return (
    <View style={{ gap: 5 }}>
      <LabelInputText>{label}</LabelInputText>
      <Dropdown
        style={styles.dropdown}
        containerStyle={styles.containerStyle}
        placeholderStyle={styles.placeholderStyle}
        selectedTextStyle={styles.selectedTextStyle}
        inputSearchStyle={styles.inputSearchStyle}
        iconStyle={styles.iconStyle}
        data={data}
        search
        fontFamily="inter-regular"
        maxHeight={200}
        labelField="label"
        valueField="value"
        placeholder="Selecionar"
        searchPlaceholder="Pesquisar..."
        value={value}
        onChange={(item) => {
          onChange(item.value);
        }}
        renderItem={renderItem}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  dropdown: {
    height: 52,
    borderRadius: 10,
    borderColor: '#5e6366',
    padding: 15,
    backgroundColor: '#f2f6fa',
    borderWidth: 1,
  },
  icon: {
    marginRight: 5,
  },
  item: {
    padding: 17,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  textItem: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'inter-regular',
  },
  placeholderStyle: {
    fontSize: 16,
    color: '#5e6366',
  },
  selectedTextStyle: {
    fontSize: 16,
    color: '#5e6366',
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
    borderRadius: 10,
  },
  containerStyle: {
    backgroundColor: '#f2f6fa',
  },
});
