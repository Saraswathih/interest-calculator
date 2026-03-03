const BASE = "http://localhost:5000/api/investors";

// GET all investors
export async function fetchInvestors() {
  const res = await fetch(BASE);
  const text = (await res.text()).trim();
  if (!res.ok) throw new Error(text || "Failed to fetch investors");
  return text ? JSON.parse(text) : [];
}

// POST add investor
export async function addInvestor(form) {
  const res = await fetch(`${BASE}/add`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(form)
  });
  const text = (await res.text()).trim();
  if (!res.ok) throw new Error(text || "Failed to add investor");
  return text ? JSON.parse(text) : {};
}

// GET investor by id
export async function fetchInvestorById(id) {
  const res = await fetch(`${BASE}/${id}`);
  const text = (await res.text()).trim();
  if (!res.ok) throw new Error(text || "Failed to fetch investor");
  return text ? JSON.parse(text) : null;
}

// DELETE investor by id
export async function deleteInvestor(id) {
  const res = await fetch(`${BASE}/${id}`, { method: "DELETE" });
  const text = (await res.text()).trim();
  if (!res.ok) throw new Error(text || "Failed to delete investor");
  return text ? JSON.parse(text) : { message: "Deleted" };
}
// ✅ UPDATE investor by id
export async function updateInvestor(id, form) {
  const res = await fetch(`${BASE}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(form)
  });

  const text = (await res.text()).trim();

  if (!res.ok) {
    try {
      const err = JSON.parse(text);
      throw new Error(err.message || "Failed to update investor");
    } catch {
      throw new Error(text || "Failed to update investor");
    }
  }

  return text ? JSON.parse(text) : {};
}
