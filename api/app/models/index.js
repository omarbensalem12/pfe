const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const db = {};

db.mongoose = mongoose;
db.country = require("./country.model");
db.user = require("./user.model");
db.role = require("./role.model");
db.parking = require("./parking.model");
db.reservation = require("./reservation.model");
db.parkingSpot = require("./parkingSpot.model");



db.ROLES = ["user", "admin", "moderator"];

module.exports = db;