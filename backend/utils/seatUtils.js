const Seat = require('../models/Seat');

async function releaseExpiredHoldsForEvent(eventId){
  const now = new Date();
  await Seat.updateMany(
    {
    eventId, heldBy:{$ne: null},
    holdExpiresAt: {$lt: now},
    bookedBy: null
    },
    {
      $set: {heldBy: null, holdExpiresAt:null}

    }
  );
}

module.exports ={releaseExpiredHoldsForEvent};