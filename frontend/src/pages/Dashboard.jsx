export default function Dashboard({ user }) {
  return (
    <div className="card">
      <h2>Dashboard</h2>
      <p>Welcome, {user.name}.</p>
      <p>
        Role: <strong>{user.role}</strong>
      </p>
      <ul>
        <li>Students can browse resources and request bookings.</li>
        <li>Faculty/Admin can approve, reject, and close bookings.</li>
        <li>Admins can add, edit, and remove resources.</li>
      </ul>
    </div>
  );
}
