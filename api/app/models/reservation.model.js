const mongoose = require('mongoose');


const reservationSchema = new mongoose.Schema({
  startDate: Date,
  finishDate: Date,
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  parking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Parking"
  },
  parkingSpot: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ParkingSpot"
  },
  totalPrice: Number,
  payementMethod: {
    type: String,
    enum: [
      'Cash',
      'Credit and Debit Cards',
      'Bank Transfers',
      'Point-of-Sale (POS) Financing',
      'Prepaid Cards',
      'Bill Pay Services',
      'Automatic Clearing House (ACH) Payments',
      'In-App Purchases',
      'Gift Cards',
      'Barter',
      'Money Orders',
      'Contactless Payments',
      'PayPal and Other Online Payment Platforms',
      'Cryptocurrencies',
      'Mobile Payments',
      'Checks',
      'Electronic Funds Transfer (EFT)'
    ],
    default: 'Cash',
  },
  payementStatus: {
    type: String,
    enum: ['Success', 'Declined', 'Hold'],
    default: 'Hold',
  },
  reservationStatus: {
    type: String,
    enum: ['Waiting', 'Done', 'Current', 'Canceled'],
    default: 'Waiting',
  },
  licencePlate: String,
  reservationDate: { type: Date, default: Date.now },

});

const Reservation = mongoose.model('Reservation', reservationSchema);

module.exports = Reservation;