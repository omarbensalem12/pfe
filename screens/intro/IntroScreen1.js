import React, { useCallback } from 'react';
import { Pressable, StyleSheet, View, Text, Image, ScrollView } from 'react-native';
import logo from '../../assets/SBI.png';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { useNavigation } from '@react-navigation/native';
import { setIsIntroSeen } from '../../mmkv/mmkvStorage';
import intro1 from '../../assets/intro/intro.jpg';
const IntroScreen1 = () => {
  const navigation = useNavigation();
  const onClickSkip = useCallback(() => {
    setIsIntroSeen();
    navigation.navigate('register');
  }, [navigation]);
  const onClickContinue = useCallback(() => {
    navigation.navigate('IntroScreen2');
  }, [navigation]);

  return (

    <View style={styles.container}>
      <Image source={logo} resizeMode="contain" style={styles.logo} />

      <Text style={styles.description}>
        Parking is the ideal smart and easy software application for booking office parking spaces.
      </Text>
      <Image source={intro1} resizeMode="contain" style={{ width: 390, height: 300 }} />

      <View style={{
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
      }}>

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

    </View >


  );
};

export default IntroScreen1;

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
