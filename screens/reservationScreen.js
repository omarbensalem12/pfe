import React, { useState, useEffect } from 'react';
import { View, Dimensions, StyleSheet, Text, Image, TextInput, Alert, Modal, Pressable, TouchableOpacity, ScrollView, FlatList } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import config from '../config';
import axios from 'axios';
import { Picker } from '@react-native-picker/picker';
import { useTranslation } from 'react-i18next';
import { Button } from 'react-native-paper';
import QRCode from 'react-native-qrcode-svg';

import AsyncStorage from "@react-native-async-storage/async-storage";
const Calendaricon = require('../assets/calendar.png');
const Clockicon = require('../assets/clock.png');
const Obteniricon = require('../assets/obtenir.png');
const Reserveicon = require('../assets/reserve.png');
const Unavailableicon = require('../assets/unavailable.png');
const Bookicon = require('../assets/book.png');

const carIcon = require("../assets/car.png");
const busIcon = require("../assets/bus.png");
const bycicleIcon = require("../assets/bycicle.png");
const truckIcon = require("../assets/truck.png");
const deliveryTruckIcon = require("../assets/deliveryTruck.png");
const blackcarIcon = require("../assets/blackcar.png");



export default function Reservation({ navigation, selectedparking, setNoParking }) {
    const { t } = useTranslation();

    const spotTypesButtons = [
        { key: "Car", label: t("Car"), image: carIcon },
        { key: "Bus", label: t("Bus"), image: busIcon },
        { key: "Bycle", label: t("Bycle"), image: bycicleIcon },
        { key: "Truck", label: t("Truck"), image: truckIcon },
        { key: "Delivery Truck", label: t("Delivery Truck"), image: deliveryTruckIcon }
    ]
    function chunkArray(array, chunkSize) {
        // Validate input parameters
        if (!Array.isArray(array) || typeof chunkSize !== 'number' || chunkSize <= 0) {
            throw new Error('Invalid input parameters');
        }

        const result = [];
        for (let i = 0; i < array.length; i += chunkSize) {
            result.push(array.slice(i, i + chunkSize));
        }
        return result;
    }

    const [payementMethod, setPayementMethod] = useState("Cash")
    const [licencePlate, setLicencePlate] = useState("")
    const [SpotType, setSpotType] = useState("")
    const [reservedSpots, setReservedSpots] = useState([])
    const [spots, setspots] = useState(chunkArray(selectedparking.parkingSpots, 4))

    const [selectedSpot, setSelectedSpot] = useState(null)
    const [currentStep, setCurrentStep] = useState("");

    const [showStartDate, setShowStartDate] = useState(false);
    const [showStarttime, setShowStarttime] = useState(false);
    const [showfinishDate, setShowfinishDate] = useState(false);
    const [showfinishTime, setShowfinishTime] = useState(false);

    const [StartDate, setStartDate] = useState(new Date());
    const [Starttime, setStarttime] = useState(new Date());
    const [finishDate, setfinishDate] = useState(new Date());
    const [finishTime, setfinishTime] = useState(new Date());
    const getStart = () => {
        const hour = Starttime.getHours() < 10 ? "0" + Starttime.getHours() : Starttime.getHours()
        const minute = Starttime.getMinutes() < 10 ? "0" + Starttime.getMinutes() : Starttime.getMinutes()
        const day = StartDate.getDate() < 10 ? "0" + StartDate.getDate() : StartDate.getDate()
        const month = (StartDate.getMonth() + 1) < 10 ? "0" + (StartDate.getMonth() + 1) : (StartDate.getMonth() + 1)
        const year = StartDate.getFullYear()

        return `${year}-${month}-${day}T${hour}:${minute}:00`
    }

    const getEnd = () => {
        const hour = finishTime.getHours() < 10 ? "0" + finishTime.getHours() : finishTime.getHours()
        const minute = finishTime.getMinutes() < 10 ? "0" + finishTime.getMinutes() : finishTime.getMinutes()
        const day = finishDate.getDate() < 10 ? "0" + finishDate.getDate() : finishDate.getDate()
        const month = (finishDate.getMonth() + 1) < 10 ? "0" + (finishDate.getMonth() + 1) : (finishDate.getMonth() + 1)
        const year = finishDate.getFullYear()

        return `${year}-${month}-${day}T${hour}:${minute}:00`
    }

    const getAvailableParkingSpots = () => {
        axios.get(`${config.api}/api/parking/getAvailableParkingSpots?startDate=${getStart()}&finishDate=${getEnd()}&parkingLotId=${selectedparking._id}`)
            .then(res => {
                setCurrentStep("search")
                setReservedSpots(res.data.occupiedParkingSpots)
                console.log(res.data)
            })
            .catch(err => {
                console.log(err);
            })
    }

    const getHoursDifference = () => {
        const startTimestamp = (new Date(getStart())).getTime();
        const endTimestamp = (new Date(getEnd())).getTime();

        // Calculate the difference in milliseconds
        const timeDifference = Math.abs(endTimestamp - startTimestamp);

        // Convert milliseconds to hours
        const hoursDifference = timeDifference / (1000 * 60 * 60);

        return hoursDifference;
    }


    const createReservation = async () => {
        const data = await AsyncStorage.getItem("user");

        axios.post(`${config.api}/api/parking/createReservation`, {
            "licencePlate": licencePlate,
            "payementStatus": "Hold",
            "payementMethod": payementMethod,
            "totalPrice": getHoursDifference() * selectedSpot.pricePerHour,
            "parkingSpot": selectedSpot._id,
            "parking": selectedparking._id,
            "user": JSON.parse(data).id,
            "finishDate": getEnd(),
            "startDate": getStart()
        }).then(res => {
            setNoParking()
            alert(t("reservation created"));

        })
    }

    const renderCard = (button) => (
        <TouchableOpacity
            key={button.key}
            style={styles.card}
            onPress={() => setSpotType(button.key)}
        >
            <Image source={button.image} style={styles.cardImage} />
            <Text style={styles.cardLabel}>{button.label}</Text>
        </TouchableOpacity>
    );




    return (
        <View style={{ flex: 1, backgroundColor: "white" }}>

            {SpotType &&
                <View style={{ paddingTop: (Dimensions.get('window').height * 0.05) }}>
                    {currentStep == "" && <View>
                        <View style={{ display: "flex", flexDirection: "row", width: Dimensions.get('window').width * 0.95, justifyContent: "space-between", alignItems: "center" }}>
                            <View>
                                <View style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "center", width: Dimensions.get('window').width * 0.9 }}>
                                    <Pressable style={{ ...styles.button, padding: 10, backgroundColor: "#2828ff", borderRadius: 5, borderWidth: 1, width: Dimensions.get('window').width * 0.4 }} onPress={() => { setShowStartDate(true) }} >
                                        <Text style={{ color: "white" }}  > {t("Start date")}</Text>
                                    </Pressable>
                                    <Text style={{ fontWeight: 900, fontSize: 18 }}>
                                        <Image
                                            style={{
                                                width: 25,
                                                height: 25,
                                                resizeMode: "contain",
                                            }}
                                            source={Calendaricon}
                                        />
                                        {getStart().substring(0, 10)}  </Text>
                                </View>

                                <View style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "center", width: Dimensions.get('window').width * 0.9 }}>
                                    <Pressable style={{ ...styles.button, padding: 10, backgroundColor: "#2828ff", borderRadius: 5, borderWidth: 1, width: Dimensions.get('window').width * 0.4 }} onPress={() => { setShowStarttime(true) }} >
                                        <Text style={{ color: "white" }}  >{t("Start time")}</Text>
                                    </Pressable>
                                    <Text style={{ fontWeight: 900, fontSize: 18 }}>
                                        <Image
                                            style={{
                                                width: 25,
                                                height: 25,
                                                resizeMode: "contain",
                                            }}
                                            source={Clockicon}
                                        />
                                        {getStart().substring(11, 16)}  </Text>
                                </View>
                            </View>
                        </View>


                        <View style={{ display: "flex", flexDirection: "row", width: Dimensions.get('window').width * 0.95, justifyContent: "space-between", alignItems: "center" }}>
                            <View>
                                <View style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "center", width: Dimensions.get('window').width * 0.9 }}>
                                    <Pressable style={{ ...styles.button, padding: 10, backgroundColor: "#2828ff", borderRadius: 5, borderWidth: 1, width: Dimensions.get('window').width * 0.4 }} onPress={() => { setShowfinishDate(true) }} >
                                        <Text style={{ color: "white" }}  > {t("Finish date")}</Text>
                                    </Pressable>
                                    <Text style={{ fontWeight: 900, fontSize: 18 }}>
                                        <Image
                                            style={{
                                                width: 25,
                                                height: 25,
                                                resizeMode: "contain",
                                            }}
                                            source={Calendaricon}
                                        />
                                        {getEnd().substring(0, 10)}  </Text>
                                </View>

                                <View style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "center", width: Dimensions.get('window').width * 0.9 }}>
                                    <Pressable style={{ ...styles.button, padding: 10, backgroundColor: "#2828ff", borderRadius: 5, borderWidth: 1, width: Dimensions.get('window').width * 0.4 }} onPress={() => { setShowfinishTime(true) }} >
                                        <Text style={{ color: "white" }}  >{t("Finish time")}</Text>
                                    </Pressable>
                                    <Text style={{ fontWeight: 900, fontSize: 18 }}>
                                        <Image
                                            style={{
                                                width: 25,
                                                height: 25,
                                                resizeMode: "contain",
                                            }}
                                            source={Clockicon}
                                        />
                                        {getEnd().substring(11, 16)}  </Text>
                                </View>
                            </View>
                        </View>

                        {showStartDate && (
                            <DateTimePicker
                                value={StartDate}
                                mode="date"
                                is24Hour={true}
                                display="default"
                                onChange={(e) => {
                                    setStartDate(new Date(e.nativeEvent.timestamp))
                                    setShowStartDate(false);
                                }}
                            />
                        )}
                        {showStarttime && (
                            <DateTimePicker
                                value={Starttime}
                                mode="time"
                                is24Hour={true}
                                display="default"
                                onChange={(e) => {
                                    setStarttime(new Date(e.nativeEvent.timestamp))
                                    setShowStarttime(false);
                                }
                                }
                            />
                        )}
                        {showfinishDate && (
                            <DateTimePicker
                                value={finishDate}
                                mode="date"
                                is24Hour={true}
                                display="default"
                                onChange={(e) => { setfinishDate(new Date(e.nativeEvent.timestamp)); setShowfinishDate(false) }}
                            />
                        )}
                        {showfinishTime && (
                            <DateTimePicker
                                value={finishTime}
                                mode="time"
                                is24Hour={true}
                                display="default"
                                onChange={(e) => { setfinishTime(new Date(e.nativeEvent.timestamp)); setShowfinishTime(false) }}
                            />
                        )}

                        <View style={{ display: "flex", flexDirection: "row", justifyContent: "center" }}>
                            <Pressable style={{ ...styles.button, padding: 10, backgroundColor: "#f77474", margin: 10, borderRadius: 5, width: Dimensions.get('window').width * 0.9, borderWidth: 1 }} onPress={getAvailableParkingSpots}>
                                <Text style={{ textAlign: "center" }} >
                                    <Image
                                        style={{
                                            width: 25,
                                            height: 25,
                                            resizeMode: "contain",
                                        }}
                                        source={Obteniricon}
                                    />  {t("get available spots")} </Text>
                            </Pressable>
                        </View>
                    </View>}

                    <ScrollView style={{ height: Dimensions.get('window').height * 0.9 }}>

                            <View style={{ width: Dimensions.get('window').width * 0.9 }}>

                                <Button
                                    style={styles.backButton}
                                    labelStyle={{ color: "#FFF" }}
                                    onPress={() => {
                                        setCurrentStep("")
                                    }}
                                >
                                    {t("Back to Date")}
                                </Button>

                                {
                                    chunkArray(selectedparking.parkingSpots, 6).map((el, i) => {
                                        return (
                                            <View style={{ width: Dimensions.get('window').width * 0.9, height: Dimensions.get('window').height * 0.45, display: "flex", flexDirection: "row", flexWrap: "wrap", alignContent: "center", paddingLeft: Dimensions.get('window').width * 0.05 }} key={i}>
                                                {el.map((el1) => {
                                                    return (
                                                        <View key={el1._id} style={{ borderWidth: 1, borderColor: "black", width: Dimensions.get('window').width * 0.42, height: Dimensions.get('window').height * 0.11, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
                                                            {reservedSpots.includes(el1._id) && <Image source={blackcarIcon} style={{ width: Dimensions.get('window').width * 0.4, height: Dimensions.get('window').height * 0.1 }} />}
                                                            {!reservedSpots.includes(el1._id) &&
                                                                <Pressable onPress={() => { setSelectedSpot(el1), setCurrentStep("reservation") }} style={({ pressed }) => [
                                                                    { width: Dimensions.get('window').width * 0.4, height: Dimensions.get('window').height * 0.1, display: "flex", justifyContent: "center", backgroundColor: "#dfe2e5" },
                                                                    {
                                                                        opacity: pressed ? 0.5 : 1,
                                                                    },
                                                                    // Add other styles or effects here
                                                                ]}   >
                                                                    <Text style={{ textAlign: "center", fontSize: 26, fontWeight: 900 }}> {el1.name} </Text>
                                                                </Pressable>
                                                            }
                                                        </View>
                                                    )

                                                })}
                                            </View>
                                        )
                                        // return (
                                        //     <View key={el._id} style={{ borderWidth: 1, borderRadius: 10, padding: 5, margin: 5 }}>
                                        //         <View>
                                        //             <View style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                                        //                 <View style={{ position: "relative" }} >
                                        //                     <Image
                                        //                         style={{
                                        //                             width: 100,
                                        //                             height: 100,
                                        //                             borderRadius: 20,
                                        //                             resizeMode: "contain",
                                        //                         }}
                                        //                         source={{
                                        //                             uri: (selectedparking.images[0] ? `${config.api}/api/images/${selectedparking.images[0]}` : "https://cdn-icons-png.flaticon.com/128/149/149071.png"),
                                        //                         }}
                                        //                     />
                                        //                     <Text style={{
                                        //                         margin: 5, position: "absolute", color: 'white', // Set text color to white
                                        //                         textShadowColor: 'rgba(0, 0, 0, 0.75)', // Shadow color (black with 75% opacity)
                                        //                         textShadowOffset: { width: 2, height: 2 }, // Shadow offset (x, y)
                                        //                         textShadowRadius: 5, // Shadow radius
                                        //                         fontSize: 24,
                                        //                         textAlign: "center",
                                        //                         width: 100,
                                        //                         marginTop: 20,

                                        //                     }}>
                                        //                         {el.name}
                                        //                     </Text>
                                        //                 </View>
                                        //                 <View>
                                        //                     <Text style={{ margin: 5, fontWeight: 900, fontSize: 18 }}>
                                        //                         {el.pricePerHour} dt/h
                                        //                     </Text>
                                        //                 </View>
                                        //                 {
                                        //                     !reservedSpots.includes(el._id) &&
                                        //                     <View style={{ display: "flex", flexDirection: "row", justifyContent: "center" }}>
                                        //                         <Pressable onPress={() => { setSelectedSpot(el), setCurrentStep("reservation") }} style={{ ...styles.button, borderWidth: 0, backgroundColor: "white" }} >
                                        //                             <Image
                                        //                                 style={{
                                        //                                     width: 50,
                                        //                                     height: 50,
                                        //                                     resizeMode: "contain",
                                        //                                 }}
                                        //                                 source={Reserveicon}
                                        //                             />
                                        //                         </Pressable>
                                        //                     </View>
                                        //                 }
                                        //                 {
                                        //                     reservedSpots.includes(el._id) &&
                                        //                     <View style={{ display: "flex", flexDirection: "row", justifyContent: "center" }}>
                                        //                         <Pressable style={{ ...styles.button, borderWidth: 0, backgroundColor: "white" }} >
                                        //                             <Image
                                        //                                 style={{
                                        //                                     width: 50,
                                        //                                     height: 50,
                                        //                                     resizeMode: "contain",
                                        //                                 }}
                                        //                                 source={Unavailableicon}
                                        //                             />
                                        //                         </Pressable>
                                        //                     </View>
                                        //                 }
                                        //             </View>

                                        //             {/* <Text style={{ margin: 5 }}>
                                        //         {t("spotType")} : {el.spotType}
                                        //     </Text> */}


                                    })}
                            </View>
                        }

                        {
                            currentStep == "reservation" &&
                            <View>
                                <Text style={{ padding: 10, fontWeight: 900, color: "green", fontSize: 18, }}  >  {getHoursDifference() * selectedSpot.pricePerHour} Dt </Text>
                                <Text style={{ padding: 10, fontWeight: 900, color: "black", fontSize: 18, }}  > {t("from")}  {getStart().substring(0, 16)} </Text>
                                <Text style={{ padding: 10, fontWeight: 900, color: "black", fontSize: 18, }}  > {t("to")}  {getEnd().substring(0, 16)} </Text>

                                <View style={{ borderWidth: 1, borderColor: "red", width: Dimensions.get('window').width * 0.9, margin: 10, borderRadius: 10 }}>
                                    <Picker
                                        selectedValue={payementMethod}
                                        placeholder='mode de payement'
                                        onValueChange={(itemValue, itemIndex) =>
                                            setPayementMethod(itemValue)
                                        }>
                                        <Picker.Item label={t("Cash")} value="Cash" />
                                        <Picker.Item label={t("Credit and Debit Cards")} value="Credit and Debit Cards" />
                                        <Picker.Item label={t("Bank Transfers")} value="Bank Transfers" />
                                        <Picker.Item label={t("Point-of-Sale (POS) Financing")} value="Point-of-Sale (POS) Financing" />
                                        <Picker.Item label={t("Prepaid Cards")} value="Prepaid Cards" />
                                        <Picker.Item label={t("Bill Pay Services")} value="Bill Pay Services" />
                                        <Picker.Item label={t("Automatic Clearing House (ACH) Payments")} value="Automatic Clearing House (ACH) Payments" />
                                        <Picker.Item label={t("In-App Purchases")} value="In-App Purchases" />
                                        <Picker.Item label={t("Gift Cards")} value="Gift Cards" />
                                        <Picker.Item label={t("Barter")} value="Barter" />
                                        <Picker.Item label={t("Money Orders")} value="Money Orders" />
                                        <Picker.Item label={t("Contactless Payments")} value="Contactless Payments" />
                                        <Picker.Item label={t("PayPal and Other Online Payment Platforms")} value="PayPal and Other Online Payment Platforms" />
                                        <Picker.Item label={t("Cryptocurrencies")} value="Cryptocurrencies" />
                                        <Picker.Item label={t("Mobile Payments")} value="Mobile Payments" />
                                        <Picker.Item label={t("Checks")} value="Checks" />
                                        <Picker.Item label={t("Electronic Funds Transfer (EFT)")} value="Electronic Funds Transfer (EFT)" />
                                    </Picker>
                                </View>

                                <TextInput
                                    placeholder={t("Licence Plate ...")}
                                    value={licencePlate}
                                    onChangeText={setLicencePlate}
                                    style={{ ...styles.searchInput, margin: 10, padding: 10 }}
                                />
                                <View style={{ display: "flex", flexDirection: "row", justifyContent: "center" }}>
                                    <Pressable style={{ ...styles.button, backgroundColor: "#65e787" }} onPress={createReservation}>
                                        <Text style={{ marginBottom: 5, marginRight: 5 }}> <Image
                                            style={{
                                                width: 25,
                                                height: 25,
                                                resizeMode: "contain",
                                            }}
                                            source={Bookicon}
                                        />{t("book")}</Text>
                                    </Pressable>
                                </View>
                                <View style={{ display: "flex", alignItems: "center" , width: Dimensions.get('window').width * 0.9 }}>

                                    <Text style={{ margin:10, fontSize: 24, fontWeight: "bold" }}>{t("Spot QR Code")}</Text>
                                    <QRCode
                                        value={selectedSpot._id}
                                        size={200}
                                    />
                                </View>
                            </View>
                        }
                    </ScrollView>


                </View>}

            {
                !SpotType && <View style={{ display: "flex", flexDirection: "row", justifyContent: "center", marginTop: Dimensions.get('window').height * 0.1, flexWrap: "wrap" }}>
                    {spotTypesButtons.map(renderCard)}
                </View>
            }
        </View>
    )
}

const styles = StyleSheet.create({
    searchInput: {
        paddingLeft: 5,
        borderRadius: 8,
        borderWidth: 2
    },
    mapContainer: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    map: {
        width: Dimensions.get('window').width,
        height: Dimensions.get('window').height * 1,
    },
    searchZone: {
        position: 'absolute',
        bottom: 20,
        width: Dimensions.get('window').width,
        height: 100,
        padding: 16,
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        zIndex: 1,
    },
    cardImage: {
        width: 100, // Ajustez la largeur en fonction de vos besoins
        height: 100, // Ajustez la hauteur en fonction de vos besoins
        marginBottom: 5, // Ajustez la marge en fonction de vos besoins
        borderRadius: 10,
        margin: 10,
    },
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
    input: {
        height: 40,
        margin: 12,
        borderWidth: 1,
        padding: 10,
    },
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 22,
    },
    backButton: {
        width: 150,
        marginLeft: 16,
        marginTop: 50,
        backgroundColor: "black",
        borderRadius: 8,
        color: "#FFF",
    },
    modalView: {
        margin: 20,
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 35,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    button: {
        borderRadius: 20,
        padding: 5,
        elevation: 2,
        margin: 5
    },
    buttonOpen: {
        backgroundColor: 'blue',
        width: 100,
        height: 30,
        borderRadius: 10,
    },
    buttonClose: {
        backgroundColor: "transparent",
        position: "absolute",
        top: -15,
        right: -15,
    },
    textStyle: {
        backgroundColor: 'red',
        width: 30,
        height: 30,
        borderRadius: 50,
        textAlign: "center",
        color: "white",
        fontSize: 20,
    },
    text: {
        textAlign: "center",
        color: "white",
        fontSize: 16,
    },
    markerImage: {
        width: 40,
        height: 40,
        borderRadius: 20,
    },
    calloutContainer: {
        borderRadius: 8,
        width: 160,
    },
    calloutContent: {
        padding: 10,
        alignItems: 'center',
    },
    calloutText: {
        color: 'black',
        fontSize: 16,
        fontWeight: 'bold',
    },
    markerContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: 'white',
    },
});