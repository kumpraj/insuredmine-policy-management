const mongoose = require('mongoose');

const scheduledMessageSchema = new mongoose.Schema({
    message: String,
    scheduledTime: Date,
  });

module.exports = mongoose.model('ScheduledMessage', scheduledMessageSchema)