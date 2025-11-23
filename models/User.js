const mongoose = require('mongoose');
const { Schema, model, models } = mongoose;

const UserSchema = new Schema({
  email: {
    type: String,
    required: [true, 'Please provide an email.'],
    unique: true,
    match: [/.+\@.+\..+/, 'Please provide a valid email address.'],
  },
  username: {
    type: String,
    required: [true, 'Please provide a username.'],
    unique: true,
    minlength: 3,
  },
  password: {
    type: String,
    required: [true, 'Please provide a password.'],
    minlength: 6,
  },
  favorites: {
    type: [String],
    default: [],
  },
  role: {
    type: String, enum: ['user', 'admin'], default: 'user'
  },
  twoFactorSecret: {
    type: String,
  },
  isTwoFactorEnabled: {
    type: Boolean,
    default: false
  }
});

module.exports = models.User || model('User', UserSchema);