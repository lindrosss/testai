export function withInviteQuery(path, invite) {
  const inv = (invite || '').trim();
  if (!inv) return path;
  const sep = path.includes('?') ? '&' : '?';
  return `${path}${sep}invite=${encodeURIComponent(inv)}`;
}

