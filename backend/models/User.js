const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  username: { type: String, required: true },
  password: { type: String, required: true },
  status: {
    type: String,
    enum: ['online', 'offline'],
    default: 'offline',
  },
});

module.exports = mongoose.model('User', userSchema);
