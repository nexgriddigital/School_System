import { AuditLogEntry } from '../types';

export const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'AUD-2026-0921-001',
    timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString(), // 12 mins ago
    action: 'DATA_SNAPSHOT_EXPORTED',
    actionLabel: 'Institutional System Snapshot JSON Exported',
    category: 'DATA_GOVERNANCE',
    severity: 'WARNING',
    performedBy: {
      name: 'Dr. Henok Kebede',
      role: 'PRINCIPAL',
      email: 'principal@academyofexcellence.edu.et'
    },
    targetEntity: {
      type: 'BACKUP',
      label: 'Full System Snapshot (AES-256 Encrypted)'
    },
    details: 'Principal Dr. Henok Kebede initiated and downloaded a complete institutional database snapshot JSON (scholars, finance rosters, grades, staff accounts).',
    ipAddress: '10.14.0.12 (Campus Executive Office)',
    status: 'SUCCESS',
    metadata: {
      exportType: 'JSON_SNAPSHOT',
      recordCount: 842,
      fileSizeKb: 148.5,
      encryption: 'AES-256'
    },
    checksum: 'e7c9f81a3d5b20498bfe11904a259c7823e59b2d87e14309a47d28c61e4b9f02'
  },
  {
    id: 'AUD-2026-0921-002',
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(), // 45 mins ago
    action: 'MASTER_CODE_CHANGED',
    actionLabel: 'Master Authorization Key Rotated',
    category: 'SECURITY_CREDENTIALS',
    severity: 'CRITICAL',
    performedBy: {
      name: 'Dr. Henok Kebede',
      role: 'PRINCIPAL',
      email: 'principal@academyofexcellence.edu.et'
    },
    targetEntity: {
      type: 'SECURITY',
      label: 'Principal Apex Authorization Credential'
    },
    details: 'Master Authorization Code was successfully rotated and updated by the School Principal. Previous emergency credentials were superseded.',
    ipAddress: '10.14.0.12 (Campus Executive Office)',
    status: 'SUCCESS',
    metadata: {
      rotationReason: 'Scheduled Institutional Security Compliance',
      verificationMethod: 'Current Master Key Match',
      keyComplexity: 'Verified High Entropy'
    },
    checksum: 'a4b17f839c02d1847e56bc910248ad95c328e104f981297e641738c82b04f129'
  },
  {
    id: 'AUD-2026-0921-003',
    timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(), // 3 hours ago
    action: 'USER_CREATED',
    actionLabel: 'Institutional Staff Account Provisioned',
    category: 'USER_MANAGEMENT',
    severity: 'INFO',
    performedBy: {
      name: 'Dr. Henok Kebede',
      role: 'PRINCIPAL',
      email: 'principal@academyofexcellence.edu.et'
    },
    targetEntity: {
      type: 'USER',
      id: 'USR-REG-0042',
      label: 'Sr. Rahel Gizaw (Registrar)'
    },
    details: 'Administrative account provisioned for Admissions Officer Sr. Rahel Gizaw with temporary single-use credentials sent via Gmail dispatch.',
    ipAddress: '10.14.0.12 (Campus Executive Office)',
    status: 'SUCCESS',
    metadata: {
      assignedRole: 'REGISTRAR',
      department: 'Admissions & Student Records',
      mustChangePassword: true,
      emailDispatch: 'CONFIRMED'
    },
    checksum: '9f83a21bc4e578103d82914c67b09f124a87e59c34d281098e721a4f02b938c1'
  },
  {
    id: 'AUD-2026-0921-004',
    timestamp: new Date(Date.now() - 1000 * 60 * 320).toISOString(), // 5.3 hours ago
    action: 'USER_CREATED',
    actionLabel: 'Institutional Faculty Account Provisioned',
    category: 'USER_MANAGEMENT',
    severity: 'INFO',
    performedBy: {
      name: 'Dr. Henok Kebede',
      role: 'PRINCIPAL',
      email: 'principal@academyofexcellence.edu.et'
    },
    targetEntity: {
      type: 'TEACHER',
      id: 'USR-TCH-0812',
      label: 'Ato Berhanu Tesfaye (Senior Physics Master)'
    },
    details: 'Faculty account created for Ato Berhanu Tesfaye. Allocated to Secondary Division Natural Sciences Stream.',
    ipAddress: '10.14.0.12 (Campus Executive Office)',
    status: 'SUCCESS',
    metadata: {
      assignedRole: 'TEACHER',
      department: 'Department of Physical Sciences',
      subject: 'Physics',
      grade: 11
    },
    checksum: '3b819f72c01a54d89e217034c98f12a4b76e58d9230198c471e820fa943b1c85'
  },
  {
    id: 'AUD-2026-0921-005',
    timestamp: new Date(Date.now() - 1000 * 60 * 480).toISOString(), // 8 hours ago
    action: 'DISCIPLINARY_REVERSED',
    actionLabel: 'Disciplinary Sanction Rescinded & Overruled',
    category: 'ACADEMIC_ADMIN',
    severity: 'WARNING',
    performedBy: {
      name: 'Dr. Henok Kebede',
      role: 'PRINCIPAL',
      email: 'principal@academyofexcellence.edu.et'
    },
    targetEntity: {
      type: 'DISCIPLINARY',
      id: 'DISC-2026-004',
      label: 'Scholar: Biruk Solomon'
    },
    details: 'Principal exercised administrative authority to reverse disciplinary warning after successful restitution, restorative counseling, and parent conference.',
    ipAddress: '10.14.0.12 (Campus Executive Office)',
    status: 'SUCCESS',
    metadata: {
      studentId: 'OSK-2026-0904',
      originalOffense: 'Unauthorized Library Equipment Moving',
      counselorApproved: true
    },
    checksum: '67a8b9012c4d8e573f1092a83c74b1e5920a48d371c90284e5b7194f283a0194'
  },
  {
    id: 'AUD-2026-0921-006',
    timestamp: new Date(Date.now() - 1000 * 60 * 720).toISOString(), // 12 hours ago
    action: 'SECURITY_TIMEOUT_UPDATED',
    actionLabel: 'Session Inactivity Timeout Reconfigured',
    category: 'SECURITY_CREDENTIALS',
    severity: 'INFO',
    performedBy: {
      name: 'Dr. Henok Kebede',
      role: 'PRINCIPAL',
      email: 'principal@academyofexcellence.edu.et'
    },
    targetEntity: {
      type: 'SYSTEM',
      label: 'Session Security Watchdog'
    },
    details: 'Institutional session timeout threshold set to 15 minutes of idle time to safeguard against unattended staff terminals.',
    ipAddress: '10.14.0.12 (Campus Executive Office)',
    status: 'SUCCESS',
    metadata: {
      timeoutMinutes: 15,
      enforcementScope: 'ALL_INSTITUTIONAL_ROLES'
    },
    checksum: '81c4e92b3a7051d68f294017a5e8c3b0192d4785e6b10294f837210ac594e218'
  },
  {
    id: 'AUD-2026-0921-007',
    timestamp: new Date(Date.now() - 1000 * 60 * 1440).toISOString(), // 24 hours ago
    action: 'SYSTEM_GENESIS',
    actionLabel: 'Institutional System Genesis & Apex Bootstrapping',
    category: 'SYSTEM_OPERATIONS',
    severity: 'INFO',
    performedBy: {
      name: 'SYSTEM_KERNEL',
      role: 'SYSTEM'
    },
    targetEntity: {
      type: 'SYSTEM',
      label: 'Academy of Excellence SIS Core'
    },
    details: 'Initial database schema verification, master cryptographic keystore initialization, and primary ledger synchronization completed successfully.',
    ipAddress: '127.0.0.1 (Local Host Engine)',
    status: 'SUCCESS',
    metadata: {
      version: 'v2.6.4-ENTERPRISE',
      environment: 'PRODUCTION_CONTAINER',
      integrityCheck: 'PASSED'
    },
    checksum: '14f9a8b27c3e50d691824b071a5c38e920d47b15e8c20194a739502bc841f92e'
  }
];

export function generateAuditHash(details: string, timestamp: string, actor: string): string {
  let hash = 0;
  const str = `${timestamp}_${actor}_${details}`;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  const hex = Math.abs(hash).toString(16).padStart(8, '0');
  const salt = '9f4c82b1d7a03e65';
  return `${hex}${salt}${hex}${salt}`.slice(0, 64);
}
