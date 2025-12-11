const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const Seat = require('../models/Seat');
const { releaseExpiredHoldsForEvent } = require('../utils/seatUtils');


router.post('/', async (req, res) => {
  const { name, date, price, seatCodes } = req.body;
  const event = await Event.create({ name, date, price });
  const seats = seatCodes.map(code => ({ eventId: event._id, code, price }));
  await Seat.insertMany(seats);
  res.json({ event, createdSeats: seatCodes.length });
});

// GET seats availability for event
router.get('/:id/seats', async (req, res) => {
  const eventId = req.params.id;
  await releaseExpiredHoldsForEvent(eventId);

  const seats = await Seat.find({ eventId }).lean();
  const response = seats.map(s => {
    let status = 'available';
    if (s.bookedBy) status = 'booked';
    else if (s.heldBy) status = 'held';
    return {
      seat: s.code,
      status,
      heldBy: s.heldBy,
      holdExpiresAt: s.holdExpiresAt,
      bookedBy: s.bookedBy
    };
  });
  res.json(response);
});

module.exports = router;
