import { useEffect, useState } from "react";
import { api } from "../api";

function getToken() {
  const raw = localStorage.getItem("session");
  return raw ? JSON.parse(raw).token : "";
}

export default function ResourcesPage({ user }) {
  const [resources, setResources] = useState([]);
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({
    name: "",
    category: "",
    description: "",
    quantity: 1,
    condition: "Good"
  });

  const load = async () => {
    const token = getToken();
    const qs = query ? `?q=${encodeURIComponent(query)}` : "";
    const res = await api.getResources(token, qs);
    setResources(res.data);
  };

  useEffect(() => {
    load();
  }, []);

  const createResource = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      await api.createResource(getToken(), {
        ...form,
        quantity: Number(form.quantity),
        availableCount: Number(form.quantity)
      });
      setForm({ name: "", category: "", description: "", quantity: 1, condition: "Good" });
      setMessage("Resource created");
      load();
    } catch (err) {
      setMessage(err.response?.data?.message || "Create failed");
    }
  };

  const remove = async (id) => {
    await api.deleteResource(getToken(), id);
    load();
  };

  return (
    <div className="stack">
      <div className="card">
        <h2>Resources</h2>
        <div className="row">
          <input
            placeholder="Search resource"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button onClick={load}>Search</button>
        </div>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Category</th>
              <th>Qty</th>
              <th>Available</th>
              <th>Condition</th>
              {user.role === "admin" && <th>Action</th>}
            </tr>
          </thead>
          <tbody>
            {resources.map((r) => (
              <tr key={r._id}>
                <td>{r.name}</td>
                <td>{r.category}</td>
                <td>{r.quantity}</td>
                <td>{r.availableCount}</td>
                <td>{r.condition}</td>
                {user.role === "admin" && (
                  <td>
                    <button onClick={() => remove(r._id)}>Delete</button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {user.role === "admin" && (
        <div className="card">
          <h3>Add Resource</h3>
          <form onSubmit={createResource} className="stack">
            <input
              placeholder="Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
            <input
              placeholder="Category"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              required
            />
            <input
              placeholder="Description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
            <input
              type="number"
              min="1"
              value={form.quantity}
              onChange={(e) => setForm({ ...form, quantity: e.target.value })}
              required
            />
            <select
              value={form.condition}
              onChange={(e) => setForm({ ...form, condition: e.target.value })}
            >
              <option>Good</option>
              <option>Fair</option>
              <option>Needs Repair</option>
            </select>
            <button type="submit">Create</button>
            {message && <p>{message}</p>}
          </form>
        </div>
      )}
    </div>
  );
}
