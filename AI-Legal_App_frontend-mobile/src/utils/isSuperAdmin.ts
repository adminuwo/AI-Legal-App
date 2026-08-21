/**
 * Returns true if the user has the SUPER_ADMIN role.
 */
export const isSuperAdmin = (user?: any): boolean => {
  if (!user) return false;
  return user.role === 'SUPER_ADMIN';
};
