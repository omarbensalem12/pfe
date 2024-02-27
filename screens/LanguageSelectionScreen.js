// LanguageSelectionScreen.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import enFlag from '../assets/en.png';
import frFlag from '../assets/fr.png';
import arFlag from '../assets/tn.png';
import { useTranslation } from 'react-i18next';
import 'intl-pluralrules';

const LanguageSelectionScreen = ({ navigation }) => {
  const {  i18n } = useTranslation();

  const handleLanguageSelect = async (language) => {
    try {
      i18n.changeLanguage(language)
      await AsyncStorage.setItem('appLanguage', language);
      await AsyncStorage.setItem('isFirstLaunch', 'false');
      navigation.navigate('Login');
    } catch (error) {
      console.error('Error saving language or first launch state:', error);
    }
  };

  return (
    <View style={styles.container}> 
      <Text style={styles.title}>Select Your Language</Text>
      <TouchableOpacity
        style={styles.languageButton}
        onPress={() => handleLanguageSelect('en')}
      >
        <Image source={enFlag} style={styles.flagIcon} />
        <Text>English</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.languageButton}
        onPress={() => handleLanguageSelect('fr')}
      >
        <Image source={frFlag} style={styles.flagIcon} />
        <Text>Francis</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.languageButton}
        onPress={() => handleLanguageSelect('ar')}
      >
        <Image source={arFlag} style={styles.flagIcon} />
        <Text>Arabic</Text>
      </TouchableOpacity>
      {/* Add more language buttons as needed */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    marginBottom: 20,
  },
  languageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
  },
  flagIcon: {
    width: 30,
    height: 20,
    marginRight: 10,
  },
});

export default LanguageSelectionScreen;
