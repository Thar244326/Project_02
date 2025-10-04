// API utility to handle base path for all fetch requests
const API_BASE_PATH = process.env.NEXT_PUBLIC_API_URL || '';

export function getApiUrl(path: string): string {
  // Ensure path starts with /
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_PATH}${normalizedPath}`;
}

export async function apiFetch(path: string, options?: RequestInit) {
  return fetch(getApiUrl(path), {
    ...options,
    credentials: 'include',
  });
}
