const API_BASE = process.env.API_BASE || "http://localhost:4000";

async function post(path, body, token) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: JSON.stringify(body)
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(`${path} -> ${res.status}: ${JSON.stringify(data)}`);
  }
  return data;
}

async function run() {
  const users = [
    { name: "Admin User", email: "admin@fsad.com", password: "admin123", role: "admin" },
    { name: "Faculty User", email: "faculty@fsad.com", password: "faculty123", role: "faculty" },
    { name: "Student User", email: "student@fsad.com", password: "student123", role: "student" }
  ];

  const sessions = {};
  for (const user of users) {
    try {
      sessions[user.role] = await post("/auth/signup", user);
      console.log(`Created ${user.role} user`);
    } catch (_e) {
      sessions[user.role] = await post("/auth/login", {
        email: user.email,
        password: user.password
      });
      console.log(`Logged in existing ${user.role} user`);
    }
  }

  const resources = [
    { name: "DSLR Camera", category: "Media", description: "Nikon DSLR", quantity: 4, condition: "Good" },
    { name: "Raspberry Pi Kit", category: "IoT", description: "Pi 4 with accessories", quantity: 10, condition: "Good" },
    { name: "Digital Oscilloscope", category: "Electronics", description: "Lab testing scope", quantity: 3, condition: "Fair" }
  ];

  for (const resource of resources) {
    try {
      await post("/resources", resource, sessions.admin.token);
      console.log(`Created resource: ${resource.name}`);
    } catch (e) {
      console.log(`Skipped resource (${resource.name}): ${e.message}`);
    }
  }

  console.log("Seed complete");
  console.log("Credentials:");
  console.log("- admin@fsad.com / admin123");
  console.log("- faculty@fsad.com / faculty123");
  console.log("- student@fsad.com / student123");
}

run().catch((e) => {
  console.error("Seed failed:", e.message);
  process.exit(1);
});
