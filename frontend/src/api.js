import axios from "axios";

const GATEWAY_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";
const AUTH_URL = GATEWAY_URL;
const RESOURCE_URL = GATEWAY_URL;
const BOOKING_URL = GATEWAY_URL;

function authHeaders(token) {
  return { headers: { Authorization: `Bearer ${token}` } };
}

export const api = {
  signup: (payload) => axios.post(`${AUTH_URL}/auth/signup`, payload),
  login: (payload) => axios.post(`${AUTH_URL}/auth/login`, payload),
  me: (token) => axios.get(`${AUTH_URL}/auth/me`, authHeaders(token)),

  getResources: (token, query = "") =>
    axios.get(`${RESOURCE_URL}/resources${query}`, authHeaders(token)),
  createResource: (token, payload) =>
    axios.post(`${RESOURCE_URL}/resources`, payload, authHeaders(token)),
  updateResource: (token, id, payload) =>
    axios.put(`${RESOURCE_URL}/resources/${id}`, payload, authHeaders(token)),
  deleteResource: (token, id) =>
    axios.delete(`${RESOURCE_URL}/resources/${id}`, authHeaders(token)),

  getBookings: (token) => axios.get(`${BOOKING_URL}/bookings`, authHeaders(token)),
  createBooking: (token, payload) =>
    axios.post(`${BOOKING_URL}/bookings`, payload, authHeaders(token)),
  reviewBooking: (token, id, decision) =>
    axios.patch(`${BOOKING_URL}/bookings/${id}/decision`, { decision }, authHeaders(token)),
  returnBooking: (token, id) =>
    axios.patch(`${BOOKING_URL}/bookings/${id}/return`, {}, authHeaders(token))
};
