import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import React, { useState, useEffect, useContext } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import jwt_decode from "jwt-decode";
import axios from "axios";
import { UserType } from "../UserContext";
import User from "../components/User";
import config from "../config";
import { useTranslation } from 'react-i18next';
import 'intl-pluralrules';

const ActivityScreen = () => {
  const { t } = useTranslation()
  const [selectedButton, setSelctedButton] = useState("following");
  const [content, setContent] = useState("People Content");
  const [users, setUsers] = useState([]);
  const [follows, setFollows] = useState([]);

  const { userId, setUserId } = useContext(UserType);
  const handleButtonClick = (buttonName) => {
    setSelctedButton(buttonName);
  };
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const data = await AsyncStorage.getItem("user");

    const userId = JSON.parse(data).id;
    setUserId(userId);

    axios
      .get(`${config.api}/user/nonfollowers/${userId}`)
      .then((response) => {
        setUsers(response.data);
        console.log("nonfollowers", response.data);
      })
      .catch((error) => {
        console.log("error", JSON.stringify(error));
      });

    axios
      .get(`${config.api}/user/followers/${userId}`)
      .then((response) => {
        setFollows(response.data);
        console.log("followers", response.data);

      })
      .catch((error) => {
        console.log("error", JSON.stringify(error));
      });
  };
  return (
    <ScrollView style={{ marginTop: 50 }}>
      <View style={{ padding: 10 }}>
        <Text style={{ fontSize: 18, fontWeight: "bold" }}>{t("Activity")}</Text>

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 10,
            marginTop: 12,
          }}
        >
          <TouchableOpacity
            onPress={() => { handleButtonClick("following"); fetchUsers() }}
            style={[
              {
                flex: 1,
                paddingVertical: 10,
                paddingHorizontal: 20,
                backgroundColor: "white",
                borderColor: "#D0D0D0",
                borderRadius: 6,
                borderWidth: 0.7,
              },
              selectedButton === "following" ? { backgroundColor: "black" } : null,
            ]}
          >
            <Text
              style={[
                { textAlign: "center", fontWeight: "bold" },
                selectedButton === "following"
                  ? { color: "white" }
                  : { color: "black" },
              ]}
            >
              {t("following")}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => { handleButtonClick("users"); fetchUsers() }}
            style={[
              {
                flex: 1,
                paddingVertical: 10,
                paddingHorizontal: 20,
                backgroundColor: "white",
                borderColor: "#D0D0D0",
                borderRadius: 6,
                borderWidth: 0.7,
              },
              selectedButton === "users" ? { backgroundColor: "black" } : null,
            ]}
          >
            <Text
              style={[
                { fontWeight: "bold" },
                selectedButton === "users"
                  ? { color: "white" }
                  : { color: "black" },
              ]}
            >
              {t("users")}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => { handleButtonClick("all"); fetchUsers() }}
            style={[
              {
                flex: 1,
                paddingVertical: 10,
                paddingHorizontal: 20,
                backgroundColor: "white",
                borderColor: "#D0D0D0",
                borderRadius: 6,
                borderWidth: 0.7,
              },
              selectedButton === "all"
                ? { backgroundColor: "black" }
                : null,
            ]}
          >
            <Text
              style={[
                { textAlign: "center", fontWeight: "bold" },
                selectedButton === "all"
                  ? { color: "white" }
                  : { color: "black" },
              ]}
            >
              {t("all")}
            </Text>
          </TouchableOpacity>
        </View>

        <View>
          <View style={{ marginTop: 20 }}>
            {(selectedButton === "following" || selectedButton === "all") && follows?.map((item, index) => (
              <User isFallowed={true} key={index} item={item} />
            ))}
            {(selectedButton === "users" || selectedButton === "all") && users?.map((item, index) => (
              <User isFallowed={false} key={index} item={item} />
            ))}
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default ActivityScreen;

const styles = StyleSheet.create({});
