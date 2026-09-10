/**
 * Google Identity Services & Auth State Management
 */

const STORAGE_KEY = 'dit_google_user_v1';
const CLIENT_ID_KEY = 'dit_google_client_id';

// Google OAuth Client ID for production
export const DEFAULT_GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '911070223907-aqtkvj3ruuio20l3he5jbrc2ht7rbd1l.apps.googleusercontent.com';

/**
 * Decodes Google JWT id_token without external dependencies
 */
export function decodeGoogleCredential(credential) {
  try {
    if (!credential || typeof credential !== 'string') return null;
    const parts = credential.split('.');
    if (parts.length < 2) return null;
    
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (err) {
    console.error('Error decoding Google JWT credential:', err);
    return null;
  }
}

/**
 * Get the stored Google user from LocalStorage
 */
export function getStoredGoogleUser() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return null;
    return JSON.parse(saved);
  } catch (err) {
    console.error('Error reading stored Google user:', err);
    return null;
  }
}

/**
 * Save Google user to LocalStorage
 */
export function saveGoogleUser(userData) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
  } catch (err) {
    console.error('Error saving Google user:', err);
  }
}

/**
 * Remove stored Google user
 */
export function removeGoogleUser() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.error('Error removing Google user:', err);
  }
}

/**
 * Get configured Google Client ID
 */
export function getGoogleClientId() {
  const stored = localStorage.getItem(CLIENT_ID_KEY);
  if (stored && (stored.includes('placeholder') || stored.length < 25)) {
    localStorage.removeItem(CLIENT_ID_KEY);
    return DEFAULT_GOOGLE_CLIENT_ID;
  }
  return stored || DEFAULT_GOOGLE_CLIENT_ID;
}

/**
 * Save configured Google Client ID
 */
export function saveGoogleClientId(clientId) {
  if (!clientId || !clientId.trim()) {
    localStorage.removeItem(CLIENT_ID_KEY);
  } else {
    localStorage.setItem(CLIENT_ID_KEY, clientId.trim());
  }
}

/**
 * Initiate full-screen browser redirect to Google OAuth (navigates entire browser tab)
 */
export function loginWithGoogleRedirect() {
  const clientId = getGoogleClientId();
  const redirectUri = window.location.origin;
  const scope = encodeURIComponent('openid email profile');
  const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=token&scope=${scope}&prompt=select_account`;
  window.location.href = url;
}
