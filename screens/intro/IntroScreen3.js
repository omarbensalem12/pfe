import React, { useCallback } from 'react';
import { Pressable, StyleSheet, View, Text, Image } from 'react-native';
import Intro3Animation from '../../assets/intro/intro3.json';
import logo from '../../assets/SBI.png';

import LottieView from 'lottie-react-native';

import { useNavigation } from '@react-navigation/native';
import { setIsIntroSeen } from '../../mmkv/mmkvStorage';

const IntroScreen3 = () => {
  const navigation = useNavigation();
  const onClickContinue = useCallback(() => {
    setIsIntroSeen();
    navigation.navigate('Login');
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Image source={logo} resizeMode="contain" style={styles.logo} />
      <Text style={styles.description}>
        we integrate our software with your management tools.
      </Text>
      <LottieView
        source={Intro3Animation}
        style={styles.animation}
        autoPlay
        loop
      />
      <View style={styles.footer}>
        <Pressable onPress={onClickContinue} style={styles.continueBtn}>
          <Text style={styles.continueTxt}>Let's GO</Text>
        </Pressable>
      </View>
    </View>
  );
};

export default IntroScreen3;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  logo: {
    marginVertical: 30,
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
    height: 320,
    marginTop: 10,
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
