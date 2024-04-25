import AsyncStorage from '@react-native-async-storage/async-storage';

// Set item in AsyncStorage
export const setIsIntroSeen = async () => {
  try {
    await AsyncStorage.setItem('isIntroSeen', 'true');
  } catch (error) {
    console.error('Error setting intro seen:', error);
  }
};

// Get item from AsyncStorage
export const getIsIntroSeen = async () => {
  try {
    const value = await AsyncStorage.getItem('isIntroSeen');
    return value === 'true';
  } catch (error) {
    console.error('Error getting intro seen:', error);
    return false;
  }
};
