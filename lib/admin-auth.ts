export const ADMIN_AUTH_KEY = "admin-auth"

export function setAdminAuthed(value: boolean) {
  if (typeof window === "undefined") return
  localStorage.setItem(ADMIN_AUTH_KEY, value ? "1" : "0")
}

export function isAdminAuthed(): boolean {
  if (typeof window === "undefined") return false
  return localStorage.getItem(ADMIN_AUTH_KEY) === "1"
}
