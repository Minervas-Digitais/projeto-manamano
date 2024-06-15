/* eslint-disable global-require */
import { StyleSheet, View } from 'react-native';
import React from 'react';
import SideMenu from './src/components/SideMenu/SideMenu';

export default function App() {
  return (
    <View style={styles.container}>
      <SideMenu />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: '5%',
  },
});
