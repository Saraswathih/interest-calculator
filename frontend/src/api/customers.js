const BASE = "http://localhost:5000/api/customers";

// ✅ helper: safely read JSON or text
async function parseResponse(res) {
  const text = (await res.text()).trim();

  // If backend is down / wrong URL, sometimes it returns HTML
  const isProbablyHTML = text.startsWith("<!DOCTYPE") || text.startsWith("<html");

  if (!res.ok) {
    if (!text) throw new Error("Request failed");

    if (isProbablyHTML) {
      throw new Error("Server not reachable or wrong API URL (got HTML response)");
    }

    try {
      const err = JSON.parse(text);
      throw new Error(err.message || "Request failed");
    } catch {
      throw new Error(text || "Request failed");
    }
  }

  if (!text) return null;

  if (isProbablyHTML) {
    throw new Error("Server not reachable or wrong API URL (got HTML response)");
  }

  try {
    return JSON.parse(text);
  } catch {
    throw new Error("Invalid JSON received from server");
  }
}

// ✅ GET all customers (draft + active)
export async function fetchCustomers() {
  const res = await fetch(BASE);
  const data = await parseResponse(res);
  return Array.isArray(data) ? data : [];
}

// ✅ GET only draft customers
export async function fetchDraftCustomers() {
  const res = await fetch(`${BASE}/drafts`);
  const data = await parseResponse(res);
  return Array.isArray(data) ? data : [];
}

// ✅ GET only active customers
export async function fetchActiveCustomers() {
  const res = await fetch(`${BASE}/active`);
  const data = await parseResponse(res);
  return Array.isArray(data) ? data : [];
}

// ✅ POST add customer (works for both draft & active)
// call with: { name, phone, address, status: "draft" } OR status: "active"
export async function addCustomer(form) {
  const res = await fetch(`${BASE}/add`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(form)
  });

  const data = await parseResponse(res);
  return data || {};
}
export async function deleteCustomer(id) {
  const res = await fetch(`${BASE}/${id}`, { method: "DELETE" });
  const data = await parseResponse(res);
  return data || {};
}
