/* eslint-disable global-require */
import { StyleSheet, View } from 'react-native';
import React from 'react';
import SignIn from './src/pages/SignIn/SignIn';

export default function App() {
  return (
    <View style={styles.container}>
      <SignIn />
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
