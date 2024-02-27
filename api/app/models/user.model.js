const mongoose = require("mongoose");

const User = mongoose.model(
  "User",
  new mongoose.Schema({
    username: {
      type: String,
      unique: true,
      required: true,
    },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    avatar: { type: String },
    roles: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Role"
      }
    ],
    joindDate: { type: Date, default: Date.now },
    sentFollowRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    // receivedFollowRequests: [
    //   { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    // ],
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    verified: {
      type: Boolean,
      default: false,
    },
    verificationToken: String,
    address: {
      country: String,
      state: String,
      city: String,
      street: String,
      areaCode: String
    },
    phone: {
      type: String
    },
    firstName: {
      type: String
    },
    lastName: {
      type: String
    },
    gender: {
      type: String
    }

  })
);

module.exports = User;
