import React, { useEffect, useState } from "react";
import axios from "axios";

const USER_ID = "user123"; 
const EVENT_ID = "67950dce1f06edf453c0b8b1"; 

export default function SeatSelector() {
  const [seats, setSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [holdId, setHoldId] = useState(null);
  const [status, setStatus] = useState("");

  // Fetch seats from backend
  useEffect(() => {
    axios
      .get(`http://localhost:4000/events/${EVENT_ID}/seats`)
      .then((res) => {
        setSeats(res.data);
      })
      .catch((err) => console.error(err));
  }, []);

  const toggleSeat = (seatCode) => {
    if (selectedSeats.includes(seatCode)) {
      setSelectedSeats(selectedSeats.filter((s) => s !== seatCode));
    } else {
      setSelectedSeats([...selectedSeats, seatCode]);
    }
  };

  // Create a hold
  const createHold = () => {
    if (selectedSeats.length === 0) return;

    axios
      .post("http://localhost:4000/holds", {
        eventId: EVENT_ID,
        userId: USER_ID,
        seatCodes: selectedSeats,
      })
      .then((res) => {
        setHoldId(res.data.holdId);
        setStatus("Seats held! You have 2 minutes to confirm.");
      })
      .catch((err) => {
        setStatus("Hold failed. Seats are not available.");
      });
  };

  // Confirm hold → create booking
  const confirmHold = () => {
    if (!holdId) return;

    axios
      .post(
        `http://localhost:4000/holds/${holdId}/confirm`,
        {},
        {
          headers: {
            "Idempotency-Key": "key-" + holdId, // ensures no duplicate booking
          },
        }
      )
      .then((res) => {
        setStatus("Booking confirmed");
        setSelectedSeats([]);
        setHoldId(null);
      })
      .catch((err) => {
        setStatus("Confirmation failed. Hold may have expired.");
      });
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Seat Selector</h2>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(10, 60px)", gap: 10 }}>
        {seats.map((seat) => (
          <button
            key={seat.code}
            onClick={() => seat.available && toggleSeat(seat.code)}
            style={{
              padding: "10px",
              background: !seat.available
                ? "#aaa"
                : selectedSeats.includes(seat.code)
                ? "green"
                : "white",
              border: "1px solid black",
              cursor: seat.available ? "pointer" : "not-allowed",
            }}
          >
            {seat.code}
          </button>
        ))}
      </div>

      <br />

      <button onClick={createHold} style={{ padding: "10px", marginRight: "10px" }}>
        Hold Seats
      </button>

      <button onClick={confirmHold} style={{ padding: "10px" }}>
        Confirm Booking
      </button>

      <p style={{ marginTop: 20, color: "blue" }}>{status}</p>
    </div>
  );
}


