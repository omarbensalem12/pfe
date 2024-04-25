import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View, ScrollView, TextInput, Alert } from "react-native";
import * as Location from 'expo-location';
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { RadioButton, Button } from "react-native-paper";
import config from "../config";
import { useTranslation } from 'react-i18next';

const SignupContinue = ({ route }) => {
  const navigation = useNavigation();
  const { t  } = useTranslation();

  const [gender, setGender] = useState("");
  const [lastName, setLastName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState({
    country: "",
    state: "",
    city: "",
    street: "",
    areaCode: ""
  });
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [currentAdress, setCurrentAdress] = useState("");

  useEffect(() => {
    try {
      setUsername(route.params.username);
      setEmail(route.params.email);
    } catch (error) {}

    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Permission to access location was denied');
        return;
      }

      let currentLocation = await Location.getCurrentPositionAsync({});
      setCurrentAdress(currentLocation);
    })();
  }, []);

  const handleUpdate = async () => {
    const data = await AsyncStorage.getItem("user");

    const formData = new FormData();
    formData.append("id", JSON.parse(data).id);

    formData.append("username", username);
    formData.append("email", email);
    formData.append("firstName", firstName);
    formData.append("lastName", lastName);
    formData.append("phone", phone);
    formData.append("address.country", address.country);
    formData.append("address.state", address.state);
    formData.append("address.city", address.city);
    formData.append("address.areaCode", address.areaCode);
    formData.append("address.street", address.street);
    formData.append("gender", gender);
  
    axios
      .put(`${config.api}/api/auth/update,formData`, {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'multipart/form-data'
        },
      })
      .then((response) => {
        // Sauvegarder les données mises à jour dans AsyncStorage
        AsyncStorage.setItem("updatedUser", JSON.stringify(response.data))
          .then(() => {
            // Afficher une alerte pour indiquer la réussite de la mise à jour
            Alert.alert(
              t("successful registration"),
              t("You have been successfully registered")
            );
            // Naviguer vers l'écran principal
            navigation.navigate("Main");
          })
          .catch(error => {
            // Gérer les erreurs de sauvegarde dans AsyncStorage
            console.error("Error saving updated user data to AsyncStorage:", error);
            Alert.alert(
              t("Registration failed"),
              t("An error occurred during registration")
            );
          });
      })
      .catch(error => {
        // Gérer les erreurs de requête PUT
        console.error("Error updating user data:", error);
        Alert.alert(
          t("Registration failed"),
          t("An error occurred during registration")
        );
      });
  };

  const fetchAdress = async () => {
    try {
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${currentAdress.coords.latitude}&lon=${currentAdress.coords.longitude}`
      );

      setAddress({
        country: response.data.address.country,
        state: response.data.address.state,
        city: response.data.address.city,
        street: response.data.address.road,
        areaCode: response.data.address.postcode
      });
    } catch (error) {}
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <Button icon="apple-safari" mode="contained" onPress={fetchAdress}>
          {t("Get current location")}
        </Button>

        <TextInput
          placeholder={t("Username")}
          value={username}
          onChangeText={(text) => setUsername(text)}
          style={styles.input}
        />

        <TextInput
          placeholder={t("First name")}
          value={firstName}
          onChangeText={(text) => setFirstName(text)}
          style={styles.input}
        />

        <TextInput
          placeholder={t("Last name")}
          value={lastName}
          onChangeText={(text) => setLastName(text)}
          style={styles.input}
        />

        <TextInput
          placeholder={t("Email")}
          disableFullscreenUI
          value={email}
          onChangeText={(text) => setEmail(text)}
          style={styles.input}
        />

        <TextInput
          placeholder={(t("Phone"))}
          value={phone}
          onChangeText={(text) => setPhone(text)}
          style={styles.input}
        />

        <TextInput
          placeholder={t("Country")}
          value={address.country}
          onChangeText={(text) => setAddress({ ...address, country: text })}
          style={styles.input}
        />

        <TextInput
          placeholder={t("State")}
          value={address.state}
          onChangeText={(text) => setAddress({ ...address, state: text })}
          style={styles.input}
        />

        <TextInput
          placeholder={t("City")}
          value={address.city}
          onChangeText={(text) => setAddress({ ...address, city: text })}
          style={styles.input}
        />

        <TextInput
          placeholder={t("Street")}
          value={address.street}
          onChangeText={(text) => setAddress({ ...address, street: text })}
          style={styles.input}
        />

        <TextInput
          placeholder={t("Postal code")}
          value={address.areaCode}
          onChangeText={(text) => setAddress({ ...address, areaCode: text })}
          style={styles.input}
        />

        <RadioButton.Group justifyContent="center" onValueChange={(newValue) => setGender(newValue)} value={gender}>
          <View style={styles.radioOption}>
            <Text style={styles.radioLabel}>{t("Man")}</Text>
            <RadioButton value="male" />
          </View>
          <View style={styles.radioOption}>
            <Text style={styles.radioLabel}>{t("Women")}</Text>
            <RadioButton value="female" />
          </View>
        </RadioButton.Group>

        <Button icon="creation" mode="contained" onPress={handleUpdate}>
          {t("Create")}
        </Button>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop : 20,
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  scrollViewContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    padding:20,
    width: '90%',
    marginTop:20,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    marginTop:20,
    paddingLeft: 10,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  radioLabel: {
    marginRight: 10,
  },
});

export default SignupContinue;