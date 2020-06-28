const mongoose = require('mongoose')

const UserSchema = mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  hash: {
    type: String,
    required: true,
    unique: true
  },
  salt: {
    type: String,
    required: true,
    unique: true
  },
  emailVerificationCode: {
    type: Number
  },
  accountVerified: {
    type: Boolean,
    default: false
  }
})

module.exports = mongoose.model('User', UserSchema)
