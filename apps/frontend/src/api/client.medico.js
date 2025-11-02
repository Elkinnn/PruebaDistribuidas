// src/api/client.medico.js
const BASE = import.meta.env.VITE_API_URL ?? "http://localhost:3002";

async function handle(res) {
  if (!res.ok) {
    // intenta parsear error JSON; si no, usa statusText
    const errorData = await res.json().catch(() => ({ message: res.statusText }));
    
    // Crear error que preserve el status code
    const error = new Error(errorData.message || res.statusText);
    error.status = res.status;
    error.response = {
      status: res.status,
      data: errorData
    };
    
    throw error;
  }
  return res.json();
}

export const apiMedico = {
  async get(path) {
    const t = localStorage.getItem("clinix_medico_token");
    const res = await fetch(BASE + path, {
      headers: t ? { Authorization: `Bearer ${t}` } : {},
    });
    return handle(res);
  },

  async post(path, body) {
    const t = localStorage.getItem("clinix_medico_token");
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
    const t = localStorage.getItem("clinix_medico_token");
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

  async put(path, body = {}) {
    const t = localStorage.getItem("clinix_medico_token");
    const res = await fetch(BASE + path, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(t ? { Authorization: `Bearer ${t}` } : {}),
      },
      body: JSON.stringify(body),
    });
    return handle(res);
  },

  async delete(path) {
    const t = localStorage.getItem("clinix_medico_token");
    const res = await fetch(BASE + path, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        ...(t ? { Authorization: `Bearer ${t}` } : {}),
      },
    });
    return handle(res);
  },
};
