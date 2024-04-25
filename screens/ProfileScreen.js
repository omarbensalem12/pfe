import React, { useEffect, useState, useContext } from "react";
import { StyleSheet, Text, View, Image, Pressable, TextInput, ScrollView, TouchableOpacity, Modal, Alert } from "react-native";
import axios from "axios";
import { UserType } from "../UserContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { RadioButton, Button, IconButton, MD2Colors } from "react-native-paper";
import { useTranslation } from 'react-i18next';
import { CheckBox } from 'react-native-elements';
import 'intl-pluralrules';
import config from "../config";
import SignupContinue from "./signupContinue";
import * as Location from 'expo-location';
import * as ImagePicker from "expo-image-picker";

const ProfileScreen = ({}) => {
  const [userData, setUserData] = useState(null);
  const { t, i18n } = useTranslation();
  const [user, setUser] = useState(null);
  const [id, setId] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isSetting, setIsSetting] = useState(false);
  const navigation = useNavigation();
  const { userId, setUserId } = useContext(UserType);

  const [image, setImage] = useState(null);
  const [isImagePickerVisible, setImagePickerVisible] = useState(false);

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
  const [avatar, setavatar] = useState(null);
  const [username, setUsername] = useState("");
  const [currentAdress, setCurrentAdress] = useState("");

  useEffect(() => {

    const fetchUserData = async () => {
      try {
        // Récupérer l'objet user à partir d'AsyncStorage
        const userData = await AsyncStorage.getItem("updatedUser");
  
        // Vérifier si des données utilisateur existent dans AsyncStorage
        if (userData) {
          // Si des données utilisateur existent, les convertir en objet JavaScript
          const parsedUserData = JSON.parse(userData);
  
          // Extraire les données nécessaires de l'objet user
          const { username, email, firstName, lastName, phone, address, gender } = parsedUserData;
  
          // Mettre à jour les états avec les données récupérées
          setUsername(username);
          setEmail(email);
          setFirstName(firstName);
          setLastName(lastName);
          setPhone(phone);
         setAddress(address);
          setGender(gender);
        }
      } catch (error) {
        console.error("Error fetching user data from AsyncStorage:", error);
      }
    };
  
    fetchUserData();
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

  const logout = () => {
    clearAuthToken();
  };

  const clearAuthToken = async () => {
    await AsyncStorage.removeItem("user");
    console.log("Cleared auth token");
    navigation.replace("Login");
  };

  const handleEditProfile = () => {
    setIsEditing(true);
  };


  const handleProfilePicturePress = () => {
    console.log("Change profile picture logic goes here");
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

  const hideImagePicker = () => {
    setImagePickerVisible(false);
  };

  const selectImageFromLibrary = async () => {


    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.cancelled) {
      // Vérifie si l'image sélectionnée provient de la caméra ou de la bibliothèque
      const selectedImageUri = result.uri || (result.assets.length > 0 && result.assets[0].uri);
      setImage(selectedImageUri);

    }

    hideImagePicker();


  };

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
      .put(`${config.api}/api/auth/update`, formData, {
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
          
            // Naviguer vers l'écran principal
          
            setIsEditing(false);
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

  return (
    <View style={styles.container}>
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
      <View style={styles.profileContainer}>
        <View style={styles.header}>
          <Text style={styles.headerText}>{username}</Text>
          <View style={styles.statusIndicator}></View>
        </View>

        <View style={styles.profileDetails}>
          <TouchableOpacity onPress={handleProfilePicturePress}>
            {avatar ? (
              <Image
                style={styles.profileImage}
                source={{ uri: `${config.api}/api/images/${user?.avatar}` }}
              />
            ) : (
              <Image
                style={styles.profileImage}
                source={{ uri: "https://cdn-icons-png.flaticon.com/128/149/149071.png" }}
              />
            )}
          </TouchableOpacity>

          <View style={styles.textDetails}>
            <Text style={styles.textUsername}>{username}</Text>
            <Text style={styles.textEmail}>{email}</Text>
            <Text style={styles.textAddress}>
              {address?.street}, {address?.city},{'\n'}
              {address?.state}, {address?.country} {address?.areaCode}
            </Text>
          </View>
        </View>

        <Text style={styles.followersText}>{user?.followers?.length} {t("followers")}</Text>

        <View style={styles.actionButtons}>
          <Button icon="pencil" mode="contained" onPress={isEditing ? handleUpdate : handleEditProfile}>
            {isEditing ? t("Save") : t("To modify")}
          </Button>
          <IconButton icon="logout" color={MD2Colors.red500} size={30} onPress={logout} />
          <IconButton icon="account-settings" color={MD2Colors.blue500} size={30} onPress={() => { setIsEditing(false); setIsSetting(!isSetting) }} />
        </View>
      </View>
      {isSetting && (
        <View style={styles.checkButtonContainer}>
          <CheckBox
            title="FR"
            checkedIcon={<Image source={require('../assets/fr.png')} style={styles.flagImage} />}
            uncheckedIcon={<Image source={require('../assets/fr.png')} style={styles.flagImage} />}
            checkedColor="#4682B4"
            uncheckedColor="#4682B4"
            containerStyle={styles.checkButton}
            textStyle={styles.checkButtonText}
            checked={gender === 'fr'}
            onPress={() => i18n.changeLanguage('fr')}
          />
          <CheckBox
            title="EN"
            checkedIcon={<Image source={require('../assets/en.png')} style={styles.flagImage} />}
            uncheckedIcon={<Image source={require('../assets/en.png')} style={styles.flagImage} />}
            checkedColor="#4682B4"
            uncheckedColor="#4682B4"
            containerStyle={styles.checkButton}
            textStyle={styles.checkButtonText}
            checked={gender === 'en'}
            onPress={() => i18n.changeLanguage('en')}
          />
          <CheckBox
            title="AR"
            checkedIcon={<Image source={require('../assets/tn.png')} style={styles.flagImage} />}
            uncheckedIcon={<Image source={require('../assets/tn.png')} style={styles.flagImage} />}
            checkedColor="#4682B4"
            uncheckedColor="#4682B4"
            containerStyle={styles.checkButton}
            textStyle={styles.checkButtonText}
            checked={gender === 'ar'}
            onPress={() => i18n.changeLanguage('ar')}
          />
        </View>

      )}

      {isEditing && (
        <ScrollView style={styles.editProfileForm}>
          <TouchableOpacity
            style={styles.imagePickerContainer}
            onPress={() => setImagePickerVisible(true)}
          >
            <Image source={image ? { uri: image } : { uri: "https://cdn-icons-png.flaticon.com/128/149/149071.png" }} style={styles.image} />
          </TouchableOpacity>
          <Button icon="map-marker" mode="contained" onPress={fetchAdress}>
            {t("current location")}
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
            placeholder={t("Zip code")}
            value={address.areaCode}
            onChangeText={(text) => setAddress({ ...address, areaCode: text })}
            style={styles.input}
          />

          <View style={styles.radioButtonsContainer}>
            <RadioButton.Group onValueChange={newValue => setGender(newValue)} value={gender}>
              <View style={styles.radioButtonRow}>
                <Text>{t("Male")}</Text>
                <RadioButton value="male" />
              </View>
              <View style={styles.radioButtonRow}>
                <Text>{t("Female")}</Text>
                <RadioButton value="female" />
              </View>
              <View style={styles.radioButtonRow}>
                <Text>{t("Other")}</Text>
                <RadioButton value="other" />
              </View>
            </RadioButton.Group>
          </View>
        </ScrollView>
      )}

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  profileContainer: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  headerText: {
    fontSize: 20,
    fontWeight: "bold",
  },
  statusIndicator: {
    height: 20,
    width: 20,
    borderRadius: 10,
    backgroundColor: "#2ecc71",
  },
  profileDetails: {
    flexDirection: "row",
    alignItems: "center",
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  textDetails: {
    marginLeft: 20,
  },
  textUsername: {
    fontSize: 18,
    fontWeight: "bold",
  },
  textEmail: {
    fontSize: 16,
    color: "#777",
  },
  textAddress: {
    fontSize: 16,
    color: "#777",
  },
  followersText: {
    marginTop: 20,
    marginBottom: 10,
    fontSize: 18,
    fontWeight: "bold",
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  button: {
    padding: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#333",
    width: "30%",
    alignItems: "center",
  },
  buttonText: {
    fontSize: 16,
  },
  editButton: {
    backgroundColor: "#3498db",
    color: "#fff",
  },
  checkButtonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 20,
  },
  checkButton: {
    backgroundColor: "#fff",
    borderWidth: 0,
    paddingHorizontal: 0,
  },
  checkButtonText: {
    fontSize: 20,
    color: "#333",
  },
  flagImage: {
    width: 50,
    height: 30,
  },
  editProfileForm: {
    padding: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  radioButtonsContainer: {
    marginBottom: 20,
  },
  radioButtonRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  imagePickerContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  image: {
    width: 200,
    height: 200,
    borderRadius: 100,
  },
  imagePickerModal: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  imagePickerOption: {
    backgroundColor: '#fff',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
  },
  cancelButton: {
    backgroundColor: '#fff',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    marginTop: 10,
  },
});

export default ProfileScreen;