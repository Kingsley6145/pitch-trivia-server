import { auth } from '../firebase/config';

const ADMIN_EMAILS = [
  'Games@pitchtrivia.com',
  'games@pitchtrivia.com',
];

/**
 * Check if current user is admin
 */
export async function isAdmin() {
  const user = auth.currentUser;
  if (!user) return false;
  
  const email = user.email?.toLowerCase();
  return ADMIN_EMAILS.some(
    (adminEmail) => adminEmail.toLowerCase() === email
  );
}

/**
 * Get current authenticated user
 */
export function getCurrentUser() {
  return auth.currentUser;
}

/**
 * Get auth token for API requests
 */
export async function getAuthToken() {
  const user = auth.currentUser;
  if (!user) return null;
  return await user.getIdToken();
}

