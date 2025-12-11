const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const IKeySchema = new Schema({
  key :{type: String, unique:true},
  holdId: {type:Schema.Types.ObjectId},
  bookingId:{type:Schema.Types.ObjectId},
  createdAt: {type:Date, default:Date.now}
});

module.exports = mongoose.model('IdempotencyKey',IKeySchema);