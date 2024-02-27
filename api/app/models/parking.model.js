const mongoose = require('mongoose');



const parkingSchema = new mongoose.Schema({
    name: String,
    description: String,
    images: {
        type: [String],
        default: [],
    },
    parkingType: String,
    address: {
        country: String,
        state: String,
        city: String,
        street: String,
        areaCode: String
    },
    longitude: Number,
    latitude: Number,
    parkingSpots: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "ParkingSpot"
      }]

});

const Parking = mongoose.model('Parking', parkingSchema);

module.exports = Parking;