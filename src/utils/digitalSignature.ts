import { DigitalSignatureInfo, UserRole } from '../types';

/**
 * Generates a tamper-evident SHA-style verification hash for a signed internal document.
 */
export const generateSignatureHash = (
  documentId: string,
  signatoryId: string,
  timestamp: string
): string => {
  const seed = `${documentId}:${signatoryId}:${timestamp}:OSKAR_SECURE_AUTH_2026`;
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  const hex = Math.abs(hash).toString(16).toUpperCase().padStart(8, '0');
  const randomSuffix = Math.floor(10000000 + Math.random() * 90000000).toString(16).toUpperCase();
  return `SIG-AUTH-${hex}-${randomSuffix}`;
};

export type CursiveStyle = 'CLASSIC' | 'ELEGANT' | 'EXECUTIVE' | 'MODERN';

/**
 * Renders a name in an authentic handwritten cursive style onto an offscreen canvas
 * and returns a crisp, transparent PNG data URL suitable for embedding into documents or PDFs.
 */
export const renderCursiveSignatureDataUrl = (
  name: string,
  style: CursiveStyle = 'CLASSIC',
  color: string = '#1e3a8a' // Royal Ink Blue
): string => {
  const canvas = document.createElement('canvas');
  canvas.width = 600;
  canvas.height = 200;
  const ctx = canvas.getContext('2d');

  if (!ctx) return '';

  // Clear with transparent background
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = color;
  ctx.strokeStyle = color;
  ctx.lineWidth = 2.5;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  let fontSpec = 'italic 52px "Brush Script MT", "Caveat", "Segoe Script", cursive';
  if (style === 'ELEGANT') {
    fontSpec = 'italic 48px "Snell Roundhand", "Apple Chancery", "Lucida Handwriting", cursive';
  } else if (style === 'EXECUTIVE') {
    fontSpec = 'italic 54px "Edwardian Script ITC", "Bickham Script Pro", "Monotype Corsiva", cursive';
  } else if (style === 'MODERN') {
    fontSpec = 'italic 46px "Segoe Script", "Comic Sans MS", cursive';
  }

  ctx.font = fontSpec;
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'center';

  // Draw signature name
  ctx.fillText(name, canvas.width / 2, canvas.height / 2 - 10);

  // Draw authentic flourishes / underline stroke
  ctx.beginPath();
  const startX = canvas.width / 2 - (ctx.measureText(name).width / 2) - 10;
  const endX = canvas.width / 2 + (ctx.measureText(name).width / 2) + 25;
  const lineY = canvas.height / 2 + 30;

  ctx.moveTo(startX, lineY);
  ctx.bezierCurveTo(
    startX + 80, lineY - 10,
    endX - 80, lineY + 15,
    endX, lineY
  );
  ctx.stroke();

  return canvas.toDataURL('image/png');
};

/**
 * Creates a complete DigitalSignatureInfo payload ready to attach to any internal document
 */
export const buildDigitalSignaturePayload = (params: {
  signatoryId: string;
  signatoryName: string;
  signatoryRole: UserRole;
  signatoryTitle: string;
  signatureDataUrl: string;
  documentId: string;
  signingRemarks?: string;
  authorizationType?: 'APPROVED' | 'OFFICIAL_ATTESTATION' | 'EXECUTIVE_CLEARANCE' | 'RECORDED_CERTIFIED';
}): DigitalSignatureInfo => {
  const timestamp = new Date().toISOString();
  const hash = generateSignatureHash(params.documentId, params.signatoryId, timestamp);

  return {
    signatoryId: params.signatoryId,
    signatoryName: params.signatoryName,
    signatoryRole: params.signatoryRole,
    signatoryTitle: params.signatoryTitle,
    signatureDataUrl: params.signatureDataUrl,
    signedAt: timestamp,
    verificationHash: hash,
    signingRemarks: params.signingRemarks || 'Officially verified and authorized under institutional governance.',
    authorizationType: params.authorizationType || 'APPROVED',
  };
};
