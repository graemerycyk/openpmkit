/**
 * Admin utilities for workbench and other admin-only features
 */

/**
 * Check if an email is in the admin allowlist
 * Admin emails are configured via ADMIN_EMAILS env variable (comma-separated)
 */
export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;

  const adminEmails =
    process.env.ADMIN_EMAILS?.split(',').map((e) => e.trim().toLowerCase()) ||
    [];

  return adminEmails.includes(email.toLowerCase());
}

/**
 * Get the list of admin emails (for debugging/display)
 */
export function getAdminEmails(): string[] {
  return (
    process.env.ADMIN_EMAILS?.split(',').map((e) => e.trim().toLowerCase()) ||
    []
  );
}
