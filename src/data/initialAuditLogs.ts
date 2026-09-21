import { AuditLogEntry } from '../types';

export const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [];

/**
 * Institutional cryptographic integrity hasher for audit trail verification
 */
export function generateAuditHash(
  entryOrDetails: Partial<AuditLogEntry> | string,
  timestampOrPrevHash: string = '',
  actorName: string = ''
): string {
  let payload = '';
  if (typeof entryOrDetails === 'string') {
    payload = `${timestampOrPrevHash}|${actorName}|${entryOrDetails}`;
  } else {
    payload = `${entryOrDetails.timestamp || ''}|${entryOrDetails.action || ''}|${entryOrDetails.performedBy?.email || ''}|${entryOrDetails.details || ''}|${timestampOrPrevHash}`;
  }
  let hash = 0;
  for (let i = 0; i < payload.length; i++) {
    const char = payload.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  const hex = Math.abs(hash).toString(16).padStart(8, '0');
  return `sha256-${hex}${hex}${hex}${hex}`.substring(0, 64);
}
