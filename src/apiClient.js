import { normalizeInvitation } from './storage.js';

const ADMIN_SESSION_KEY = 'nikahfix.admin.session.v1';

export function getAdminSession() {
  try {
    const raw = localStorage.getItem(ADMIN_SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearAdminSession() {
  localStorage.removeItem(ADMIN_SESSION_KEY);
}

function saveAdminSession(session) {
  localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(session));
}

export async function fetchRemoteInvitation() {
  try {
    const response = await fetch('/api/state', {
      method: 'GET',
      cache: 'no-store',
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) return null;

    const payload = await response.json();
    return payload?.data ? normalizeInvitation(payload.data) : null;
  } catch {
    return null;
  }
}

export async function loginAdmin(username, password) {
  try {
    const response = await fetch('/api/auth', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });
    const payload = await response.json().catch(() => null);

    if (!response.ok || !payload?.token) {
      return { ok: false, error: payload?.error || 'Login admin gagal.' };
    }

    const session = { token: payload.token, user: payload.user };
    saveAdminSession(session);
    return { ok: true, session };
  } catch {
    return { ok: false, error: 'Tidak bisa menghubungi backend auth.' };
  }
}

export async function verifyAdminSession(session) {
  if (!session?.token) return false;

  try {
    const response = await fetch('/api/auth', {
      method: 'GET',
      cache: 'no-store',
      headers: {
        Authorization: `Bearer ${session.token}`,
      },
    });
    return response.ok;
  } catch {
    return false;
  }
}

export async function saveRemoteInvitation(invitation, token) {
  try {
    const response = await fetch('/api/state', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ data: invitation }),
    });

    const payload = await response.json().catch(() => null);
    return {
      ok: response.ok,
      status: response.status,
      error: payload?.error || '',
    };
  } catch {
    return { ok: false, status: 0, error: 'Tidak bisa menghubungi API state.' };
  }
}

export async function saveRemoteRsvp(rsvp) {
  try {
    const response = await fetch('/api/rsvp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ rsvp }),
    });
    const payload = await response.json().catch(() => null);
    return response.ok && payload?.data ? normalizeInvitation(payload.data) : null;
  } catch {
    return null;
  }
}

export async function deleteRemoteRsvp(guestSlug) {
  try {
    const response = await fetch('/api/rsvp', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ guestSlug }),
    });
    const payload = await response.json().catch(() => null);
    return response.ok && payload?.data ? normalizeInvitation(payload.data) : null;
  } catch {
    return null;
  }
}
