// Lightweight telehealth using Jitsi Meet (free, no account, runs in-browser).
// Both the physiotherapist and the patient derive the SAME room from the
// appointment id, so opening it from either side joins the same call.

const JITSI_BASE = 'https://meet.jit.si';

/** Deterministic, hard-to-guess room name for an appointment. */
export const telehealthRoom = (appointmentId: string) =>
  `ErgoCarePlus-${appointmentId}`;

/** Full URL for the appointment's telehealth room. */
export const telehealthUrl = (appointmentId: string) =>
  `${JITSI_BASE}/${telehealthRoom(appointmentId)}`;

/** Open the telehealth room in a new tab. Returns false if blocked. */
export const joinTelehealth = (appointmentId: string): boolean => {
  if (typeof window === 'undefined') return false;
  const win = window.open(telehealthUrl(appointmentId), '_blank', 'noopener,noreferrer');
  return Boolean(win);
};
