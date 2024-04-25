
import React from 'react';
import { View, StyleSheet, Text, Image, ScrollView, TouchableOpacity } from 'react-native';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { useQuery } from 'react-query';
import { ActivityIndicator, MD2Colors, Button as PaperButton } from 'react-native-paper';
import moment from 'moment'; 
import { useNavigation } from '@react-navigation/native'; 
import { useFocusEffect } from '@react-navigation/native';
import { FontAwesome } from '@expo/vector-icons';

export default function ReservationList({ hide, reservation }) {
    const { t } = useTranslation();
    const navigation = useNavigation();
    
    const fetchReservations = async () => {
        const userData = await AsyncStorage.getItem("user");
        const userId = JSON.parse(userData).id;
        const token = JSON.parse(userData).token;
        const response = await axios.get(`${config.api}/api/parking/getReservationByUser?id=${userId}`, {
            headers: {
                Authorization: token,
            },
        });
        return response.data;
    };

    const queryInstanceReservations = useQuery(`reservationsList`, fetchReservations);
    const { data: reservationsData, isLoading: reservationsIsLoading, error: reservationsError } = queryInstanceReservations;

    useFocusEffect(
        React.useCallback(() => {
            refetch();
        }, [])
    );

    const refetch = () => {
        queryInstanceReservations.refetch();
    };

    const cancelReservation = (id) => {
        axios.put(`${config.api}/api/parking/cancelReservation?reservationId=${id}`, {})
            .then(res => {
                alert("Reservation canceled");
                hide();
            })
            .catch(error => {
                alert("Internet problem");
            });
    };

    if (reservationsIsLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" animating={true} color={MD2Colors.red800} />
            </View>
        );
    }

    if (reservationsError) {
        return <View style={styles.errorContainer}>
            <Text>Error: {reservationsError.message || ""}</Text>
        </View>;
    }

    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.addButton} onPress={() => navigation.goBack()}>
                <FontAwesome name="arrow-left" size={24} color="white" />
            </TouchableOpacity>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                {reservationsData.map((reservation, index) => (
                    <View key={reservation._id} style={styles.reservationCard} >
                        <View style={styles.header}>
                            <Text style={styles.parkingName}>{reservation.parking.name}</Text>
                            <FontAwesome name="calendar" size={24} color="black" />
                        </View>
                        <Image
                            style={styles.image}
                            source={{
                                uri: (reservation.parking.images[0] ? `${config.api}/api/images/${reservation.parking.images[0]}` : "https://cdn-icons-png.flaticon.com/128/149/149071.png"),
                            }}
                        />
                        <View style={styles.detailsContainer}>
                            <View style={styles.infoContainer}>
                                <Text style={styles.date}>{t("Start Date")}: {moment(reservation.startDate).format("MMMM Do YYYY, h:mm:ss a")}</Text>
                                <Text style={styles.date}>{t("End Date")}: {moment(reservation.finishDate).format("MMMM Do YYYY, h:mm:ss a")}</Text>
                                <Text style={styles.price}>{t("Price")}: {reservation.totalPrice} $</Text>
                            </View>
                            <View style={styles.statusContainer}>
                                <Text style={[styles.status, { backgroundColor: reservation.reservationStatus === "Waiting" ? "#FFA500" : reservation.reservationStatus === "Current" ? "#800080" : "#00FF00" }]}>
                                    {reservation.reservationStatus}
                                </Text>
                            </View>
                        </View>
                        <View style={styles.buttonContainer}>
                            {reservation.reservationStatus === "Waiting" && (
                                <PaperButton
                                    style={styles.cancelButton}
                                    labelStyle={styles.buttonLabel}
                                    onPress={() => cancelReservation(reservation._id)}
                                >
                                    {t("cancel")}
                                </PaperButton>
                            )}
                            {reservation.reservationStatus === "Current" && (
                                <PaperButton
                                    style={styles.timerButton}
                                    labelStyle={styles.buttonLabel}
                                    onPress={() => navigation.navigate('TimerPage', { finishDate: reservation.finishDate, startDate: reservation.startDate })}
                                >
                                     <Image source={{ uri: 'https://img.icons8.com/ios/452/stopwatch--v1.png' }} style={{ width: 20, height: 20, tintColor: 'white' }} />
                                    
                                    {t(" Timer")}
                                </PaperButton>
                            )}
                        </View>
                    </View>
                ))}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 20,
        paddingHorizontal: 10,
        backgroundColor: '#f2f2f2',
    },
    addButton: {
        position: 'absolute',
        top: 40,
        left: 20,
        padding: 10,
        borderRadius: 25,
        backgroundColor: 'black',
        zIndex: 1,
    },
    scrollContent: {
        paddingBottom: 20,
    },
    reservationCard: {
        backgroundColor: 'white',
        borderRadius: 10,
        marginBottom: 20,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
    parkingName: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    image: {
        width: '100%',
        height: 200,
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
        resizeMode: 'cover',
    },
    detailsContainer: {
        flexDirection: "row",
        padding: 10,
        justifyContent: 'space-between',
    },
    infoContainer: {},
    date: {
        fontSize: 14,
        color: "gray",
        marginBottom: 5,
    },
    price: {
        fontSize: 16,
        color: "green",
        fontWeight: "bold",
        marginBottom: 5,
    },
    statusContainer: {},
    status: {
        textAlign: "center",
        borderRadius: 5,
        padding: 5,
        color: "white",
        marginBottom: 5,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingBottom: 10,
    },
    cancelButton: {
        backgroundColor: "#FF0000",
        borderRadius: 8,
        paddingHorizontal: 15,
        paddingVertical: 10,
        marginLeft: 10,
    },
    timerButton: {
        backgroundColor: "#800080",
        borderRadius: 8,
        paddingHorizontal: 15,
        paddingVertical: 10,
        marginLeft: 10,
    },
    buttonLabel: {
        color: "white",
        fontSize: 16,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingTop: 20,
    },
    errorContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
});