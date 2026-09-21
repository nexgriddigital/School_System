import { 
  sendRawHtmlEmailViaGmail, 
  isGmailAuthorized, 
  signInWithGoogle, 
  getCurrentGoogleUser 
} from './gmailAuthService';
import { DisciplinaryAction, Invoice, Student } from '../types';

export interface DisciplinaryHearingEmailParams {
  recipientEmail: string;
  recipientName: string;
  studentName: string;
  studentId: string;
  grade: number;
  sectionId?: string;
  incidentType: string;
  incidentDate: string;
  description: string;
  hearingDate: string;
  hearingTime: string;
  hearingLocation: string;
  hearingCommittee?: string[];
  schoolName: string;
  counsellorName?: string;
  senderName?: string;
}

export interface UrgentFeeDeadlineEmailParams {
  recipientEmail: string;
  recipientName: string;
  studentName: string;
  studentId: string;
  grade: number;
  accountNumber: string;
  invoiceTitle: string;
  amount: number;
  dueDate: string;
  paymentReference?: string;
  daysRemaining?: number;
  isOverdue?: boolean;
  schoolName: string;
  senderName?: string;
  customMessage?: string;
}

/**
 * Builds responsive institutional HTML template for upcoming Disciplinary Hearing notice
 */
export function generateDisciplinaryHearingEmailHtml(params: DisciplinaryHearingEmailParams): string {
  const {
    recipientName,
    studentName,
    studentId,
    grade,
    sectionId,
    incidentType,
    incidentDate,
    description,
    hearingDate,
    hearingTime,
    hearingLocation,
    hearingCommittee = ['Office of the Principal', 'Head Guidance Counsellor'],
    schoolName,
    counsellorName = 'Head Guidance Counsellor',
  } = params;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${schoolName} - Official Summons: Disciplinary Hearing Notice</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #0f172a; line-height: 1.6;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; padding: 32px 12px;">
    <tr>
      <td align="center">
        <table width="620" border="0" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.06); border: 1px solid #e2e8f0;">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #450a0a 0%, #991b1b 60%, #b91c1c 100%); padding: 32px 30px; text-align: center;">
              <span style="display: inline-block; background-color: rgba(255,255,255,0.18); color: #fecaca; font-size: 11px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; padding: 4px 12px; border-radius: 9999px; border: 1px solid rgba(255,255,255,0.3); margin-bottom: 10px;">
                Official Institutional Summons
              </span>
              <h1 style="margin: 0; font-size: 24px; color: #ffffff; font-weight: 800; letter-spacing: 0.5px;">${schoolName}</h1>
              <p style="margin: 6px 0 0 0; font-size: 13px; color: #fee2e2; font-weight: 500;">
                Office of Student Affairs &bull; Formal Disciplinary Hearing Committee
              </p>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 32px 34px;">
              <p style="font-size: 15px; margin: 0 0 16px 0; color: #1e293b; font-weight: 600;">
                Dear ${recipientName},
              </p>
              
              <p style="font-size: 14px; margin: 0 0 20px 0; color: #334155; line-height: 1.6;">
                This is an official summons issued by the Disciplinary Committee of <strong>${schoolName}</strong>. You are formally requested to attend an in-person Disciplinary Hearing regarding your scholar, <strong>${studentName}</strong>.
              </p>

              <!-- Scholar & Incident Profile -->
              <div style="background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 12px; padding: 18px; margin: 0 0 24px 0;">
                <table width="100%" border="0" cellspacing="0" cellpadding="4">
                  <tr>
                    <td width="35%" style="font-size: 11px; text-transform: uppercase; color: #991b1b; font-weight: 700;">Scholar Name:</td>
                    <td style="font-size: 13px; color: #1e293b; font-weight: 700;">${studentName}</td>
                  </tr>
                  <tr>
                    <td style="font-size: 11px; text-transform: uppercase; color: #991b1b; font-weight: 700;">Student ID:</td>
                    <td style="font-size: 13px; color: #1e293b; font-family: monospace; font-weight: 700;">${studentId}</td>
                  </tr>
                  <tr>
                    <td style="font-size: 11px; text-transform: uppercase; color: #991b1b; font-weight: 700;">Grade / Section:</td>
                    <td style="font-size: 13px; color: #1e293b;">Grade ${grade}${sectionId ? ` (Section ${sectionId})` : ''}</td>
                  </tr>
                  <tr>
                    <td style="font-size: 11px; text-transform: uppercase; color: #991b1b; font-weight: 700;">Infraction Category:</td>
                    <td style="font-size: 13px; color: #b91c1c; font-weight: 700;">${incidentType}</td>
                  </tr>
                  <tr>
                    <td style="font-size: 11px; text-transform: uppercase; color: #991b1b; font-weight: 700;">Incident Date:</td>
                    <td style="font-size: 13px; color: #334155;">${incidentDate}</td>
                  </tr>
                </table>

                <div style="margin-top: 12px; padding-top: 10px; border-top: 1px dashed #fca5a5;">
                  <p style="margin: 0; font-size: 12px; color: #7f1d1d; line-height: 1.5;">
                    <strong>Factual Context:</strong> ${description}
                  </p>
                </div>
              </div>

              <!-- Hearing Schedule Card -->
              <div style="background-color: #0f172a; color: #ffffff; border-radius: 14px; padding: 22px; margin: 0 0 24px 0; border: 1px solid #1e293b; box-shadow: 0 4px 10px rgba(15,23,42,0.12);">
                <div style="text-align: center; margin-bottom: 16px;">
                  <span style="font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #f87171; font-weight: 700;">
                    Scheduled Committee Session
                  </span>
                  <h3 style="margin: 6px 0 0 0; font-size: 18px; font-weight: 700; color: #ffffff;">
                    Formal Disciplinary Hearing
                  </h3>
                </div>

                <table width="100%" border="0" cellspacing="0" cellpadding="8" style="background-color: #1e293b; border-radius: 10px;">
                  <tr>
                    <td width="40%" style="font-size: 12px; color: #94a3b8; font-weight: 600;">📅 Date:</td>
                    <td style="font-size: 13px; color: #ffffff; font-weight: 700;">${hearingDate}</td>
                  </tr>
                  <tr>
                    <td style="font-size: 12px; color: #94a3b8; font-weight: 600;">⏰ Scheduled Time:</td>
                    <td style="font-size: 13px; color: #38bdf8; font-weight: 700; font-family: monospace;">${hearingTime}</td>
                  </tr>
                  <tr>
                    <td style="font-size: 12px; color: #94a3b8; font-weight: 600;">🏛️ Location / Room:</td>
                    <td style="font-size: 13px; color: #ffffff; font-weight: 600;">${hearingLocation}</td>
                  </tr>
                  <tr>
                    <td style="font-size: 12px; color: #94a3b8; font-weight: 600;">👥 Presiding Board:</td>
                    <td style="font-size: 12px; color: #cbd5e1;">${hearingCommittee.join(', ')}</td>
                  </tr>
                </table>
              </div>

              <!-- Rights & Attendance Guidelines -->
              <div style="background-color: #fffbeb; border-left: 4px solid #f59e0b; padding: 14px 18px; border-radius: 8px; margin: 0 0 24px 0;">
                <p style="margin: 0 0 6px 0; font-size: 12px; font-weight: 700; color: #92400e;">
                  Important Guidelines & Parental Rights:
                </p>
                <ul style="margin: 0; padding-left: 20px; font-size: 12px; color: #78350f; line-height: 1.6;">
                  <li>The scholar must be accompanied by at least one legal guardian or parent.</li>
                  <li>You have the right to review witness statements and academic/conduct reports in advance.</li>
                  <li>Failure to attend without 24-hour advance notice may result in summary committee rulings.</li>
                </ul>
              </div>

              <!-- Contact & Confirmation -->
              <p style="font-size: 13px; color: #475569; margin: 0 0 8px 0;">
                To confirm receipt or request emergency rescheduling, please reply directly or contact the Counsellor's desk at <strong>+251 11 123 4567 (Ext 104)</strong> or via the Parent Portal.
              </p>

              <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b;">
                <p style="margin: 0; font-weight: 700; color: #1e293b;">${counsellorName}</p>
                <p style="margin: 2px 0 0 0;">Head of Guidance & Disciplinary Secretary</p>
                <p style="margin: 2px 0 0 0;">${schoolName}</p>
              </div>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f1f5f9; padding: 18px 24px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0; font-size: 11px; color: #94a3b8;">
                Dispatched via Google Workspace Gmail API integration &bull; ${schoolName} Institutional SIS
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
}

/**
 * Builds responsive institutional HTML template for Urgent Finance Fee Deadlines
 */
export function generateUrgentFeeDeadlineEmailHtml(params: UrgentFeeDeadlineEmailParams): string {
  const {
    recipientName,
    studentName,
    studentId,
    grade,
    accountNumber,
    invoiceTitle,
    amount,
    dueDate,
    paymentReference = `REF-${accountNumber}-${Date.now().toString().slice(-4)}`,
    daysRemaining = 3,
    isOverdue = false,
    schoolName,
    senderName = 'Finance & Bursar Office',
    customMessage,
  } = params;

  const urgencyTitle = isOverdue
    ? 'FINAL NOTICE: Tuition Fee Past Due'
    : 'URGENT: Upcoming Tuition Fee Deadline';

  const badgeColor = isOverdue ? '#dc2626' : '#ea580c';
  const badgeText = isOverdue ? 'CRITICAL / OVERDUE' : `ACTION REQUIRED (${daysRemaining} DAYS)`;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${schoolName} - ${urgencyTitle}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #0f172a; line-height: 1.6;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; padding: 32px 12px;">
    <tr>
      <td align="center">
        <table width="620" border="0" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.06); border: 1px solid #e2e8f0;">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 60%, #1d4ed8 100%); padding: 32px 30px; text-align: center;">
              <span style="display: inline-block; background-color: ${badgeColor}; color: #ffffff; font-size: 11px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; padding: 4px 12px; border-radius: 9999px; margin-bottom: 10px;">
                ${badgeText}
              </span>
              <h1 style="margin: 0; font-size: 24px; color: #ffffff; font-weight: 800; letter-spacing: 0.5px;">${schoolName}</h1>
              <p style="margin: 6px 0 0 0; font-size: 13px; color: #bfdbfe; font-weight: 500;">
                Office of the Bursar &bull; Tuition Billing & Financial Records
              </p>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 32px 34px;">
              <p style="font-size: 15px; margin: 0 0 16px 0; color: #1e293b; font-weight: 600;">
                Dear ${recipientName},
              </p>
              
              <p style="font-size: 14px; margin: 0 0 20px 0; color: #334155; line-height: 1.6;">
                ${customMessage || `This is an urgent financial notification regarding the outstanding tuition fee balance for your enrolled scholar, <strong>${studentName}</strong> (Grade ${grade}). To ensure uninterrupted academic services and exam clearance, settlement must be finalized immediately.`}
              </p>

              <!-- Outstanding Invoice Highlight Box -->
              <div style="background-color: #f8fafc; border: 2px solid ${isOverdue ? '#fca5a5' : '#fed7aa'}; border-radius: 14px; padding: 22px; margin: 0 0 24px 0;">
                <table width="100%" border="0" cellspacing="0" cellpadding="6">
                  <tr>
                    <td width="42%" style="font-size: 12px; color: #64748b; font-weight: 600; text-transform: uppercase;">Scholar Name:</td>
                    <td style="font-size: 14px; color: #0f172a; font-weight: 700;">${studentName}</td>
                  </tr>
                  <tr>
                    <td style="font-size: 12px; color: #64748b; font-weight: 600; text-transform: uppercase;">Student Account ID:</td>
                    <td style="font-size: 14px; color: #2563eb; font-weight: 800; font-family: monospace;">${accountNumber}</td>
                  </tr>
                  <tr>
                    <td style="font-size: 12px; color: #64748b; font-weight: 600; text-transform: uppercase;">Fee Classification:</td>
                    <td style="font-size: 13px; color: #1e293b; font-weight: 600;">${invoiceTitle}</td>
                  </tr>
                  <tr>
                    <td style="font-size: 12px; color: #64748b; font-weight: 600; text-transform: uppercase;">Payment Due Date:</td>
                    <td style="font-size: 13px; color: ${isOverdue ? '#dc2626' : '#c2410c'}; font-weight: 800;">
                      ${dueDate} ${isOverdue ? '(OVERDUE)' : ''}
                    </td>
                  </tr>
                </table>

                <!-- Amount Callout -->
                <div style="margin-top: 16px; padding: 14px; background-color: #ffffff; border-radius: 10px; border: 1px solid #e2e8f0; text-align: center;">
                  <span style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #64748b; font-weight: 700; display: block;">
                    Total Outstanding Amount
                  </span>
                  <span style="font-size: 32px; font-weight: 900; color: #0f172a; font-family: monospace;">
                    ${amount.toLocaleString()} <span style="font-size: 18px; font-weight: 700; color: #059669;">ETB</span>
                  </span>
                </div>
              </div>

              <!-- CBE & Bank Instructions -->
              <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 20px; margin: 0 0 24px 0;">
                <h4 style="margin: 0 0 10px 0; font-size: 13px; font-weight: 800; color: #166534; text-transform: uppercase; letter-spacing: 0.5px;">
                  Bank Deposit & Mobile Banking Protocol:
                </h4>
                
                <table width="100%" border="0" cellspacing="0" cellpadding="4" style="font-size: 12px; color: #14532d;">
                  <tr>
                    <td width="35%" style="font-weight: 700;">Designated Bank:</td>
                    <td>Commercial Bank of Ethiopia (CBE) / Awash Bank</td>
                  </tr>
                  <tr>
                    <td style="font-weight: 700;">Account Name:</td>
                    <td>Oskar Academy Institutional Operating Account</td>
                  </tr>
                  <tr>
                    <td style="font-weight: 700;">Bank Account No:</td>
                    <td style="font-family: monospace; font-weight: 800; font-size: 13px; color: #047857;">1000289104412</td>
                  </tr>
                  <tr>
                    <td style="font-weight: 700;">Telebirr / CBE Birr:</td>
                    <td style="font-family: monospace; font-weight: 700;">Code: OSKAR-EDU-99</td>
                  </tr>
                  <tr>
                    <td style="font-weight: 700; color: #b91c1c;">Mandatory Remark:</td>
                    <td style="font-family: monospace; font-weight: 800; color: #b91c1c;">
                      ${accountNumber} (${studentName.split(' ')[0]})
                    </td>
                  </tr>
                </table>

                <p style="margin: 12px 0 0 0; font-size: 11px; color: #166534; line-height: 1.5; border-top: 1px dashed #86efac; padding-top: 8px;">
                  ⚠️ <em>Crucial:</em> You MUST include student account number <strong>${accountNumber}</strong> on your bank slip or mobile transfer description to facilitate automatic bank statement cross-checking.
                </p>
              </div>

              <!-- Upload instructions -->
              <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 14px 18px; border-radius: 8px; margin: 0 0 24px 0;">
                <p style="margin: 0 0 4px 0; font-size: 12px; font-weight: 700; color: #1e40af;">
                  Instant Digital Receipt Clearance:
                </p>
                <p style="margin: 0; font-size: 12px; color: #1d4ed8; line-height: 1.5;">
                  Once paid, log into the Parent Portal and upload a photo or PDF of your bank deposit slip. Our automated reconciliation system will verify the transaction and generate your official stamped watermarked receipt.
                </p>
              </div>

              <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b;">
                <p style="margin: 0; font-weight: 700; color: #1e293b;">${senderName}</p>
                <p style="margin: 2px 0 0 0;">Bursar & Financial Controller</p>
                <p style="margin: 2px 0 0 0;">${schoolName}</p>
              </div>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f1f5f9; padding: 18px 24px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0; font-size: 11px; color: #94a3b8;">
                Dispatched via Google Workspace Gmail API integration &bull; ${schoolName} Institutional Finance
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
}

/**
 * Dispatches a Disciplinary Hearing parent alert email via Gmail REST API
 */
export async function sendDisciplinaryHearingEmailViaGmail(
  params: DisciplinaryHearingEmailParams
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const subject = `${params.schoolName} - Disciplinary Hearing Notice: ${params.studentName} (${params.studentId})`;
  const htmlBody = generateDisciplinaryHearingEmailHtml(params);

  return sendRawHtmlEmailViaGmail({
    recipientEmail: params.recipientEmail,
    subject,
    htmlBody,
    senderName: params.senderName || `${params.schoolName} Disciplinary Board`,
  });
}

/**
 * Dispatches an Urgent Fee Deadline parent alert email via Gmail REST API
 */
export async function sendUrgentFeeDeadlineEmailViaGmail(
  params: UrgentFeeDeadlineEmailParams
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const urgencyLabel = params.isOverdue ? 'FINAL NOTICE: Tuition Past Due' : 'URGENT: Fee Deadline Alert';
  const subject = `${params.schoolName} - ${urgencyLabel}: ${params.studentName} (${params.accountNumber})`;
  const htmlBody = generateUrgentFeeDeadlineEmailHtml(params);

  return sendRawHtmlEmailViaGmail({
    recipientEmail: params.recipientEmail,
    subject,
    htmlBody,
    senderName: params.senderName || `${params.schoolName} Bursar Office`,
  });
}

/**
 * Batch dispatches urgent fee alerts to parents of specified invoices
 */
export async function sendBatchUrgentFeeEmailsViaGmail(
  invoicesToSend: Array<{
    invoice: Invoice;
    parentEmail: string;
    parentName: string;
    schoolName: string;
    senderName?: string;
  }>
): Promise<{
  total: number;
  successful: number;
  failed: number;
  results: Array<{
    invoiceId: string;
    studentName: string;
    recipientEmail: string;
    success: boolean;
    messageId?: string;
    error?: string;
  }>;
}> {
  const results = [];
  let successful = 0;
  let failed = 0;

  for (const item of invoicesToSend) {
    try {
      const res = await sendUrgentFeeDeadlineEmailViaGmail({
        recipientEmail: item.parentEmail,
        recipientName: item.parentName,
        studentName: item.invoice.studentName,
        studentId: item.invoice.studentId,
        grade: item.invoice.grade,
        accountNumber: item.invoice.accountNumber,
        invoiceTitle: item.invoice.title,
        amount: item.invoice.amount,
        dueDate: item.invoice.dueDate,
        paymentReference: item.invoice.paymentReference,
        isOverdue: new Date(item.invoice.dueDate) < new Date(),
        schoolName: item.schoolName,
        senderName: item.senderName,
      });

      successful++;
      results.push({
        invoiceId: item.invoice.id,
        studentName: item.invoice.studentName,
        recipientEmail: item.parentEmail,
        success: true,
        messageId: res.messageId,
      });
    } catch (err: any) {
      failed++;
      results.push({
        invoiceId: item.invoice.id,
        studentName: item.invoice.studentName,
        recipientEmail: item.parentEmail,
        success: false,
        error: err?.message || 'Failed to dispatch via Gmail',
      });
    }
  }

  return {
    total: invoicesToSend.length,
    successful,
    failed,
    results,
  };
}
