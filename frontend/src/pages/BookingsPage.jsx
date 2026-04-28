import { useEffect, useState } from "react";
import { api } from "../api";

function getSession() {
  const raw = localStorage.getItem("session");
  return raw ? JSON.parse(raw) : null;
}

export default function BookingsPage({ user }) {
  const [bookings, setBookings] = useState([]);
  const [resources, setResources] = useState([]);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({
    resourceId: "",
    resourceName: "",
    startTime: "",
    endTime: "",
    purpose: ""
  });

  const token = getSession()?.token || "";

  const load = async () => {
    const [b, r] = await Promise.all([api.getBookings(token), api.getResources(token)]);
    setBookings(b.data);
    setResources(r.data);
  };

  useEffect(() => {
    load();
  }, []);

  const createBooking = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      await api.createBooking(token, form);
      setMessage("Booking request submitted");
      setForm({ resourceId: "", resourceName: "", startTime: "", endTime: "", purpose: "" });
      load();
    } catch (err) {
      setMessage(err.response?.data?.message || "Booking failed");
    }
  };

  const decide = async (id, decision) => {
    await api.reviewBooking(token, id, decision);
    load();
  };

  const markReturned = async (id) => {
    await api.returnBooking(token, id);
    load();
  };

  return (
    <div className="stack">
      {user.role === "student" && (
        <div className="card">
          <h3>Create Booking</h3>
          <form onSubmit={createBooking} className="stack">
            <select
              value={form.resourceId}
              onChange={(e) => {
                const selected = resources.find((r) => r._id === e.target.value);
                setForm({
                  ...form,
                  resourceId: e.target.value,
                  resourceName: selected?.name || ""
                });
              }}
              required
            >
              <option value="">Select Resource</option>
              {resources.map((r) => (
                <option key={r._id} value={r._id}>
                  {r.name}
                </option>
              ))}
            </select>
            <input
              type="datetime-local"
              value={form.startTime}
              onChange={(e) => setForm({ ...form, startTime: e.target.value })}
              required
            />
            <input
              type="datetime-local"
              value={form.endTime}
              onChange={(e) => setForm({ ...form, endTime: e.target.value })}
              required
            />
            <input
              placeholder="Purpose"
              value={form.purpose}
              onChange={(e) => setForm({ ...form, purpose: e.target.value })}
            />
            <button type="submit">Request Booking</button>
            {message && <p>{message}</p>}
          </form>
        </div>
      )}

      <div className="card">
        <h3>Booking Requests</h3>
        <table>
          <thead>
            <tr>
              <th>Resource</th>
              <th>Requested By</th>
              <th>Start</th>
              <th>End</th>
              <th>Status</th>
              {(user.role === "faculty" || user.role === "admin") && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => (
              <tr key={b._id}>
                <td>{b.resourceName}</td>
                <td>{b.requestedByEmail}</td>
                <td>{new Date(b.startTime).toLocaleString()}</td>
                <td>{new Date(b.endTime).toLocaleString()}</td>
                <td>{b.status}</td>
                {(user.role === "faculty" || user.role === "admin") && (
                  <td className="row">
                    {b.status === "pending" && (
                      <>
                        <button onClick={() => decide(b._id, "approved")}>Approve</button>
                        <button onClick={() => decide(b._id, "rejected")}>Reject</button>
                      </>
                    )}
                    {b.status === "approved" && (
                      <button onClick={() => markReturned(b._id)}>Mark Returned</button>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
