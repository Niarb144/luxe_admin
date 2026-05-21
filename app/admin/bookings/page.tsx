"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

type Booking = {
  id: string;
  booking_reference: string;
  tour_id: string;
  tour_name: string;
  full_name: string;
  email: string;
  phone: string;
  travel_date: string;
  status: "pending" | "confirmed" | "cancelled";
};

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // FETCH BOOKINGS
  useEffect(() => {
    fetchBookings();
  }, []);

  async function fetchBookings() {
    const { data, error } = await supabase
      .from("bookings")
      .select(`
        *,
        tours(title)
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      return;
    }

    const formatted = data?.map((b: any) => ({
      ...b,
      tour_name: b.tours?.title || "Unknown Tour",
    }));

    setBookings(formatted || []);
  }

  // UPDATE STATUS
  async function updateStatus(id: string, status: Booking["status"]) {
    const { error } = await supabase
      .from("bookings")
      .update({ status })
      .eq("id", id);

    if (!error) fetchBookings();
  }

  // DELETE BOOKING
  async function deleteBooking(id: string) {
    const confirm = window.confirm("Delete this booking?");
    if (!confirm) return;

    const { error } = await supabase
      .from("bookings")
      .delete()
      .eq("id", id);

    if (!error) fetchBookings();
  }

  // Get booked dates for calendar
  const bookedDates = bookings
    .filter((b) => b.travel_date)
    .map((b) => new Date(b.travel_date));

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Bookings Dashboard</h1>

      {/* CALENDAR */}
      <div className="bg-white p-4 rounded shadow">
        <h2 className="font-semibold mb-2">Booked Dates</h2>

        <Calendar
          onChange={(value) => setSelectedDate(value as Date)}
          value={selectedDate}
          tileClassName={({ date }) => {
            const isBooked = bookedDates.some(
              (d) =>
                d.toDateString() === date.toDateString()
            );

            return isBooked ? "bg-red-200 rounded-full" : "";
          }}
        />
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto bg-white p-4 rounded shadow">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th>Safari</th>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {bookings.map((b) => (
              <tr key={b.id} className="border-b">
                <td>{b.tour_name}</td>
                <td>{b.full_name}</td>
                <td>{b.email}</td>
                <td>{b.phone}</td>
                <td>{b.travel_date}</td>
                <td>
                  <span
                    className={
                      b.status === "confirmed"
                        ? "text-green-600"
                        : b.status === "cancelled"
                        ? "text-red-600"
                        : "text-yellow-600"
                    }
                  >
                    {b.status}
                  </span>
                </td>

                <td className="space-x-2">
                  <button
                    onClick={() => updateStatus(b.id, "confirmed")}
                    className="text-green-600"
                  >
                    Approve
                  </button>

                  <button
                    onClick={() => updateStatus(b.id, "cancelled")}
                    className="text-orange-600"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={() => deleteBooking(b.id)}
                    className="text-red-600"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}