import React, { useState, useEffect } from 'react';
import { View, Dimensions, StyleSheet, Text, Image, TextInput, Alert, Modal, Pressable, ScrollView } from 'react-native';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { useQuery } from 'react-query';
import { ActivityIndicator, Button, MD2Colors } from 'react-native-paper';

const Calendaricon = require('../assets/calender.png');
const cancelIcon = require('../assets/cancel.png');

export default function ReservationList({ hide }) {
    const { t } = useTranslation();

    const fetchLampposts = async () => {
        const data = await AsyncStorage.getItem("user");
        console.log(`${config.api}/api/parking/getReservationByUser?id=${JSON.parse(data).id}`)
        const response = await axios.get(`${config.api}/api/parking/getReservationByUser?id=${JSON.parse(data).id}`, {
            headers: {
                Authorization: `${JSON.parse(data).token}`,
            },
        });



        return response.data;
    };

    const queryInstanceLamppost = useQuery(`reservationsList`, fetchLampposts);
    const { data: lamppostsData, isLoading: lamppostsIsLoading, error: lamppostsError } = queryInstanceLamppost;

    const refetch = () => {
        queryInstanceLamppost.refetch();
    };

    const cancelReservation = (id) => {
        axios.put(`${config.api}/api/parking/cancelReservation?reservationId=${id}`, {})
            .then(res => {
                alert("reservation canceled")
                hide()
            })
            .catch(error => {
                alert("internet problem")

            })
    }



    if (lamppostsIsLoading) {
        return (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center", paddingTop: 20 }}>
                <ActivityIndicator size="large" animating={true} color={MD2Colors.red800} />
            </View>
        );
    }

    if (lamppostsError) {
        return <View>
            <Text>Error: {lamppostsError.message || ""}</Text>
        </View>;
    }


    return (
        <View>
            <Button
                style={{
                    width: 100,
                    marginLeft: 16,
                    marginTop: 50,
                    backgroundColor: "black",
                    borderRadius: 8,
                    color: "#FFF",
                }}
                icon="keyboard-backspace"
                labelStyle={{ color: "#FFF" }}
                onPress={() => {
                    hide()
                }}
            >
                {t("back")}
            </Button>
            <ScrollView>
                {
                    lamppostsData.map((el, i) => {
                        return (
                            <View key={el._id} style={{ margin: 5, padding: 5, borderRadius: 25, borderWidth: 1, width: Dimensions.get('window').width * 0.95 }}>
                                <View style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                                    <Image
                                        style={{
                                            width: 100,
                                            height: 100,
                                            borderRadius: 20,
                                            resizeMode: "contain",
                                        }}
                                        source={{
                                            uri: (el.parking.images[0] ? `${config.api}/api/images/${el.parking.images[0]}` : "https://cdn-icons-png.flaticon.com/128/149/149071.png"),
                                        }}
                                    />
                                    <View>
                                        <Text style={{ fontSize: 22, fontWeight: 900 }} > {el.parking.name}  </Text>
                                        <Text style={{ fontSize: 11, color: "gray", fontWeight: 400 }} > {JSON.stringify(new Date(el.startDate)).replaceAll('"', '').substr(0, 16)}  </Text>
                                        <Text style={{ fontSize: 11, color: "gray", fontWeight: 400 }} > {JSON.stringify(new Date(el.finishDate)).replaceAll('"', '').substr(0, 16)}  </Text>
                                        <View style={{ display: "flex", flexDirection: "row", justifyContent: "space-between" }}>
                                            <Text style={{ fontSize: 11, color: "green", fontWeight: 800 }} > {el.totalPrice} $  </Text>
                                            {/* {
                                                (el.reservationStatus == "Waiting") && <Button
                                                    style={{
                                                        width: 100,
                                                        marginLeft: 16,
                                                        marginTop: 30,
                                                        backgroundColor: "red",
                                                        borderRadius: 8,
                                                        color: "#FFF",
                                                    }}
                                                    icon="cancel"
                                                    labelStyle={{ color: "#FFF" }}
                                                    onPress={() => {
                                                        cancelReservation(el._id)
                                                    }}
                                                >
                                                    {t("cancel")}
                                                </Button>
                                            } */}
                                        </View>



                                    </View>
                                    <View style={{display:"flex",justifyContent:"center" ,alignItems:"center"}}>
                                        <Text style ={{backgroundColor:"lightgreen" , textAlign:"center" ,borderRadius:10 ,width:80 ,padding:5 , color:"white"}}>{el.reservationStatus}</Text>
                                        {
                                                (el.reservationStatus == "Waiting") && <Image
                                                style={{
                                                    width: 30,
                                                    height: 30,
                                                    marginTop:5,
                                                    resizeMode: "contain",
                                                }}
                                                onPress={() => {
                                                    cancelReservation(el._id)
                                                }}
                                                source={cancelIcon}
                                            />
                                                
                                                
                                                
                                                
                                            }
                                    </View>

                                </View>


                            </View>
                        )
                    })
                }
            </ScrollView>
        </View>
    )
}



