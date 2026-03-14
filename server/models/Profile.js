// models/Profile.js
const mongoose = require('mongoose');

const ProfileSchema = new mongoose.Schema({
  name: String,
  title: String,
  bio: String,
  email: String,
  phone: String,
  location: String
});

module.exports = mongoose.model('Profile', ProfileSchema);