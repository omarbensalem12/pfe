const mongoose = require('mongoose');

const parkingSpotSchema=new mongoose.Schema({
    name: String,
    spotType:String,
    pricePerHour:Number
})

const ParkingSpot = mongoose.model('ParkingSpot', parkingSpotSchema);

module.exports = ParkingSpot;