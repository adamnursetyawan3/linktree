/**
 * Fungsi bantu API dengan autentikasi
 */

function getAuthHeaders(): Record<string, string> {
  const token =
    (typeof window !== 'undefined' &&
      (localStorage.getItem('token') ||
        sessionStorage.getItem('token') ||
        localStorage.getItem('authToken'))) ||
    '';
  const headers: Record<string, string> = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export async function apiFetch<T = any>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeaders(),
    ...(options.headers || {}),
  };
  const res = await fetch(path, {
    ...options,
    headers,
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    const message = errorData?.error || errorData?.message || `HTTP ${res.status}`;
    throw new Error(message);
  }
  return res.json();
}

/**
 * Mengirim PUT dengan body = blob dan header Content-Type = contentType (bukan JSON)
 */
export async function apiUploadBlob<T = any>(
  path: string,
  blob: Blob,
  contentType: string
): Promise<T> {
  const headers = {
    ...getAuthHeaders(),
    'Content-Type': contentType,
  };
  const res = await fetch(path, {
    method: 'PUT',
    headers,
    body: blob,
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    const message = errorData?.error || errorData?.message || `HTTP ${res.status}`;
    throw new Error(message);
  }
  return res.json();
}

/**
 * Mengambil Blob dengan GET dan autentikasi
 */
export async function apiFetchBlob(path: string): Promise<Blob> {
  const headers = {
    ...getAuthHeaders(),
  };
  const res = await fetch(path, {
    method: 'GET',
    headers,
  });
  if (!res.ok) {
    throw new Error('Foto tidak bisa dimuat.');
  }
  return res.blob();
}
