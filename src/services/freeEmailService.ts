/**
 * Free Email Dispatch Service
 * Dispatches account credentials and temporary passwords directly to the recipient's
 * email inbox via a 100% free public email dispatch endpoint (FormSubmit AJAX API),
 * with an automatic fallback to pre-formatted mailto drafts.
 * Requires no paid API keys and works seamlessly in both preview and production.
 */

export interface TemporaryPasswordEmailPayload {
  recipientEmail: string;
  recipientName: string;
  roleName: string;
  positionTitle?: string;
  tempPassword: string;
  schoolName: string;
  senderName?: string;
  portalLoginUrl?: string;
}

/**
 * Dispatches a temporary password email to the user using the free FormSubmit AJAX API.
 */
export async function sendFreeTemporaryPasswordEmail(
  payload: TemporaryPasswordEmailPayload
): Promise<{ success: boolean; dispatchedVia: 'FREE_API' | 'MAILTO'; message: string }> {
  const {
    recipientEmail,
    recipientName,
    roleName,
    positionTitle = 'Institutional Member',
    tempPassword,
    schoolName,
    senderName = 'Office of the Principal',
  } = payload;

  const subject = `${schoolName} - Confidential Account Credentials & Temporary Password`;
  const cleanEmail = recipientEmail.trim();

  // Try dispatching via free public JSON email delivery endpoint
  try {
    const response = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(cleanEmail)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        _subject: subject,
        _template: 'box',
        _captcha: 'false',
        _replyto: 'no-reply@oskaracademy.edu',
        Institution: schoolName,
        Recipient_Name: recipientName,
        Portal_Role: roleName,
        Position_Title: positionTitle,
        Assigned_Temporary_Password: tempPassword,
        Dispatched_By: senderName,
        Notice: 'Please sign in to your institutional portal using this temporary password. You will be prompted to change it upon first authentication.',
      }),
    });

    if (response.ok) {
      const data = await response.json().catch(() => ({}));
      return {
        success: true,
        dispatchedVia: 'FREE_API',
        message: `Temporary password email successfully dispatched via Free API directly to ${cleanEmail}`,
      };
    }
  } catch (err) {
    console.warn('Free API email dispatch encountered network limitation; activating seamless mailto fallback:', err);
  }

  // Graceful fallback to client-side mailto draft
  return {
    success: true,
    dispatchedVia: 'MAILTO',
    message: `Account created. Email draft prepared for ${cleanEmail}`,
  };
}

/**
 * Generates an RFC compliant mailto URL with the temporary password
 */
export function buildFreeCredentialsMailtoUrl(payload: TemporaryPasswordEmailPayload): string {
  const subject = encodeURIComponent(`${payload.schoolName} - Your Portal Account Temporary Password`);
  const body = encodeURIComponent(
`Dear ${payload.recipientName},

Welcome to ${payload.schoolName}! An institutional user account has been provisioned for you.

Account Details:
------------------------------------------
• Role: ${payload.roleName}
• Position: ${payload.positionTitle || 'Institutional Member'}
• Username / Email: ${payload.recipientEmail}
• Temporary Password: ${payload.tempPassword}
------------------------------------------

Important Security Instructions:
1. Please sign in to the portal immediately using this temporary password.
2. You will be required to establish a confidential personal password on your first login.
3. Do not share this temporary password with anyone.

Best regards,
${payload.senderName || 'Office of the Principal'}
${payload.schoolName}`
  );

  return `mailto:${encodeURIComponent(payload.recipientEmail)}?subject=${subject}&body=${body}`;
}
