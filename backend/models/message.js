// models/message.js
const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  from: String,
  message: String,
}, { timestamps: true });

module.exports = mongoose.model('Message', messageSchema);
