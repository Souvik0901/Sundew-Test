const mongoose = require( 'mongoose');
const Schema = mongoose.Schema;

const EventSchema = new Schema({
  name : String,
  date : Date,
  price: Number,
  createdAt: {type: Date, default: Date.now}
});

module.exports = mongoose.model('Event', EventSchema);