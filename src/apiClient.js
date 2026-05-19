import { normalizeInvitation } from './storage.js';

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

export async function saveRemoteInvitation(invitation) {
  try {
    const response = await fetch('/api/state', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ data: invitation }),
    });

    return response.ok;
  } catch {
    return false;
  }
}
