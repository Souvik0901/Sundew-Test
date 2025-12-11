const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const BookingSchema = new Schema({
  eventID: {type: Schema.Types.ObjectId, ref: 'Event'},
  userID: String,
  seatCodes: [String],
  total: Number,
  createdAt: {type:Date, default:Date.now}
});

module.exports = mongoose.model('Booking',BookingSchema);