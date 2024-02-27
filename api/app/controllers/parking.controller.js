const ObjectId = require('mongodb').ObjectId;

const db = require("../models");

const Parking = db.parking
const Reservation = db.reservation
const ParkingSpot = db.parkingSpot

exports.createParking = async (req, res) => {
    const { name, description, longitude, latitude, parkingType } = req.body;
    const images = req.files.map((file) => (
        file.filename
    ));
    const newParking = new Parking({
        name,
        address: {
            country: req.body["address.country"],
            state: req.body["address.state"],
            city: req.body["address.city"],
            street: req.body["address.street"],
            areaCode: req.body["address.areaCode"]
        },
        description,
        images,
        longitude,
        latitude,
        parkingSpots: [],
        parkingType
    })
    newParking
        .save()
        .then((parking) => res.status(201).json(parking))
        .catch((error) => res.status(500).json({ error: error.message }));

        
}

exports.createParkingSpot = async (req, res) => {
    const parkingId = req.query.parkingId
    const { name, spotType, pricePerHour } = req.body
    const newParkingSpot = new ParkingSpot({ name, spotType, pricePerHour })

    newParkingSpot
        .save()
        .then(
            (parkingSpot) => {
                Parking.findByIdAndUpdate(
                    parkingId,
                    { $push: { parkingSpots: parkingSpot._id } },
                    { new: true, useFindAndModify: false },
                    (err) => {
                        if (err) {
                            res.status(500).json({ error: err.message })
                        } else {
                            res.status(201).json(parkingSpot)
                        }
                    }
                )
            }
        )
        .catch((error) => res.status(500).json({ error: error.message }));
}

exports.createReservation = async (req, res) => {
    const { licencePlate, payementStatus, payementMethod, totalPrice, parkingSpot, parking, user, finishDate, startDate } = req.body

    const newReservation = new Reservation({ licencePlate, payementStatus, payementMethod, totalPrice, parkingSpot, parking, user, finishDate: new Date(finishDate), startDate: new Date(startDate) })
    checkReservationOverlap(newReservation)
        .then((overlap) => {
            if (overlap) {
                res.status(500).json({ error: 'The new reservation overlaps with existing reservations.' })
            } else {
                newReservation
                    .save()
                    .then((reservation) => res.status(201).json(reservation))
                    .catch((error) => res.status(500).json({ error: error.message }));
            }
        })
        .catch((error) => {
            res.status(500).json({ error: error.message })
        });
}

exports.updateParkinSpot = async (req, res) => {
    try {
        const { _id, name, spotType, pricePerHour } = req.body
        ParkingSpot.findByIdAndUpdate(_id, { name, spotType, pricePerHour }, { new: true })
            .then((updatedDocument) => {
                if (updatedDocument) {
                    res.status(201).json({ message: "Updated document" })
                } else {
                    res.status(500).json({ message: "Document not found." })
                }
            })
            .catch(
                (error) => {
                    res.status(500).json({ message: "Error updating document" })
                    console.error('Error updating document:', error);
                }
            )
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

exports.updateParking = async (req, res) => {
    try {
        if (!req.body.oldImages) {
            req.body.oldImages = []
        }
        if (!Array.isArray(req.body.oldImages)) {
            req.body.oldImages = [req.body.oldImages]
        }
        const images = [...req.files.map((file) => (file.filename)), ...req.body.oldImages]
        const updateBody = {
            name: req.body["name"],
            description: req.body["description"],
            images,
            address: {
                country: req.body["address.country"],
                state: req.body["address.state"],
                city: req.body["address.city"],
                street: req.body["address.street"],
                areaCode: req.body["address.areaCode"],
            },
            longitude: req.body["longitude"],
            latitude: req.body["latitude"],
            parkingType: req.body["parkingType"],
        }

        Parking.findByIdAndUpdate(req.body.id, updateBody, { new: true })
            .then((updatedDocument) => {
                if (updatedDocument) {
                    res.status(201).json({ message: "Updated document" })
                } else {
                    res.status(500).json({ message: "Document not found." })
                }
            })
            .catch(
                (error) => {
                    res.status(500).json({ message: "Error updating document" })
                    console.error('Error updating document:', error);
                }
            )


    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

exports.deleteParking = async (req, res) => {
    try {
        Parking.findByIdAndDelete(req.query.id)
            .exec()
            .then((blog) => {
                if (blog) {


                    blog.parkingSpots.forEach(el => {
                        const objectId = new ObjectId(el);
                        const idAsString = objectId.toString();
                        ParkingSpot.findByIdAndDelete(idAsString).exec()
                    })
                    res.status(204).json({ message: 'Parking was deleted' });
                } else {
                    res.status(404).json({ message: 'Parking not found' });
                }
            })
            .catch((error) => res.status(500).json({ error: error.message }));
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

exports.deleteParkingSpot = async (req, res) => {
    try {
        ParkingSpot.findByIdAndDelete(req.query.id)
            .exec()
            .then((parkingSpot) => {
                if (parkingSpot) {
                    Parking.findByIdAndUpdate(
                        req.query.parkingId,
                        { $pull: { parkingSpots: req.query.id } },
                        { new: true, useFindAndModify: false },
                        (err, updatedParking) => {
                            if (err) {
                                res.status(500).json({ error: err.message });
                            } else {
                                res.status(204).json({ message: 'Parking spot was deleted' });
                            }
                        }
                    );
                }
                else {
                    res.status(404).json({ message: 'Parking spot not found' });
                }
            })

    } catch (error) {
        console.log(error)

        res.status(500).json({ error: error.message })
    }
}

exports.cancelReservation = async (req, res) => {
    const { reservationId } = req.query
    Reservation.findByIdAndUpdate(reservationId, { reservationStatus: "Canceled" }, { new: true })
        .then((updatedDocument) => {
            if (updatedDocument) {
                res.status(201).json({ message: "Updated document" })
            } else {
                res.status(500).json({ message: "Document not found." })
            }
        })
        .catch((error) => {
            res.status(500).json({ message: "Error updating document" })
            console.error('Error updating document:', error);
        })
}

exports.getAvailableParkingSpots = async (req, res) => {
    const { startDate, finishDate, parkingLotId } = req.query
    // console.log(new Date(startDate))
    // console.log(new Date(finishDate))
    findAvailableParkingSpots(startDate, finishDate, parkingLotId)
        .then((availableParkingSpots) => {
            res.status(201).json(availableParkingSpots)
        })
        .catch((error) => {
            res.status(500).json({ error: error.message })
        });
}

exports.getParkingLotsNearby = async (req, res) => {
    findParkingLotsNearby()
        .then((nearbyParkingLots) => {
            res.status(201).json(nearbyParkingLots)
        })
        .catch((error) => {
            res.status(500).json({ error: error.message })
        });
}


exports.parkingSearch = async (req, res) => {
    try {
        const pageSize = req.query.pageSize || 10;
        const pageNumber = req.query.pageNumber || 1;
        const search = req.query.search || "";
        const regex = new RegExp(search, 'i');

        const query = {
            $or: [
                { 'address.country': { $regex: regex } },
                { 'address.state': { $regex: regex } },
                { 'address.city': { $regex: regex } },
                { 'address.street': { $regex: regex } },
                { 'address.areaCode': { $regex: regex } },
                { 'name': { $regex: regex } },
            ]
        }
        Parking.countDocuments(query, (err, totalElements) => {
            if (err) {
                return res.status(500).send(err);
            }
            const totalPages = Math.ceil(totalElements / pageSize);
            Parking.find(query)
                .populate("parkingSpots")
                .skip((pageNumber - 1) * pageSize)
                .limit(pageSize)
                .exec((err, results) => {
                    if (err) {
                        return res.status(500).send(err);
                    }
                    res.send({
                        totalElements: totalElements,
                        totalPages: totalPages,
                        results: results
                    });
                });
        });

    } catch (error) {
        res.status(500).json({ error: error.message })

    }
}

exports.getReservationByUser = async (req, res) => {
    const { id } = req.query
    Reservation.find({ user: id }, (error, results) => {
        if (error) {
            res.status(500).json({ error: error.message })       
         } else {
            res.status(200).json(results)

        }
    }).populate("parking parkingSpot")

}



async function checkReservationOverlap(newReservation) {
    try {
        const overlappingReservations = await Reservation.find({
            parkingSpot: newReservation.parkingSpot,
            reservationStatus: { $ne: 'Canceled' },
            $or: [
                {
                    startDate: { $lt: newReservation.finishDate },
                    finishDate: { $gt: newReservation.startDate },
                },
                {
                    startDate: { $gte: newReservation.startDate, $lt: newReservation.finishDate },
                },
                {
                    finishDate: { $gt: newReservation.startDate, $lte: newReservation.finishDate },
                }
            ]
        });

        if (overlappingReservations.length > 0) {
            return true;
        } else {
            return false;
        }
    } catch (error) {
        console.error('Error checking reservation overlap:', error);
        throw error;
    }
}

async function findAvailableParkingSpots(startDate, finishDate, parkingLotId) {
    try {

        const overlappingReservations = await Reservation.find({
            $or: [
                {
                    startDate: { $lt: finishDate },
                    finishDate: { $gt: startDate },
                },
                {
                    startDate: { $gte: startDate, $lt: finishDate },
                },
                {
                    finishDate: { $gt: startDate, $lte: finishDate },
                },
            ],
        });

        const reservedSpotIds = overlappingReservations.map(reservation => reservation.parkingSpot);

        // const availableParkingSpots = await ParkingSpot.find({
        //     _id: { $nin: reservedSpotIds },
        // });
        // const parking = await Parking.findById(parkingLotId).populate("parkingSpots")

        return { occupiedParkingSpots: reservedSpotIds };
    } catch (error) {
        console.error('Error finding available parking spots:', error);
        throw error;
    }
}


async function findParkingLotsNearby() {
    try {
        const allParkingLots = await Parking.find().populate("parkingSpots");
        return allParkingLots;
    } catch (error) {
        console.error('Error finding all parking lots:', error);
        throw error;
    }
}
