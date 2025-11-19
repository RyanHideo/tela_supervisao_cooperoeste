// src/auth/auth.ts

const STORAGE_KEY = "app_logged_in";


const SECRET = import.meta.env.VITE_LOGIN_SECRET ?? "cooperoeste1234";

export function isAuthenticated(): boolean {
  return localStorage.getItem(STORAGE_KEY) === "true";
}

export function loginWithPassword(password: string): boolean {
  if (password === SECRET) {
    localStorage.setItem(STORAGE_KEY, "true");
    return true;
  }
  return false;
}

export function logout() {
  localStorage.removeItem(STORAGE_KEY);
}
