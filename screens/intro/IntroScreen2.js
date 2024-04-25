import React, { useCallback } from 'react';
import { Pressable, StyleSheet, View, Text, Image } from 'react-native';
import logo from '../../assets/SBI.png';
import intro2 from '../../assets/intro/intro2.jpg';

import AntDesign from 'react-native-vector-icons/AntDesign';
import { useNavigation } from '@react-navigation/native';
import { setIsIntroSeen } from '../../mmkv/mmkvStorage';

const IntroScreen2 = () => {
  const navigation = useNavigation();
  const onClickSkip = useCallback(() => {
    setIsIntroSeen();
    navigation.navigate('Register');
  }, [navigation]);
  const onClickContinue = useCallback(() => {
    navigation.navigate('IntroScreen3');
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Image source={logo} resizeMode="contain" style={styles.logo} />
      <Text style={styles.description}>
        We are the solution for managing your business spaces
      </Text>
      <Image source={intro2} resizeMode="contain" style={{ width: 380, height: 295 }} />
      <View style={styles.container}>

      </View>
      <View style={styles.footer}>
        <Pressable onPress={onClickSkip} style={styles.skipBtn}>
          <Text style={styles.skipTxt}>Skip</Text>
        </Pressable>
        <Pressable onPress={onClickContinue} style={styles.continueBtn}>
          <Text style={styles.continueTxt}>continue</Text>
          <AntDesign name="caretright" size={15} color="#fff" />
        </Pressable>
      </View>
    </View>
  );
};

export default IntroScreen2;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  logo: {
    marginTop: 60,
    marginBottom: 50,
    alignSelf: 'center',
    height: 150,
    aspectRatio: 16 / 9,
  },
  description: {
    fontSize: 20,
    color: '#000',
    textAlign: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  animation: {
    width: '100%',
    height: 350,
    margin: 0,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    width: '100%',
    height: 100,
    paddingHorizontal: 5,
  },
  skipBtn: {
    backgroundColor: 'transparent',
    paddingVertical: 15,
    paddingHorizontal: 40,
    marginHorizontal: 5,
  },
  skipTxt: {
    fontSize: 18,
    color: '#666',
  },
  continueBtn: {
    backgroundColor: '#0C2D57',
    paddingVertical: 15,
    paddingHorizontal: 30,
    marginHorizontal: 5,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  continueTxt: {
    fontSize: 18,
    color: '#fff',
    marginRight: 5,
  },
});
