const BASE = "http://localhost:5000/api/transactions";

// helper: fetch with timeout
async function fetchWithTimeout(url, options = {}, timeoutMs = 15000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    return res;
  } finally {
    clearTimeout(id);
  }
}

// helper: robust JSON parse + better errors
async function parseJsonResponse(res) {
  if (res.status === 204) return null;

  const text = (await res.text()).trim();
  const looksLikeHTML =
    text.startsWith("<!DOCTYPE") ||
    text.toLowerCase().startsWith("<html") ||
    text.toLowerCase().includes("<head") ||
    text.toLowerCase().includes("<body");

  if (!res.ok) {
    if (looksLikeHTML) throw new Error("Wrong API URL / server not reachable (HTML response received)");
    try {
      const err = text ? JSON.parse(text) : {};
      throw new Error(err.message || `Request failed (${res.status})`);
    } catch {
      throw new Error(text || `Request failed (${res.status})`);
    }
  }

  if (!text) return null;

  if (looksLikeHTML) {
    throw new Error("Wrong API URL / server not reachable (HTML response received)");
  }

  try {
    return JSON.parse(text);
  } catch {
    throw new Error("Server did not return JSON. Check backend route.");
  }
}

// ✅ GET all transactions (existing)
export async function fetchTransactions() {
  const res = await fetchWithTimeout(BASE);
  const data = await parseJsonResponse(res);
  return Array.isArray(data) ? data : [];
}

// ✅ GET transactions by customerId
export async function fetchTransactionsByCustomer(customerId) {
  if (!customerId) throw new Error("Customer id is required");
  const res = await fetchWithTimeout(`${BASE}?customerId=${customerId}`);
  const data = await parseJsonResponse(res);
  return Array.isArray(data) ? data : [];
}

// ✅ GET transactions by investorId  (NEW)
export async function fetchTransactionsByInvestor(investorId) {
  if (!investorId) throw new Error("Investor id is required");
  const res = await fetchWithTimeout(`${BASE}?investorId=${investorId}`);
  const data = await parseJsonResponse(res);
  return Array.isArray(data) ? data : [];
}

// ✅ POST add transaction (existing, works for customer OR investor)
// Send either { customerId: "..." } OR { investorId: "..." }
export async function addTransaction(form) {
  const res = await fetchWithTimeout(`${BASE}/add`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(form)
  });

  const data = await parseJsonResponse(res);
  return data && typeof data === "object" ? data : {};
}

// ✅ Optional helper (NEW): add investor transaction shortcut
export async function addInvestorTransaction(investorId, form) {
  if (!investorId) throw new Error("Investor id is required");
  return addTransaction({ ...form, investorId });
}

// ✅ Optional helper (NEW): add customer transaction shortcut
export async function addCustomerTransaction(customerId, form) {
  if (!customerId) throw new Error("Customer id is required");
  return addTransaction({ ...form, customerId });
}
