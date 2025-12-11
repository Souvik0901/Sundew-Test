const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const HoldSchema = new Schema({
  eventID: {type: Schema.Types.ObjectId, ref: 'Event'},
  userID: String,
  seatCodes: [String],
  expiresAt: Date,
  status: {type:String, 
    enum:['active', 'expired','confirmed'], 
    default:'active'
  },
  createdAt: {type:Date, default:Date.now}
});

module.exports = mongoose.model('Hold',HoldSchema);