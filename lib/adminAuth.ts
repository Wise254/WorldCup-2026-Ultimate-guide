import bcrypt from "bcryptjs";

// In a real app, this would be in environment variables
// For now, we'll use a simple hash of "admin123"
const ADMIN_PASSWORD_HASH = "$2a$10$YourHashedPasswordHere";

// Function to hash a password (run once to create hash)
export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 10);
}

// Verify password
export async function verifyPassword(
  inputPassword: string,
  hashedPassword: string
): Promise<boolean> {
  return await bcrypt.compare(inputPassword, hashedPassword);
}

// Simple session check (for demo purposes)
// In production, use NextAuth.js or a proper auth system
export function isAuthenticated(request: Request): boolean {
  // Check for auth token in cookies
  const cookie = request.headers.get("cookie");
  if (!cookie) return false;
  
  // Simple token check (you can expand this)
  return cookie.includes("admin_auth=true");
}

// Generate a simple session token
export function createSessionCookie(): string {
  return "admin_auth=true; Path=/; HttpOnly; Max-Age=3600"; // 1 hour
}

// Clear session
export function clearSessionCookie(): string {
  return "admin_auth=true; Path=/; Max-Age=0";
}