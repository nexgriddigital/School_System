import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  User, 
  signOut 
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize or reuse Firebase App
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);

const provider = new GoogleAuthProvider();
// Required Gmail Scope for sending authentication emails
provider.addScope('https://www.googleapis.com/auth/gmail.send');

// In-memory token storage (MANDATORY: never store access token in localStorage)
let cachedAccessToken: string | null = null;
let isSigningIn = false;

export const initGoogleAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        cachedAccessToken = null;
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

export const signInWithGoogle = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Could not retrieve access token from Google sign in');
    }
    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    // Gracefully handle user closing or dismissing the popup
    if (error?.code === 'auth/popup-closed-by-user' || error?.code === 'auth/cancelled-popup-request') {
      return null;
    }
    if (error?.code === 'auth/popup-blocked') {
      throw new Error('Google sign-in popup was blocked by browser. Please allow popups or open in a new tab.');
    }
    if (error?.code === 'auth/unauthorized-domain') {
      throw new Error('This preview domain is awaiting authorization in Firebase Console. You can use instant OTP passcodes in preview mode.');
    }
    console.warn('Google sign-in notification:', error?.message || error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getGoogleAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const getCurrentGoogleUser = (): User | null => {
  return auth.currentUser;
};

export const signOutGoogle = async () => {
  await signOut(auth);
  cachedAccessToken = null;
};

/**
 * Encodes a string to RFC 4648 Base64URL without padding
 */
function base64UrlEncode(str: string): string {
  // UTF-8 safe base64
  const utf8Bytes = new TextEncoder().encode(str);
  let binary = '';
  for (let i = 0; i < utf8Bytes.length; i++) {
    binary += String.fromCharCode(utf8Bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/**
 * Dispatches an official OTP verification email via Gmail REST API
 */
export async function sendOtpEmailViaGmail({
  recipientEmail,
  otpCode,
  roleName,
  schoolName,
  senderName,
}: {
  recipientEmail: string;
  otpCode: string;
  roleName: string;
  schoolName: string;
  senderName?: string;
}): Promise<{ success: boolean; messageId?: string; error?: string }> {
  if (!cachedAccessToken) {
    throw new Error('Gmail authorization required. Please sign in with your Gmail account.');
  }

  const subject = `${schoolName} - Authentication Security Passcode: ${otpCode}`;

  const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f1f5f9; padding: 30px 10px;">
    <tr>
      <td align="center">
        <table width="600" border="0" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;">
          <!-- Institutional Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #0B192C 0%, #1E3E62 100%); padding: 32px 30px; text-align: center;">
              <h1 style="margin: 0; font-size: 24px; color: #ffffff; font-weight: 700; letter-spacing: 0.5px;">${schoolName}</h1>
              <p style="margin: 6px 0 0 0; font-size: 13px; color: #93c5fd; font-weight: 500;">Unified Security & Identity Verification Services</p>
            </td>
          </tr>
          
          <!-- Content Body -->
          <tr>
            <td style="padding: 32px 36px;">
              <p style="font-size: 15px; margin: 0 0 16px 0; color: #334155;">Hello,</p>
              <p style="font-size: 14px; margin: 0 0 24px 0; color: #475569; line-height: 1.6;">
                A sign-in request was initiated for the <strong>${roleName}</strong> portal associated with <span style="font-family: monospace; color: #0284c7; font-weight: 600;">${recipientEmail}</span>.
              </p>
              
              <!-- Passcode Display Box -->
              <div style="background-color: #f8fafc; border: 2px dashed #93c5fd; border-radius: 12px; padding: 24px; text-align: center; margin: 20px 0;">
                <span style="display: block; font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #64748b; font-weight: 700; margin-bottom: 8px;">Your One-Time Authentication Code</span>
                <span style="display: inline-block; font-family: 'Courier New', Courier, monospace; font-size: 38px; font-weight: 800; color: #1e40af; letter-spacing: 8px; padding: 4px 12px;">
                  ${otpCode}
                </span>
                <p style="margin: 12px 0 0 0; font-size: 12px; color: #64748b;">
                  This code expires in <strong>5 minutes</strong>. Do not disclose this code to anyone.
                </p>
              </div>

              <!-- Security Policy Notice -->
              <div style="background-color: #fefce8; border-left: 4px solid #eab308; padding: 12px 16px; border-radius: 6px; margin: 24px 0;">
                <p style="margin: 0; font-size: 12px; color: #854d0e; line-height: 1.5;">
                  <strong>Security Reminder:</strong> Official password resets or permission elevation must be authorized directly through the Finance Office, Registrar, or Principal.
                </p>
              </div>

              <p style="font-size: 12px; color: #94a3b8; margin: 28px 0 0 0; line-height: 1.5;">
                If you did not attempt this sign in, please disregard this email or report immediately to the institutional IT security desk.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0; font-size: 11px; color: #94a3b8;">
                Dispatched via Google Workspace Gmail API integration &bull; ${schoolName}
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

  const emailLines = [
    `To: ${recipientEmail}`,
    ...(senderName ? [`From: "${senderName}" <me>`] : ['From: <me>']),
    `Subject: =?utf-8?B?${btoa(unescape(encodeURIComponent(subject)))}?=`,
    'MIME-Version: 1.0',
    'Content-Type: text/html; charset=UTF-8',
    'Content-Transfer-Encoding: 7bit',
    '',
    htmlBody,
  ];

  const rawEmail = emailLines.join('\r\n');
  const encodedRaw = base64UrlEncode(rawEmail);

  const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${cachedAccessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      raw: encodedRaw,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error('Gmail API send error:', errorData);
    throw new Error(errorData?.error?.message || `Failed to send email via Gmail (Status: ${response.status})`);
  }

  const data = await response.json();
  return { success: true, messageId: data.id };
}

/**
 * Dispatches an official Account Provisioning email with an Automatic Temporary Password via Gmail REST API
 */
export async function sendTemporaryPasswordEmailViaGmail({
  recipientEmail,
  recipientName,
  roleName,
  positionTitle,
  tempPassword,
  schoolName,
  senderName,
}: {
  recipientEmail: string;
  recipientName: string;
  roleName: string;
  positionTitle: string;
  tempPassword: string;
  schoolName: string;
  senderName?: string;
}): Promise<{ success: boolean; messageId?: string; error?: string }> {
  if (!cachedAccessToken) {
    throw new Error('Gmail authorization required. Please connect your Gmail sender account first.');
  }

  const subject = `${schoolName} - Account Credentials: Temporary Password for ${positionTitle}`;

  const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f1f5f9; padding: 30px 10px;">
    <tr>
      <td align="center">
        <table width="600" border="0" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #0B192C 0%, #1E3E62 100%); padding: 32px 30px; text-align: center;">
              <h1 style="margin: 0; font-size: 24px; color: #ffffff; font-weight: 700; letter-spacing: 0.5px;">${schoolName}</h1>
              <p style="margin: 6px 0 0 0; font-size: 13px; color: #93c5fd; font-weight: 500;">Executive Office of the Principal • User Credential Provisioning</p>
            </td>
          </tr>
          
          <!-- Content Body -->
          <tr>
            <td style="padding: 32px 36px;">
              <p style="font-size: 16px; margin: 0 0 16px 0; color: #1e293b; font-weight: 600;">Dear ${recipientName},</p>
              <p style="font-size: 14px; margin: 0 0 20px 0; color: #475569; line-height: 1.6;">
                The Office of the Principal has provisioned an authorized institutional account for you at <strong>${schoolName}</strong>. Your position and initial access credentials are provided below.
              </p>
              
              <!-- Credentials Summary Box -->
              <div style="background-color: #f8fafc; border: 1px solid #cbd5e1; border-radius: 12px; padding: 20px; margin: 20px 0;">
                <table width="100%" border="0" cellspacing="0" cellpadding="6">
                  <tr>
                    <td width="38%" style="font-size: 12px; color: #64748b; font-weight: 600; text-transform: uppercase;">Assigned Role:</td>
                    <td style="font-size: 14px; color: #0f172a; font-weight: 700;">${roleName}</td>
                  </tr>
                  <tr>
                    <td style="font-size: 12px; color: #64748b; font-weight: 600; text-transform: uppercase;">Official Position:</td>
                    <td style="font-size: 14px; color: #0f172a; font-weight: 600;">${positionTitle}</td>
                  </tr>
                  <tr>
                    <td style="font-size: 12px; color: #64748b; font-weight: 600; text-transform: uppercase;">Login Identifier / Email:</td>
                    <td style="font-size: 14px; color: #0284c7; font-weight: 700; font-family: monospace;">${recipientEmail}</td>
                  </tr>
                </table>
              </div>

              <!-- Automatic Temporary Password Display -->
              <div style="background-color: #eff6ff; border: 2px dashed #60a5fa; border-radius: 12px; padding: 22px; text-align: center; margin: 24px 0;">
                <span style="display: block; font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #2563eb; font-weight: 700; margin-bottom: 8px;">
                  Automatic Temporary Password
                </span>
                <span style="display: inline-block; font-family: 'Courier New', Courier, monospace; font-size: 28px; font-weight: 800; color: #1e3a8a; letter-spacing: 3px; padding: 6px 14px; background: #ffffff; border-radius: 8px; border: 1px solid #bfdbfe;">
                  ${tempPassword}
                </span>
                <p style="margin: 12px 0 0 0; font-size: 12px; color: #1e40af; font-weight: 500;">
                  Copy or memorize this temporary password for your initial sign-in.
                </p>
              </div>

              <!-- First Login Policy Notice -->
              <div style="background-color: #fefce8; border-left: 4px solid #eab308; padding: 14px 18px; border-radius: 6px; margin: 24px 0;">
                <p style="margin: 0 0 6px 0; font-size: 13px; color: #713f12; font-weight: 700;">
                  ⚠️ Mandatory First-Login Password Change Protocol
                </p>
                <p style="margin: 0; font-size: 12px; color: #854d0e; line-height: 1.5;">
                  For institutional information security, <strong>you must change this temporary password immediately upon your first login</strong>. You will be prompted to choose a permanent, secure personal password after passing Gmail OTP verification.
                </p>
              </div>

              <!-- Instructions -->
              <div style="margin: 20px 0;">
                <p style="font-size: 13px; font-weight: 600; color: #334155; margin-bottom: 8px;">First-Time Sign-In Steps:</p>
                <ol style="font-size: 12px; color: #475569; padding-left: 20px; line-height: 1.7; margin: 0;">
                  <li>Visit the <strong>${schoolName}</strong> Unified Portal.</li>
                  <li>Enter your assigned email (<strong>${recipientEmail}</strong>) and your temporary password.</li>
                  <li>Check your Gmail inbox for the live 6-digit OTP verification code.</li>
                  <li>When prompted on screen, enter your new personal password to unlock your workspace.</li>
                </ol>
              </div>

              <p style="font-size: 12px; color: #94a3b8; margin: 28px 0 0 0; line-height: 1.5;">
                If you have any questions regarding your role or department assignment, please contact the Office of the Principal directly.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0; font-size: 11px; color: #94a3b8;">
                Dispatched via Google Workspace Gmail API integration &bull; ${schoolName} &bull; NexGrid Digital Systems
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

  const emailLines = [
    `To: ${recipientEmail}`,
    ...(senderName ? [`From: "${senderName}" <me>`] : ['From: <me>']),
    `Subject: =?utf-8?B?${btoa(unescape(encodeURIComponent(subject)))}?=`,
    'MIME-Version: 1.0',
    'Content-Type: text/html; charset=UTF-8',
    'Content-Transfer-Encoding: 7bit',
    '',
    htmlBody,
  ];

  const rawEmail = emailLines.join('\r\n');
  const encodedRaw = base64UrlEncode(rawEmail);

  const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${cachedAccessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      raw: encodedRaw,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error('Gmail API credential send error:', errorData);
    throw new Error(errorData?.error?.message || `Failed to dispatch temporary password email via Gmail (Status: ${response.status})`);
  }

  const data = await response.json();
  return { success: true, messageId: data.id };
}
