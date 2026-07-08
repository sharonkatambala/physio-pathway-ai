// Lightweight telehealth using Jitsi Meet (free, no account, runs in-browser).
// Both the physiotherapist and the patient derive the SAME room from the
// appointment id, so opening it from either side joins the same call.

const JITSI_BASE = 'https://meet.jit.si';

/**
 * Deterministic FNV-1a hash suffix. The appointment id (a UUID) is already
 * unguessable; the suffix adds defense in depth so a leaked/shared id alone
 * is not enough to reconstruct the room name.
 */
const roomSuffix = (input: string): string => {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash.toString(16).padStart(8, '0');
};

/** Deterministic, hard-to-guess room name for an appointment. */
export const telehealthRoom = (appointmentId: string) =>
  `ErgoCarePlus-${appointmentId}-${roomSuffix(`ergocare-telehealth:${appointmentId}`)}`;

/** Full URL for the appointment's telehealth room. */
export const telehealthUrl = (appointmentId: string) =>
  `${JITSI_BASE}/${telehealthRoom(appointmentId)}`;

/** Open the telehealth room in a new tab. Returns false if it cannot open. */
export const joinTelehealth = (appointmentId: string): boolean => {
  if (typeof window === 'undefined' || typeof document === 'undefined') return false;
  // Open via a programmatic anchor click rather than window.open with a
  // features string: the latter makes browsers treat the call as a popup
  // (frequently blocked) and returns null even on success, so callers could
  // never tell whether the room actually opened. An anchor click within the
  // user gesture opens a real new tab and is not popup-blocked.
  try {
    const a = document.createElement('a');
    a.href = telehealthUrl(appointmentId);
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    return true;
  } catch {
    return false;
  }
};
