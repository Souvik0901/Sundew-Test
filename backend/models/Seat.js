const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SeatSchema = new Schema({
  eventId: {type: Schema.Types.ObjectId, ref: 'Event', index: true},
  code: String,
  price: Number,
  heldBy: {type: String, default: null}, //usedId
  holdExpiresAt: {type:Date, default:null},
  bookedBy: {type: String, default:null}, //userID
  bookedAt: {type: Date, default: null}

});

SeatSchema.index({eventId: 1., code: 1}, {unique: true});

module.exports = mongoose.model('Seat', SeatSchema);