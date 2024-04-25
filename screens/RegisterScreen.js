import React, { useState, useEffect } from "react";
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {
  StyleSheet,
  Button,
  Text,
  View,
  SafeAreaView,
  Pressable,
  TextInput,
  KeyboardAvoidingView,
  Image,
  Alert,
  Modal,
  TouchableOpacity,
  ScrollView,
  Platform
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import registerimg from '../assets/Register.jpg';
import { MaterialIcons, AntDesign, Ionicons } from "@expo/vector-icons";
import axios from "axios";
import * as ImagePicker from "expo-image-picker";
import logo from "../assets/avatar.png";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from 'react-i18next';
import config from "../config";


const RegisterScreen = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();


  const [image, setImage] = useState(null);
  const [isImagePickerVisible, setImagePickerVisible] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  useEffect(() => {
    (async () => {
      const cameraPermission = await ImagePicker.getCameraPermissionsAsync();

      if (cameraPermission.status !== 'granted') {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          alert(t("Camera permission is required to take photos."));
        }
      }
    })();
  }, []);



  const handleRegister = () => {
    const user = {
      username: name,
      email: email,
      password: password,
      profileImage: image,
    };
    const formData = new FormData();
    formData.append("username", name);
    formData.append("email", email);
    formData.append("password", password);
    formData.append("roles[]", "user");

    try {
      if (image) {
        formData.append('avatar', {
          name: 'avatar.png',
          uri: image,
          type: 'image/jpg',
        });
      }
    } catch (error) {
      console.log("Error appending image to FormData:", error);
    }

    axios
      .post(`${config.api}/api/auth/signup`, formData, {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'multipart/form-data'
        },
      })
      .then((response) => {
        console.log(response);
        Alert.alert(
          t("successful registration"),
          t("You have been successfully registered")
        );

        axios.post(`${config.api}/api/auth/signin`, { email, password }).then(result => {
          AsyncStorage.setItem("user", JSON.stringify(result.data));
          setTimeout(() => {
            navigation.navigate("RegisterContinue", { email, username: name });

            setName("");
            setEmail("");
            setPassword("");
            setImage(null);

          }, 1000);
        });
      })
      .catch((error) => {
        Alert.alert(
          t("Registration failed"),
          t("An error occurred during registration")
        );
        console.log("error", JSON.stringify(error));
      });
  };

  const choisirImage = async () => { };

  const selectImageFromLibrary = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.cancelled) {
      const selectedImageUri = result.uri || (result.assets.length > 0 && result.assets[0].uri);
      setImage(selectedImageUri);
    }

    hideImagePicker();
  };

  const openCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();

    if (status !== "granted") {
      alert(
        t("Sorry, we need camera access permission for this to work!")
      );
    }

    if (status === "granted") {
      const response = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
      });

      if (!response.cancelled) {
        setImage(response.uri);
        setImagePickerVisible(false);
      }
    }
  };

  const prendrePhoto = async () => {
    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.cancelled) {
      const selectedImageUri = result.uri || (result.assets.length > 0 && result.assets[0].uri);
      setImage(selectedImageUri);
    }
  };

  const takePhoto = async () => {
    await prendrePhoto();
    hideImagePicker();
  };

  const annulerSelectionImage = () => {
    setImage(null);
  };

  const showImagePicker = () => {
    setImagePickerVisible(true);
  };

  const hideImagePicker = () => {
    setImagePickerVisible(false);
  };


  return (
    <SafeAreaView style={styles.container}>


      <View>
        <Image source={registerimg} style={{ width: 300, height: 300, top: 50 }}></Image>
      </View>

      <View style={styles.imagePickerContainer}>
        <TouchableOpacity
          style={styles.imagePicker}
          onPress={() => setImagePickerVisible(true)}
        >
          <Image source={image ? { uri: image } : logo} style={styles.image} >

          </Image>

        </TouchableOpacity>

      </View>




      <Modal visible={isImagePickerVisible} transparent={true}>
        <View style={styles.imagePickerModal}>
          <TouchableOpacity
            style={styles.imagePickerOption}
            onPress={selectImageFromLibrary}
          >
            <Text style={styles.buttonText}>{t("Choose from gallery")}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.imagePickerOption}
            onPress={takePhoto}
          >
            <Text style={styles.buttonText}>{t("To take a picture")}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={hideImagePicker}
          >
            <Text style={styles.buttonText}>{t("Cancel")}</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      <KeyboardAvoidingView behavior="padding">
        <View style={styles.formContainer}>
          <Text style={styles.title}>{t("Registering for your account")}</Text>

          <View style={styles.inputContainer}>
            <Ionicons
              style={styles.icon}
              name="person"
              size={24}
              color="gray"
            />
            <TextInput
              value={name}
              onChangeText={(text) => setName(text)}
              placeholderTextColor={"gray"}
              style={styles.input}
              placeholder={t("Enter your name")}
            />
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

          <Pressable
            onPress={handleRegister}
            style={styles.registerButton}
          >
            <Text style={styles.registerButtonText}>{t("Register")}</Text>
          </Pressable>

          <Pressable
            onPress={() => navigation.goBack()}
            style={styles.loginLink}
          >
            <Text style={styles.loginLinkText}>
              {t("Already have an account ?")} <Text style={{ textDecorationLine: 'underline', color: '#007FFF', justifyContent: 'center' }}>{t("Login")}</Text>
            </Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>

    </SafeAreaView>
  );
};

export default RegisterScreen;

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
  imagePickerContainer: {
    alignItems: "center",
    marginBottom: 20,
    marginTop: 50
  },
  imagePicker: {
    width: 150,
    height: 150,
    borderRadius: 75,
    overflow: "hidden",
  },
  image: {
    flex: 1,
    width: undefined,
    height: undefined,
  },
  imagePickerModal: {
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    padding: 20,
    borderRadius: 10,
    width: "80%",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: "auto",
    marginRight: "auto",
    marginTop: "50%",
  },
  imagePickerOption: {
    padding: 15,
    width: "100%",
    borderBottomColor: "#D0D0D0",
    borderBottomWidth: 1,
    alignItems: "center",
  },
  buttonText: {
    fontSize: 16,
    color: "white",
  },
  cancelButton: {
    marginTop: 10,
  },
  formContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    top: -50
  },
  title: {
    fontSize: 18,
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
    width: "100%",
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
  registerButton: {
    width: "100%",
    backgroundColor: "black",
    padding: 15,
    marginTop: 50,
    borderRadius: 6,
  },
  registerButtonText: {
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 16,
    color: "white",
  },
  loginLink: {
    marginTop: 10,
  },
  loginLinkText: {
    textAlign: "center",
    fontSize: 16,
  },
});