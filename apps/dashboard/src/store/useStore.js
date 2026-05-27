import { create } from 'zustand';

const useStore = create((set) => ({
  selectedSeats: [],
  addSeat: (seat) => set((s) => ({ selectedSeats: [...s.selectedSeats, seat] })),
  removeSeat: (seatCode) => set((s) => ({ selectedSeats: s.selectedSeats.filter((x) => x !== seatCode) })),
  clearSeats: () => set({ selectedSeats: [] }),

  lastBooking: null,
  setLastBooking: (booking) => set({ lastBooking: booking }),

  currentEvent: null,
  setCurrentEvent: (event) => set({ currentEvent: event }),
}));

export default useStore;
