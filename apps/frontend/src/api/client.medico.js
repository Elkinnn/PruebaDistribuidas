// src/api/client.medico.js
const BASE = import.meta.env.VITE_API_URL ?? "";

async function handle(res) {
  if (!res.ok) {
    // intenta parsear error JSON; si no, usa statusText
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw err;
  }
  return res.json();
}

export const apiMedico = {
  async get(path) {
    const t = localStorage.getItem("clinix_token_medico");
    const res = await fetch(BASE + path, {
      headers: t ? { Authorization: `Bearer ${t}` } : {},
    });
    return handle(res);
  },

  async post(path, body) {
    const t = localStorage.getItem("clinix_token_medico");
    const res = await fetch(BASE + path, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(t ? { Authorization: `Bearer ${t}` } : {}),
      },
      body: JSON.stringify(body),
    });
    return handle(res);
  },

  async patch(path, body = {}) {
    const t = localStorage.getItem("clinix_token_medico");
    const res = await fetch(BASE + path, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...(t ? { Authorization: `Bearer ${t}` } : {}),
      },
      body: JSON.stringify(body),
    });
    return handle(res);
  },
};
