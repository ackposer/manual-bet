const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const meetingSchema = new Schema({
  json: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model('Meeting', meetingSchema);