const mongoose = require('mongoose');

const citySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  areaCode:{
    type: String,
    required: true,
  }
});

const stateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  cities: [citySchema],
});

const countrySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  states: [stateSchema],
});

const Country = mongoose.model('Country', countrySchema);

module.exports = Country;