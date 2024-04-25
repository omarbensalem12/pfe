import { StyleSheet, Text, View } from "react-native";
import React, { useEffect, useState } from 'react';
import { NavigationContainer } from "@react-navigation/native";
import LoginScreen from "./screens/LoginScreen";
import RegisterScreen from "./screens/RegisterScreen";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { FontAwesome } from "@expo/vector-icons"; 
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Entypo } from "@expo/vector-icons";
import { AntDesign } from "@expo/vector-icons";
import { Ionicons } from "@expo/vector-icons";
import ProfileScreen from "./screens/ProfileScreen";
import Menu from "./screens/menu";
import SignupContinue from "./screens/signupContinue";
import { useTranslation } from 'react-i18next';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useMyContext } from "./MyContext";
import LanguageSelectionScreen from "./screens/LanguageSelectionScreen";
import 'intl-pluralrules';
import TimerPage from "./screens/TimerPage";
import IntroScreen1 from "./screens/intro/IntroScreen1";
import IntroScreen2 from "./screens/intro/IntroScreen2";
import IntroScreen3 from "./screens/intro/IntroScreen3";
import ReservationListScreen from "./screens/reservationListScreen";
import parkingScreen from "./screens/parkingScreen";
import menu from "./screens/menu";
import ReservationList from "./screens/reservationListScreen";
const StackNavigator = ({ navigation }) => {
  const { t, i18n } = useTranslation();
  const { myValue, updateMyValue } = useMyContext();
  const Stack = createNativeStackNavigator();
  const Tab = createBottomTabNavigator();
  const [isFirstLaunch, setIsFirstLaunch] = useState(null);

  useEffect(() => {
    // Check if it's the first app launch
    async function checkFirstLaunch() {
      try {
        const isFirstTime = await AsyncStorage.getItem('isFirstLaunch');
        setIsFirstLaunch(isFirstTime === null);
      } catch (error) {
        console.error('Error checking first launch:', error);
      }
      try {
        const lg = await AsyncStorage.getItem('appLanguage');
        i18n.changeLanguage(lg)
      } catch (error) {

      }
    }

    checkFirstLaunch();
  }, []);



  function BottomTabs() {
    return (
      <>
        <Tab.Navigator>
          <Tab.Screen

            name="Home"
            // component={HomeScreen}

            component={Menu}
            listeners={{
              tabPress: e => {
                updateMyValue("")
              },
            }}
            options={{
              tabBarLabel: t("home"),
              tabBarLabelStyle: { color: "black" },
              headerShown: false,
              tabBarIcon: ({ focused }) =>
                focused ? (
                  <Entypo name="home" size={24} color="black" />
                ) : (
                  <AntDesign name="home" size={24} color="black" />
                ),
            }}
          />




          <Tab.Screen
            name="Profile"
            component={ProfileScreen}
            options={{
              tabBarLabel: t("Profile"),
              tabBarLabelStyle: { color: "black" },
              headerShown: false,
              tabBarIcon: ({ focused }) =>
                focused ? (
                  <Ionicons name="person" size={24} color="black" />
                ) : (
                  <Ionicons name="person-outline" size={24} color="black" />
                ),
            }}
          />
        <Tab.Screen
  name="Reservation"
  component={ReservationListScreen}
  options={{
    tabBarLabel: t("Resevations"),
    tabBarLabelStyle: { color: "black" },
    headerShown: false,
    tabBarIcon: ({ focused }) =>
    focused ? (
      <FontAwesome name="calendar" size={24} color="black" /> // Changez l'icône en 'calendar' de la bibliothèque FontAwesome
    ) : (
      <FontAwesome name="calendar" size={24} color="black" />
    ),
                
  }}
/>
        </Tab.Navigator>
        
      </>

    );
  }
  return (
    <NavigationContainer>
      <Stack.Navigator>
        {/* Language Selection Screen */}
        <Stack.Screen name="IntroScreen1" component={IntroScreen1} options={{ headerShown: false }} />
        <Stack.Screen name="IntroScreen2" component={IntroScreen2} options={{ headerShown: false }} />
        <Stack.Screen name="IntroScreen3" component={IntroScreen3} options={{ headerShown: false }} />


        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="LanguageSelection"
          component={LanguageSelectionScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Register"
          component={RegisterScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Main"
          component={BottomTabs}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="RegisterContinue"
          component={SignupContinue}
          options={{ headerShown: false }}
        />
<Stack.Screen name="TimerPage" component={TimerPage} options={{ headerShown: false }} />


      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default StackNavigator;

const styles = StyleSheet.create({});