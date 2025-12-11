const express = require('express');
const router = express.Router();
const Seat = require('../models/Seat');
const Booking = require('../models/Booking');
const { releaseExpiredHoldsForEvent } = require('../utils/seatUtils');
const Event = require('../models/Event');

router.get('/event/:id', async (req, res) => {
  const eventId = req.params.id;
  await releaseExpiredHoldsForEvent(eventId);

  const [bookedCount, heldSeats, event, bookings] = await Promise.all([
    Seat.countDocuments({ eventId, bookedBy: { $ne: null } }),
    Seat.find({ eventId, heldBy: { $ne: null } }),
    Event.findById(eventId),
    Booking.find({ eventId })
  ]);

  const heldCount = heldSeats.length;
  const totalSeats = await Seat.countDocuments({ eventId });
  const available = totalSeats - bookedCount - heldCount;
  const revenue = bookings.reduce((sum, b) => sum + (b.total || 0), 0);

  res.json({
    event: { id: event._id, name: event.name },
    totalSeats, booked: bookedCount, held: heldCount, available, revenue
  });
});

module.exports = router;
