/**
 * Authenticated fetch wrapper for admin API calls.
 * Automatically adds the Bearer token and handles 401 responses
 * by clearing credentials and redirecting to the admin login page.
 */

export async function authFetch(url: string, init?: RequestInit): Promise<Response> {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null

  const headers: Record<string, string> = {
    ...(init?.headers as Record<string, string> || {}),
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`
  }

  const response = await fetch(url, {
    ...init,
    headers,
  })

  if (response.status === 401) {
    // Token expired or invalid — clear session and redirect
    if (typeof window !== "undefined") {
      localStorage.removeItem("token")
      localStorage.removeItem("user")
      window.location.href = "/admin/login"
    }
    // Return the response anyway so callers can still check status
  }

  return response
}
