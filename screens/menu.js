import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, ImageBackground, Image, TouchableOpacity, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useMyContext } from '../MyContext';
import moment from 'moment';
import ParkingMap from './parkingScreen';
import 'intl-pluralrules';



const backgroundImage = require('../assets/buld.png');
const parkingIcon = require("../assets/parking.png")



export default function Menu({ navigation }) {
  const { myValue, updateMyValue } = useMyContext();
  const { t } = useTranslation();
  const [currentTime, setCurrentTime] = useState(moment().format('LT'));
  const [currentDate, setCurrentDate] = useState(moment().format('LL'));

  useEffect(() => {
    const updateDateTime = () => {
      setCurrentTime(moment().format('LT'));
      setCurrentDate(moment().format('LL'));
      setTimeout(updateDateTime, 1000);
    };

    const intervalId = setTimeout(updateDateTime, 1000);

    return () => clearInterval(intervalId);
  }, []);

  const changeView = (viewtext) => {
    updateMyValue(viewtext);
  };

  const renderCard = (button) => (
    <TouchableOpacity
      key={button.key}
      style={styles.card}
      onPress={() => changeView(button.key)}
    >
      <Image source={button.image} style={styles.cardImage} />
      <Text style={styles.cardLabel}>{button.label}</Text>
    </TouchableOpacity>
  );

  const CurrentView = () => {
    switch (myValue) {

      case 'parking':
        return <ParkingMap />;
      default:
        return <DefaultView />;
    }
  };

  const buttonsConfig = [
    { key: 'parking', image: parkingIcon, label: t('parking') },


  ];

  const DefaultView = () => (
    <View style={styles.container}>
      <View style={styles.topContainer}>
        <ImageBackground source={backgroundImage} style={styles.backgroundImage} opacity={0.7}>
          <View style={styles.dateTimeContainer}>
            <Text style={styles.clockText}>{currentTime}</Text>
            <Text style={styles.dateText}>{currentDate}</Text>
          </View>
        </ImageBackground>
      </View>

      <View style={styles.interfaceContainer}>
        <ScrollView>
          <View style={styles.buttonContainer}>
            {buttonsConfig.map(renderCard)}
          </View>
        </ScrollView>
      </View>
    </View>
  );

  const styles = StyleSheet.create({
    card: {
      width: '40%', // Ajustez la largeur en fonction de vos besoins
      alignItems: 'center',
      justifyContent: 'center',
      padding: 10,
      margin: 8,
      backgroundColor: 'white',
      borderRadius: 10,
      elevation: 10,
    },
    cardImage: {
      width: 100, // Ajustez la largeur en fonction de vos besoins
      height: 100, // Ajustez la hauteur en fonction de vos besoins
      marginBottom: 5, // Ajustez la marge en fonction de vos besoins
      borderRadius: 10
    },
    cardLabel: {
      fontSize: 16,
      fontWeight: 'bold',
      marginTop: 5,
    },
    container: {
      flex: 1,
      backgroundColor: 'white',
    },
    topContainer: {
      flex: 1,
      justifyContent: 'center',
    },
    dateTimeContainer: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    clockText: {
      fontSize: 48,
      fontWeight: 'bold',
      color: 'black',
    },
    dateText: {
      fontSize: 20,
      color: '#0000FF',
      fontWeight: 'bold',
      marginTop: -10,
    },
    interfaceContainer: {
      flex: 1,
      alignItems: 'center',
    },
    buttonContainer: {
      display: "flex",
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between', // Espacement équitable entre les boutons
      padding: 10,
    },
    backgroundImage: {
      flex: 1,
      resizeMode: 'cover',
      justifyContent: 'center',
      alignItems: 'center',
    },
    overlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(255, 255, 255, 0.5)', // Fond blanc avec opacité
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.interfaceContainer}>{CurrentView()}</View>
    </View>
  );
}
