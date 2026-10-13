const KEY = 'codeClashMatchSession';

export function readMatchSession(userId) {
  try {
    const saved = JSON.parse(sessionStorage.getItem(KEY));
    return saved?.roomCode && saved?.resumeToken && saved.userId === (userId || null) ? saved : null;
  } catch {
    return null;
  }
}

export function saveMatchSession(session) {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(session));
  } catch {
    // The live match still works when browser storage is unavailable.
  }
}

export function clearMatchSession() {
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    // Storage may be disabled by browser policy.
  }
}

export function openMatchSession(roomCode, userId, preferences) {
  const saved = readMatchSession(userId);
  if (saved?.roomCode === roomCode) return saved;
  const session = { roomCode, userId: userId || null, preferences,
    resumeToken: Array.from(window.crypto.getRandomValues(new Uint8Array(16)),
      (byte) => byte.toString(16).padStart(2, '0')).join('') };
  saveMatchSession(session);
  return session;
}
