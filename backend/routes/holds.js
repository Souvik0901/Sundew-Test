const express = require('express');
const router = express.Router();
const Seat = require('../models/Seat');
const Hold = require('../models/Hold');
const Booking = require('../models/Booking');
const IdempotencyKey = require('../models/IdempotencyKey');
const Event = require('../models/Event');
// const { v4: uuidv4 } = require('uuid');
const { releaseExpiredHoldsForEvent } = require('../utils/seatUtils');

const HOLD_TTL_MS = 2 * 60 * 1000; // 2 minutes

// Create a hold
router.post('/', async (req, res) => {
  const { eventId, userId, seatCodes } = req.body;
  if (!eventId || !userId || !seatCodes || !seatCodes.length) return res.status(400).json({error:'missing fields'});

  await releaseExpiredHoldsForEvent(eventId);

  const now = new Date();
  const expiresAt = new Date(now.getTime() + HOLD_TTL_MS);

 
  const ops = seatCodes.map(code => ({
    updateOne: {
      filter: {
        eventId,
        code,
        bookedBy: null,
        $or: [
          { heldBy: null },
          { holdExpiresAt: { $lt: now } } 
        ]
      },
      update: { $set: { heldBy: userId, holdExpiresAt: expiresAt } }
    }
  }));

  const bulk = await Seat.bulkWrite(ops, { ordered: true });

  const modified = bulk.modifiedCount || 0;
  if (modified !== seatCodes.length) {

    await Seat.updateMany({ eventId, heldBy: userId, code: { $in: seatCodes } }, { $set: { heldBy: null, holdExpiresAt: null } });
    return res.status(409).json({ error: "Some seats are no longer available" });
  }


  const hold = await Hold.create({
    eventId, userId, seatCodes, expiresAt, status: 'active', createdAt: now
  });

  res.json({ hold });
});

router.post('/:id/confirm', async (req, res) => {
  const holdId = req.params.id;
  const key = req.headers['idempotency-key'];
  if (!key) return res.status(400).json({ error: 'Idempotency-Key header missing' });


  const existing = await IdempotencyKey.findOne({ key });
  if (existing) {
    const booking = await Booking.findById(existing.bookingId);
    return res.json({ booking, replay: true });
  }

  const hold = await Hold.findById(holdId);
  if (!hold) return res.status(404).json({ error: 'Hold not found' });


  const now = new Date();
  if (hold.status !== 'active' || hold.expiresAt < now) {

    hold.status = 'expired';
    await hold.save();
    await Seat.updateMany({ eventId: hold.eventId, code: { $in: hold.seatCodes }, heldBy: hold.userId }, { $set: { heldBy: null, holdExpiresAt: null }});
    return res.status(410).json({ error: 'Hold expired' });
  }


  const ops = hold.seatCodes.map(code => ({
    updateOne: {
      filter: {
        eventId: hold.eventId,
        code,
        heldBy: hold.userId,
        holdExpiresAt: { $gt: now },
        bookedBy: null
      },
      update: { $set: { bookedBy: hold.userId, bookedAt: now }, $unset: { heldBy: "", holdExpiresAt: "" } }
    }
  }));

  const bulk = await Seat.bulkWrite(ops, { ordered: true });
  if ((bulk.modifiedCount || 0) !== hold.seatCodes.length) {

    await Seat.updateMany({ eventId: hold.eventId, code: { $in: hold.seatCodes }, bookedBy: hold.userId }, { $set: { bookedBy: null, bookedAt: null }});
    return res.status(409).json({ error: 'Could not confirm all seats (they may have expired or been taken)' });
  }


  const seats = await Seat.find({ eventId: hold.eventId, code: { $in: hold.seatCodes }});
  const total = seats.reduce((s, seat) => s + (seat.price||0), 0);

  const booking = await Booking.create({
    eventId: hold.eventId,
    userId: hold.userId,
    seatCodes: hold.seatCodes,
    total,
    createdAt: now
  });

  hold.status = 'confirmed';
  await hold.save();

  await IdempotencyKey.create({ key, holdId: hold._id, bookingId: booking._id });

  res.json({ booking });
});

module.exports = router;
