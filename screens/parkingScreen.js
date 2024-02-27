import React, { useState, useEffect } from 'react';
import MapView, { Callout, Marker, Polyline } from 'react-native-maps';
import { View, Dimensions, StyleSheet, Text, Image, TextInput, Alert, Modal, Pressable } from 'react-native';
import { Button } from 'react-native-paper';

import axios from 'axios';
import { useQuery } from 'react-query';
import { ActivityIndicator, MD2Colors } from 'react-native-paper';
import * as Location from 'expo-location';
import Slider from '@react-native-community/slider';

import parking from "../assets/parking.png"
import currentPoint from "../assets/car.png"

import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTranslation } from 'react-i18next';
import 'intl-pluralrules';
import config from '../config';
import Reservation from './reservationScreen';
import ReservationList from './reservationListScreen';
import { Linking } from 'react-native';




export default function ParkingMap({ navigation }) {

    const apiKey = '5b3ce3597851110001cf6248cb3e2e9b07254b5ea1470797f74bb740';

    const [road, setroad] = useState([])
    const [searchRange, setSearchRange] = useState(5)

    const convertedCoordinates = road.map(([longitude, latitude]) => ({
        latitude,
        longitude,
    }));
    const { t } = useTranslation();
    const [selectedParkingIndex, setSelectedParkingIndex] = useState(-1);
    const [showParking, setShowParking] = useState(false);
    const [selectedparking, setSelectedparking] = useState(null);


    const [showReservatioList, setShowReservatioList] = useState(false);





    const [initialView, setInitialView] = useState({
        latitude: 36.84742282789699,
        longitude:10.292955920511811,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421
    });
    useEffect(() => {
        const fetchData = async () => {
            try {
                let { status } = await Location.requestForegroundPermissionsAsync();
                if (status !== 'granted') {
                    console.log('Permission to access location was denied');
                    return;
                }
                let currentLocation = await Location.getCurrentPositionAsync({});
                console.log(currentLocation)
                setInitialView({
                    latitude: currentLocation?.coords?.latitude,
                    longitude: currentLocation?.coords?.longitude,
                    latitudeDelta: 0.0922,
                    longitudeDelta: 0.0421
                })
                setTimeout(() => { refetch() }, 1000)
                console.log(currentLocation);
            } catch (error) {
                console.error('Error fetching current location:', error);
            }
        };
    
        fetchData(); 
    
    }, []); 
    
          
    const haversine = require('haversine');
    const fetchLampposts = async () => {
        const data = await AsyncStorage.getItem("user");
        const response = await axios.get(`${config.api}/api/parking/getParkingLotsNearby`, {
            headers: {
                Authorization: `${JSON.parse(data).token}`,
            },
        });
    
        const userLocation = {
            latitude: initialView.latitude,
            longitude: initialView.longitude,
        };
    
        const filteredParkingLots = response.data.filter(parkingLot => {
            const parkingLotLocation = {
                latitude: parkingLot.latitude,
                longitude: parkingLot.longitude,
            };
            const distance = haversine(userLocation, parkingLotLocation, { unit: 'km' });
            return distance <= searchRange; 
        });
    
        if (filteredParkingLots.length) {
            alert(`${filteredParkingLots.length} parking lots within ${searchRange} km range.`);
        }
    
        return filteredParkingLots;
    };
    
    // const fetchLampposts = async () => {
    //     const data = await AsyncStorage.getItem("user");
    //     const response = await axios.get(`${config.api}/api/parking/getParkingLotsNearby`, {
    //         headers: {
    //             Authorization: `${JSON.parse(data).token}`,
    //         },
    //     });
    
    //     const userLocation = {
    //         latitude: initialView.latitude,
    //         longitude: initialView.longitude,
    //     };
    
    //     const parkingLotsWithDistance = await Promise.all(
    //         response.data.map(async (parkingLot) => {
    //             try {
    //                 const end = `${parkingLot.longitude},${parkingLot.latitude}`;
    //                 const directionsResponse = await fetch(
    //                     `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${apiKey}&start=${userLocation.longitude},${userLocation.latitude}&end=${end}`
    //                 );
    //                 const directionsData = await directionsResponse.json();
    
    //                 if (
    //                     directionsData.features &&
    //                     directionsData.features[0] &&
    //                     directionsData.features[0].properties &&
    //                     directionsData.features[0].properties.segments &&
    //                     directionsData.features[0].properties.segments[0]
    //                 ) {
    //                     const distance = directionsData.features[0].properties.segments[0].distance;
    //                     const distanceInKm = distance / 1000;
    
    //                     return {
    //                         ...parkingLot,
    //                         distance: distanceInKm,
    //                     };
    //                 } else {
    //                     console.error('Error: Invalid data format received from directions API');
    //                     return parkingLot;
    //                 }
    //             } catch (error) {
    //                 console.error('Error fetching route:', error);
    //                 return parkingLot;
    //             }
    //         })
    //     );
    
    //     const filteredParkingLots = parkingLotsWithDistance.filter((parkingLot) => {
    //         // Utilisez la mesure de distance réelle pour le filtrage
    //         return parkingLot.distance <= searchRange;
    //     });
    
    //     if (filteredParkingLots.length) {
    //         alert(`${filteredParkingLots.length} parking lots within ${searchRange} km range.`);
    //     }
    
    //     return filteredParkingLots;
    // };
    
    

    const queryInstanceLamppost = useQuery(`searchLampposts`, fetchLampposts);
    const { data: lamppostsData, isLoading: lamppostsIsLoading, error: lamppostsError } = queryInstanceLamppost;

    const refetch = () => {
        queryInstanceLamppost.refetch();
    };

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

    const getRoute = async (s) => {
        try {
            const response = await fetch(
                `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${apiKey}&start=${initialView.longitude},${initialView.latitude}&end=${s.longitude},${s.latitude}`
            );

            const data = await response.json();
            const coordinates = data.features[0].geometry.coordinates;
            setroad(coordinates);
            console.log(coordinates)
        } catch (error) {
            console.error('Error fetching route:', error);
        }
    };

    // const getRoad = (s) => {
    //     axios.get(`http://router.project-osrm.org/route/v1/foot/${s.longitude},${s.latitude};${initialView.longitude},${initialView.latitude}?steps=true`)
    //         .then(res => { setroad(res.data.routes[0].legs[0].steps[0].intersections.map(el2 => { return el2.location })) })
    //         .catch(err => { console.log(err); })
    // }



    const setNoParking = () => {
        setSelectedparking(null)
        setSelectedParkingIndex(-1)
    }

    return (
        <View>
            <Modal
                animationType="slide"
                transparent={true}
                visible={showParking}
                onRequestClose={() => {
                    Alert.alert('Modal has been closed.');
                    setShowParking(false);
                    ; setSelectedParkingIndex(-1)
                }}>
                <View style={styles.centeredView}>
                    <View style={styles.modalView}>
                        <Pressable
                            style={[styles.buttonClose]}
                            onPress={() => { setShowParking(false); setSelectedParkingIndex(-1) }}>
                            <Text style={styles.textStyle}>X</Text>
                        </Pressable>
                        <Pressable
                            style={[styles.button, styles.buttonOpen]}
                            onPress={() => {
                                setShowParking(false); setTimeout(() => {
                                    setSelectedParkingIndex(-1);
                                }, 500); console.log(selectedParkingIndex); setSelectedparking(lamppostsData[selectedParkingIndex])
                            }}>
                            <Text style={styles.text}>{t("book")}</Text>
                        </Pressable>

                        <Pressable
    style={[styles.button, styles.buttonOpen]}
    onPress={() => {
        getRoute(lamppostsData[selectedParkingIndex]);
        setShowParking(false);

    
        Alert.alert(
            "Guide pour la route",
            "Tu veux un guide pour la route ?",
            [
                {
                    text: "Non",
                    onPress: () => {
                        
                    },
                    style: "cancel",
                },
                {
                    text: "Oui",
                    onPress: () => {
                        
                        const destination = lamppostsData[selectedParkingIndex];
                        const url = `https://www.google.com/maps/dir/?api=1&destination=${destination.latitude},${destination.longitude}`;
                        Linking.openURL(url);
                    },
                },
            ],
            { cancelable: false }
        );
    }}
>
    <Text style={styles.text}>{t("road")}</Text>
</Pressable>


                           
                            
                            
                        
                        <Pressable
                            style={[styles.button, styles.buttonOpen]}
                            onPress={() => { setroad([]); setShowParking(false) }}>
                            <Text style={styles.text}>{t("hide road")}</Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>

            {
                selectedparking && (
                    <Reservation setNoParking={setNoParking} selectedparking={selectedparking} />
                )
            }

            {
                (!selectedparking && !showReservatioList) &&
                <View>
                    <View style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginRight: 10 }} >
                        <Button
                            style={styles.backButton}
                            labelStyle={{ color: "#FFF" }}
                            onPress={() => {
                                setShowReservatioList(true)
                            }}
                        >
                            {t("Resevations")}
                        </Button>
                        <View style={{ paddingTop: 20, display: "flex", alignItems: "center" }}>
                <Text>{searchRange} Km</Text>
                <Slider
                   onValueChange={(value) => { setSearchRange(value) }}  
                   onSlidingComplete={refetch}
                   style={{ width: 200, height: 40 }}
                    minimumValue={1}
                    maximumValue={20}
                    step={1}  
                    value={searchRange}
                    thumbTouchSize={{ width: 40, height: 40 }} 
                   />

            </View>

                    </View>

                    <MapView style={styles.map} region={initialView} >


                        <Marker
                            coordinate={{
                                latitude: Number(initialView.latitude),
                                longitude: Number(initialView.longitude),
                            }}
                        >
                            <Image source={currentPoint} style={styles.markerImage} />
                            <Callout style={styles.calloutContainer}>
                                <View style={styles.calloutContent}>
                                    <Text style={styles.calloutText}>
                                        {t("me")}
                                    </Text>
                                </View>
                            </Callout>
                        </Marker>

                        {lamppostsData.map((el, i) => {
                            const markerKey = i.toString();
                            return (
                                <Marker
                                    key={markerKey}
                                    coordinate={{
                                        latitude: Number(el.latitude),
                                        longitude: Number(el.longitude),
                                    }}
                                    onPress={() => {
                                        setShowParking(true);
                                        setSelectedParkingIndex(i)
                                    }}
                                >
                                    <View style={[styles.markerContainer, { backgroundColor: el.status ? '#4CAF50' : '#F44336' }]}>
                                        <Image source={parking} style={styles.markerImage} />
                                    </View>
                                    <Callout style={styles.calloutContainer}>
                                        <View style={styles.calloutContent}>
                                            <Text style={styles.calloutText}>
                                                {el.name}
                                            </Text>
                                        </View>
                                    </Callout>
                                </Marker>

                            );
                        })}
                        <Polyline
                            coordinates={convertedCoordinates}
                            strokeWidth={3}
                            strokeColor="hotpink"
                        />

                    </MapView>
                </View>

            }

            {
                showReservatioList && <ReservationList hide={() => { setShowReservatioList(false) }} />
            }

        </View>
    )

}


const styles = StyleSheet.create({
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
    backButton: {
        width: 150,
        marginLeft: 16,
        marginTop: 50,
        backgroundColor: "black",
        borderRadius: 8,
        color: "#FFF",
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
