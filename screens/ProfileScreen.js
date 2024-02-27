import React, { useEffect, useState, useContext } from "react";
import { StyleSheet, Text, View, Image, Pressable, TextInput, ScrollView, TouchableOpacity, Modal, Alert } from "react-native";
import axios from "axios";
import { UserType } from "../UserContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { RadioButton, Button, Icon, MD3Colors } from "react-native-paper";
import logo from "../assets/avatar.png";
import * as ImagePicker from "expo-image-picker";
import * as Location from 'expo-location';
import { useTranslation } from 'react-i18next';
import { CheckBox } from 'react-native-elements';
import 'intl-pluralrules';
import config from "../config";
const ProfileScreen = ({ route }) => {
  const { t, i18n } = useTranslation();

  const [user, setUser] = useState("");
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

  useEffect(async () => {
    try {
      if (route.params.edit) {
        setIsEditing(true);
      }
    } catch (error) {

    }
    (async () => {
      const cameraPermission = await ImagePicker.getCameraPermissionsAsync();

      if (cameraPermission.status !== 'granted') {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          alert(t("Camera permission is required to take photos."));
        }
      }
    })();

    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Permission to access location was denied');
        return;
      }

      // Get the current location
      let currentLocation = await Location.getCurrentPositionAsync({});
      setCurrentAdress(currentLocation);
    })();
    const data = await AsyncStorage.getItem("user");
    setId(JSON.parse(data).id)
    setavatar(JSON.parse(data).avatar)

    const fetchProfile = async () => {
      try {
        const response = await axios.get(
          `${config.api}/profile/${JSON.parse(data).id}`
        );
        const { user } = response.data;
        setUser(user);
        setUsername(user.username)
        setLastName(user.lastName)
        setFirstName(user.firstName)
        setEmail(user.email)
        setPhone(user.phone)
        setAddress({
          country: user.address.country,
          state: user.address.state,
          city: user.address.city,
          street: user.address.street,
          areaCode: user.address.areaCode
        })
        setGender(user.gender)

      } catch (error) {
        console.log("error", error);
      }
    };

    fetchProfile();
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
      })
    } catch (error) {

    }

  }

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

  const handleSaveProfile = async () => {
    // Implement the logic to save the edited profile data
    try {
      // Make a request to update the user's profile with editedProfile data
      await axios.put(`${config.api}/profile/${userId}`, editedProfile);
      // Refresh the profile data
      const response = await axios.get(`${config.api}/profile/${id}`);
      const { user } = response.data;
      setUser(user);
      setIsEditing(false);
    } catch (error) {
      console.log("Error updating profile", error);
    }
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

  const handleUpdate = () => {
    const formData = new FormData();
    formData.append("id", id);

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

    try {
      if (image)
        formData.append('avatar', {
          name: 'avatar.png',
          uri: image,
          type: 'image/jpg',
        });
    } catch (error) {

    }
    console.log(`${config.api}/api/auth/update`)
    axios
      .put(`${config.api}/api/auth/update`, formData, {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'multipart/form-data'
        },
      })
      .then(async (response) => { 
        const data = await AsyncStorage.getItem("user");
        // AsyncStorage.setItem("user", JSON.stringify(response.data))
        try {
          // console.log(response)   

          AsyncStorage.setItem("user", JSON.stringify( {... JSON.parse(  data),avatar:response.data.avatar,username:response.data.username}));
          navigation.replace("Main")  
           
        } catch (error) { 
          console.log(response.data)  
        }
        // console.log(response);
        Alert.alert( 
          "Inscription réussie",
          "Vous avez été enregistré avec succès"
        );
      })
      .catch(error => {
        Alert.alert(
          "Échec de l'inscription",
          "Une erreur s'est produite lors de l'inscription"
        );
        // console.log("error", JSON.stringify(error));
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
          <TouchableOpacity
            onPress={isEditing ? handleUpdate : handleEditProfile}
            style={[styles.button, styles.editButton]}
          >
            <Text style={styles.buttonText}>{isEditing ? t("Save") : t("To modify")}</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={logout} style={[styles.button]}>
            <Icon
              source="logout"
              color={"red"}
              size={50}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => { setIsEditing(false); setIsSetting(!isSetting) }} style={[styles.button]}>
            <Icon
              source="account-cog"
              color={"#0000FF"}
              size={50}
            />
          </TouchableOpacity>


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
          <Button icon="apple-safari" mode="contained" onPress={fetchAdress}>
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

          <TouchableOpacity
            onPress={handleUpdate}
            style={[styles.button, styles.updateButton]}
          >
            <Text style={styles.buttonText}>{t("To update")}</Text>
          </TouchableOpacity>
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  flagImage: {
    width: 30, // Ajustez la largeur en fonction de vos besoins
    height: 30, // Ajustez la hauteur en fonction de vos besoins 
    marginLeft: 120, // Ajustez la marge en fonction de vos besoins  
  },
  container: {
    marginTop: 55,
    padding: 15,
    backgroundColor: "#F7F7F7",
    flex: 1,
  },
  profileContainer: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerText: {
    fontSize: 20,
    fontWeight: "bold",
  },
  statusIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#4CAF50", // Ajoutez la logique de statut ici
  },
  profileDetails: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 15,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    resizeMode: "cover",
  },
  textDetails: {
    marginLeft: 15,
    height: 100
  },
  textUsername: {
    fontSize: 18,
    fontWeight: "bold",
  },
  textEmail: {
    fontSize: 15,
    fontWeight: "400",
    color: "gray",
  },
  textAddress: {
    fontSize: 15,
    fontWeight: "400",
    color: "gray",
    flex: 1,
    textAlign: 'left',
    overflow: "hidden"

  },
  followersText: {
    color: "gray",
    fontSize: 15,
    marginTop: 10,
  },
  actionButtons: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 20,
  },
  button: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
    borderRadius: 10,
  },
  editButton: {
    backgroundColor: "#0000FF",
    marginRight: 10,
  },
  logoutButton: {
    backgroundColor: "#FF0000",
    marginLeft: 10,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "bold",
  },
  editProfileForm: {
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    padding: 20,
    marginTop: 20,
  },
  buttonsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 20,
  },
  editSaveButton: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 15,
    backgroundColor: "#0000FF",
    borderRadius: 5,
  },
  logoutButton: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 15,
    backgroundColor: "#DB4437",
    borderRadius: 5,
    // marginLeft: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 14,
  },
  imagePickerContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  image: {
    width: 150,
    height: 150,
    borderRadius: 75,
    resizeMode: "cover",
  },
  imagePickerModal: {
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    padding: 20,
    borderRadius: 10,
    width: "80%",
    alignItems: "center",
    justifyContent: "center",
    marginTop: "100%", // Vous pouvez ajuster cette valeur selon vos besoins
    marginBottom: "50%", // Vous pouvez ajuster cette valeur selon vos besoins
    marginLeft: "auto",
    marginRight: "auto",
  },
  imagePickerOption: {
    marginVertical: 10,
    borderBottomColor: "#FFFFFF", // Couleur de la ligne blanche entre les options
    borderBottomWidth: 1, // Épaisseur de la ligne blanche entre les options
    borderTopColor: "#FFFFFF", // Ajoutez cette ligne pour la bordure supérieure
    borderTopWidth: 1, // Ajoutez cette ligne pour la bordure supérieure
  },

  cancelButton: {
    marginVertical: 10,
    borderBottomColor: "#FFFFFF", // Couleur de la ligne blanche entre les options
    borderBottomWidth: 1, // Épaisseur de la ligne blanche entre les options
    borderTopColor: "#FFFFFF", // Ajoutez cette ligne pour la bordure supérieure
    borderTopWidth: 1,
  },
});

export default ProfileScreen;
