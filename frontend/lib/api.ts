const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://resumeai-production-51d1.up.railway.app";

async function authFetch(token: string, path: string, options: RequestInit = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || "Request failed");
  }
  return res;
}

export async function getProfile(token: string) {
  const res = await authFetch(token, "/api/profile");
  return res.json();
}

export async function saveProfile(token: string, data: object) {
  const res = await authFetch(token, "/api/profile", {
    method: "PUT",
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function generatePdf(token: string, template: string = "classic"): Promise<Blob> {
  const res = await authFetch(token, "/api/generate/pdf", {
    method: "POST",
    body: JSON.stringify({ template }),
  });
  return res.blob();
}

export async function generateDocx(token: string): Promise<Blob> {
  const res = await authFetch(token, "/api/generate/docx", { method: "POST" });
  return res.blob();
}

export async function importLinkedin(token: string, file: File) {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(`${API_URL}/api/linkedin/import`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || "Import failed");
  }
  return res.json();
}

export async function uploadResume(token: string, file: File) {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(`${API_URL}/api/resume/upload`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || "Upload failed");
  }
  return res.json();
}

export async function aiUpdate(token: string, message: string) {
  const res = await authFetch(token, "/api/ai/update", {
    method: "POST",
    body: JSON.stringify({ message }),
  });
  return res.json();
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
