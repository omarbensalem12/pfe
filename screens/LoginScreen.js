import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  Image,
  TextInput,
  Pressable,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Dimensions, // Importez Dimensions
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { AntDesign } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import img from "../assets/login.png";
import { useTranslation } from 'react-i18next';
import config from "../config";

import 'intl-pluralrules';
const { width } = Dimensions.get("window"); // Obtenez la largeur de l'écran

const LoginScreen = () => {
  const { t ,i18n } = useTranslation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigation = useNavigation();

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const lg = await AsyncStorage.getItem('appLanguage');
        if(lg){
          i18n.changeLanguage(lg)
        }else{
          setTimeout(() => {
            navigation.replace("LanguageSelection");
          }, 400);
        }
      } catch (error) {
        
      }

      try {
        const token = await AsyncStorage.getItem("user");

        if (token) {
          setTimeout(() => {
            navigation.replace("Main");
          }, 400);
        }
      } catch (error) {
        console.log("error", error);
      }
    };

    checkLoginStatus();
  }, []);

  const handleLogin = () => {
    const user = {
      email: email,
      password: password,
    };

    axios
      .post(`${config.api}/api/auth/signin`, user)
      .then((response) => {
        AsyncStorage.setItem("user", JSON.stringify(response.data));
        navigation.navigate("Main");
      })
      .catch((error) => {
        console.log("error ", JSON.stringify(error));
        Alert.alert("Login error");
      });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
      >
        <View style={styles.imageContainer}>
          <Image
            style={styles.image}
            source={require("../assets/login.png")}
          />
          <Text style={styles.title}>
            {t("Sign into your account")}
          </Text>
        </View>

        <View style={styles.inputContainer}>
          <MaterialIcons
            style={styles.icon}
            name="email"
            size={24}
            color="gray"
          />
          <TextInput
            value={email}
            onChangeText={(text) => setEmail(text)}
            placeholderTextColor={"gray"}
            style={styles.input}
            placeholder={t("Enter your e-mail adress")}
          />
        </View>

        <View style={styles.inputContainer}>
          <AntDesign
            style={styles.icon}
            name="lock"
            size={24}
            color="gray"
          />
          <TextInput
            secureTextEntry={true}
            value={password}
            onChangeText={(text) => setPassword(text)}
            placeholderTextColor={"gray"}
            style={styles.input}
            placeholder={t("Enter your password")}
          />
        </View>

        <View style={styles.checkboxContainer}>
          <Text>{t("Stay connected")} </Text>
          <Text style={styles.forgotPassword}>
            {t("Forgot your password")}
          </Text>
        </View>

        <Pressable onPress={handleLogin} style={styles.loginButton}>
          <Text style={styles.loginButtonText}>{t("Login")}</Text>
        </Pressable>

        <Pressable
          onPress={() => navigation.navigate("Register")}
          style={styles.registerButton}
        >
          <Text style={styles.registerButtonText}>
            {t("You do not have an account ?")} {t("Register")}
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  imageContainer: {
    marginTop: 10,
    alignItems: "center",
  },
  image: {
    width: width, // Utilisez la largeur totale de l'écran
    height: 250,
    resizeMode: "contain",
  },
  title: {
    fontSize: 17,
    fontWeight: "bold",
    marginTop: 25,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 30,
    borderColor: "#D0D0D0",
    borderWidth: 1,
    paddingVertical: 5,
    borderRadius: 5,
    width: width - 40, // Utilisez la largeur totale de l'écran avec une petite marge
  },
  icon: {
    marginLeft: 8,
  },
  input: {
    color: "gray",
    marginLeft: 5,
    width: "80%",
    fontSize: 16,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 30,
    width: width - 40, // Utilisez la largeur totale de l'écran avec une petite marge
  },
  forgotPassword: {
    fontWeight: "500",
    color: "#007FFF",
  },
  loginButton: {
    width: width - 40, // Utilisez la largeur totale de l'écran avec une petite marge
    backgroundColor: "black",
    padding: 15,
    marginTop: 100,
    borderRadius: 6,
  },
  loginButtonText: {
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 16,
    color: "white",
  },
  registerButton: {
    marginTop: 50,
    width: width - 40, // Utilisez la largeur totale de l'écran avec une petite marge
  },
  registerButtonText: {
    textAlign: "center",
    fontSize: 16,
  },
});

export default LoginScreen;
