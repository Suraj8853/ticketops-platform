import { useState } from 'react';

const MAX_SEATS = 6;

export const useSeats = () => {
  const [selectedSeats, setSelectedSeats] = useState([]);

  const toggleSeat = (seat) => {
    if (seat.status === 'taken' || seat.status === 'held') return;
    setSelectedSeats((prev) =>
      prev.includes(seat.seat_code)
        ? prev.filter((s) => s !== seat.seat_code)
        : prev.length < MAX_SEATS
        ? [...prev, seat.seat_code]
        : prev
    );
  };

  const clearSeats = () => setSelectedSeats([]);
  const removeSeat = (code) => setSelectedSeats((prev) => prev.filter((s) => s !== code));

  return { selectedSeats, toggleSeat, clearSeats, removeSeat };
};
