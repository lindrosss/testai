/** Учитываем snake_case и camelCase; пустые/мусорные строки считаем неверифицированным. */
export function isEmailVerified(user) {
  if (!user) return false;
  const v = user.email_verified_at ?? user.emailVerifiedAt;
  if (v == null || v === false) return false;
  if (typeof v === 'string') {
    const s = v.trim().toLowerCase();
    if (s === '' || s === 'null' || s === 'undefined') return false;
  }
  return true;
}

export function normalizeAuthUser(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const verifiedAt = raw.email_verified_at ?? raw.emailVerifiedAt ?? null;
  const hasTemporaryPassword = Boolean(
    raw.has_temporary_password ?? raw.hasTemporaryPassword ?? false,
  );
  return {
    ...raw,
    email_verified_at: verifiedAt,
    has_temporary_password: hasTemporaryPassword,
  };
}
