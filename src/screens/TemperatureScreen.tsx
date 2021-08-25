import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StackScreenProps } from '@react-navigation/stack';

import { MENU_ICON_SIZE } from '../utils/config';
import CarGraphic from '../components/CarGraphic';
import { RootStackParamList } from '../navigation';

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: 'black',
  },
  buttonContainer: {
    position: 'absolute',
    top: 32,
    left: 32,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

type Props = StackScreenProps<RootStackParamList, 'Temperature'>;

const TemperatureScreen = ({ navigation }: Props): JSX.Element => {
  return (
    <View style={styles.screen}>
      <View style={styles.container}>
        <CarGraphic />
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons
            name='chevron-back-outline'
            size={MENU_ICON_SIZE}
            color='white'
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default TemperatureScreen;
