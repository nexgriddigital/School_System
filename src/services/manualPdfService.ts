import { jsPDF } from 'jspdf';

export interface ManualPdfOptions {
  schoolName: string;
  generatedBy?: string;
}

export function generateInstructionsManualPdf({ schoolName, generatedBy = 'NexGrid Digital Systems' }: ManualPdfOptions) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 40;
  const contentWidth = pageWidth - margin * 2;

  const primaryColor = [11, 25, 44]; // #0B192C Navy
  const accentColor = [30, 62, 98];  // #1E3E62
  const brandBlue = [37, 99, 235];   // #2563EB Blue 600
  const slateDark = [30, 41, 59];    // #1E293B
  const slateMuted = [100, 116, 139];// #64748B
  const borderLight = [226, 232, 240];

  // Helper to draw NexGrid Digital Systems Letterhead on EVERY page
  const drawLetterhead = (pageNumber: number, totalPagesPlaceholder = 9) => {
    // Top colored indicator bars
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(0, 0, pageWidth, 6, 'F');
    doc.setFillColor(brandBlue[0], brandBlue[1], brandBlue[2]);
    doc.rect(margin, 6, 120, 2, 'F');

    // Letterhead Header Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text('NEXGRID DIGITAL SYSTEMS', margin, 24);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(slateMuted[0], slateMuted[1], slateMuted[2]);
    doc.text('Enterprise Digital Infrastructure & Educational Systems Architecture', margin, 34);

    // Right Header Metadata
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
    doc.text('DOCUMENT ID: NDS-SIS-MAN-2026', pageWidth - margin, 24, { align: 'right' });
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(slateMuted[0], slateMuted[1], slateMuted[2]);
    doc.text(`System: ${schoolName} SIS | Version: 2.4 Production`, pageWidth - margin, 34, { align: 'right' });

    // Divider Line
    doc.setDrawColor(borderLight[0], borderLight[1], borderLight[2]);
    doc.setLineWidth(1);
    doc.line(margin, 42, pageWidth - margin, 42);

    // Watermark line at the bottom
    doc.setDrawColor(borderLight[0], borderLight[1], borderLight[2]);
    doc.line(margin, pageHeight - 32, pageWidth - margin, pageHeight - 32);

    // Letterhead Footer (MANDATORY ON EACH PAGE)
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(brandBlue[0], brandBlue[1], brandBlue[2]);
    doc.text('Designed and Developed by NexGrid Digital Systems', margin, pageHeight - 18);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(slateMuted[0], slateMuted[1], slateMuted[2]);
    doc.text('Confidential & Proprietary • Customer Presentation Copy', margin + 225, pageHeight - 18);

    doc.setFont('helvetica', 'bold');
    doc.text(`Page ${pageNumber}`, pageWidth - margin, pageHeight - 18, { align: 'right' });
  };

  // Helper for Section Headings
  const addSectionHeader = (y: number, title: string, subtitle: string) => {
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(margin, y, contentWidth, 38, 4, 4, 'F');
    doc.setDrawColor(brandBlue[0], brandBlue[1], brandBlue[2]);
    doc.setLineWidth(2.5);
    doc.line(margin, y, margin, y + 38);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text(title, margin + 12, y + 16);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(slateMuted[0], slateMuted[1], slateMuted[2]);
    doc.text(subtitle, margin + 12, y + 29);

    return y + 50;
  };

  // Helper for content blocks
  const addContentCard = (y: number, heading: string, bodyText: string, bulletPoints: string[] = []) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(slateDark[0], slateDark[1], slateDark[2]);
    doc.text(heading, margin, y);

    let curY = y + 12;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(71, 85, 105);

    const splitBody = doc.splitTextToSize(bodyText, contentWidth);
    doc.text(splitBody, margin, curY);
    curY += splitBody.length * 11 + 4;

    bulletPoints.forEach((bullet) => {
      doc.setFillColor(brandBlue[0], brandBlue[1], brandBlue[2]);
      doc.circle(margin + 5, curY - 3, 2, 'F');
      const splitBullet = doc.splitTextToSize(bullet, contentWidth - 16);
      doc.text(splitBullet, margin + 14, curY);
      curY += splitBullet.length * 11 + 3;
    });

    return curY + 8;
  };

  // ==========================================
  // PAGE 1: COVER & EXECUTIVE SUMMARY
  // ==========================================
  drawLetterhead(1);

  // Big Banner
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.roundedRect(margin, 60, contentWidth, 115, 8, 8, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(255, 255, 255);
  doc.text(schoolName.toUpperCase(), margin + 20, 95);

  doc.setFontSize(13);
  doc.setTextColor(147, 197, 253); // light blue
  doc.text('Enterprise School Management System (SIS)', margin + 20, 116);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(226, 232, 240);
  doc.text('Comprehensive Operational Blueprint, User Manual & Governance Guidelines', margin + 20, 134);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(253, 224, 71); // amber
  doc.text('★ Designed and Developed by NexGrid Digital Systems', margin + 20, 155);

  let p1Y = 195;
  p1Y = addSectionHeader(p1Y, 'Executive Introduction', 'Unified Multi-Stakeholder School Architecture');
  p1Y = addContentCard(
    p1Y,
    'System Mission & Capabilities',
    'The Oskar Academy SIS is an institutional-grade educational administration ecosystem designed by NexGrid Digital Systems to seamlessly connect academic, financial, administrative, and pastoral functions into a unified, secure platform.',
    [
      'Multi-Stakeholder Portals: Registrar, Finance, Program Office, Principal, Counsellor, Teachers, Students & Parents.',
      'Grade-Level Compliance: Tailored document validation workflows spanning Pre-K through Grade 12.',
      'Automated Bank Cross-Checking: Intelligent statement matching for fee payments with instant discrepancy flags.',
      '15-Day Stream Change Enforcement: Algorithmic validation preventing unauthorized stream hops past policy deadlines.',
      'Digital Credentialing: Automated issuance of official student ID cards with embedded cryptographic QR verification.'
    ]
  );

  p1Y = addContentCard(
    p1Y,
    'Document Structure & Target Audience',
    'This manual serves as the comprehensive operating standard for institutional operators, system administrators, and school leadership during presentation, staging, and live production deployment.',
    [
      'Section 1: Architecture, Authentication & Multi-Factor Gmail OTP Service',
      'Section 2: Admissions Office & Document Verification Engine',
      'Section 3: Finance Office & Bank Statement Cross-Checking',
      'Section 4: Program Office & Capacity Planning',
      'Section 5: Executive Office (Principal Approvals & Analytics)',
      'Section 6: Pastoral Care, Discipline & Counselling',
      'Section 7: Faculty, Student & Parent Ecosystems',
      'Section 8: Terms of Service, Privacy & Support SLA'
    ]
  );

  // ==========================================
  // PAGE 2: AUTHENTICATION & SECURITY
  // ==========================================
  doc.addPage();
  drawLetterhead(2);

  let p2Y = 60;
  p2Y = addSectionHeader(p2Y, 'Section 1: Security & Identity Governance', 'Role-Based Access Control (RBAC) & Gmail OTP Verification');

  p2Y = addContentCard(
    p2Y,
    '1.1 Role-Based Access Control Architecture',
    'Every stakeholder in the institution is bound to a strict Role-Based Access Control matrix. Access privileges are checked on every view and data action to guarantee total institutional isolation.',
    [
      'Admissions & Registrar: Student registration, document review, acceptance/rejection, official ID card generation.',
      'Finance Office: Tuition fee configuration, waiver approvals, invoice generation, bank cross-checking, receipt printing.',
      'Program Office: Section capacity monitoring (max 30 students per room), automated stream and room allocations.',
      'Principal: Executive oversight, stream change authorization, faculty leave approvals, institutional analytics.',
      'Counsellor: Behavioral incident logging, confidential pastoral records, merit recognition, parent conference notes.',
      'Faculty / Homeroom Teachers: Attendance roll-call, continuous assessment marksheets, personal leave submissions.',
      'Students & Parents: Grade report cards, tuition balances, digital student IDs, and real-time announcements.'
    ]
  );

  p2Y = addContentCard(
    p2Y,
    '1.2 Principal Mastercode Registration & User Provisioning Lifecycle',
    'To guarantee supreme institutional integrity, account creation follows a strict hierarchical protocol:',
    [
      'Principal Mastercode Gateway: Registration for the School Principal is strictly gated by an exclusive institutional master authorization key. No other user can register a Principal account without this confidential cryptographic key.',
      'Principal-Led User Creation: Users other than the Principal are created exclusively by the Principal. Once details (Email, Position, Role, Department) are submitted, the system automatically creates a secure Temporary Password.',
      'Automated Gmail Dispatch: The temporary credentials and portal guidelines are automatically emailed to the new user via the connected Google Workspace Gmail service.',
      'Mandatory Password Change on First Login: Newly provisioned users are flagged with mandatory first-login password update. Upon entering their temporary credentials and verifying their Gmail OTP, they are required to set their permanent password before accessing their dashboard.'
    ]
  );

  p2Y = addContentCard(
    p2Y,
    '1.3 Strict Gmail OTP Multi-Factor Authentication',
    'All system access is strictly authenticated through Multi-Factor Authentication via live Gmail OTP:',
    [
      'Live OTP Delivery: Instant 6-digit cryptographic verification codes are sent directly to the user\'s registered Gmail inbox.',
      'Volatile Token Memory: OAuth access tokens and credentials are held exclusively in volatile runtime memory.',
      'Anti-Tamper Audit Trail: All authentication attempts, code dispatches, and password updates maintain immutable audit stamps.'
    ]
  );

  // ==========================================
  // PAGE 3: ADMISSIONS & REGISTRAR
  // ==========================================
  doc.addPage();
  drawLetterhead(3);

  let p3Y = 60;
  p3Y = addSectionHeader(p3Y, 'Section 2: Admissions & Registrar Portal', 'Grade-Specific Document Verification & Automated ID Issuance');

  p3Y = addContentCard(
    p3Y,
    '2.1 Grade-Specific Verification Rules',
    'The admissions engine automatically dynamically adjusts mandatory documentation requirements based on the applicant’s applied grade level:',
    [
      'Pre-Kindergarten & Kindergarten: Mandatory Birth Certificate + Immunization/Clinic Card.',
      'Primary School (Grades 1-8): Mandatory Birth Certificate + Immunization Card + Previous Grade Report Card.',
      'High School (Grades 9-10 General): Mandatory Birth Certificate + Grade 8 Official Regional Certificate + Academic Transcript.',
      'Senior High (Grades 11-12 Natural/Social): Mandatory National Grade 10 Exam Certificate + Official Transfer Letter + Transcript.'
    ]
  );

  p3Y = addContentCard(
    p3Y,
    '2.2 Verification & Acceptance Lifecycle',
    'When an applicant submits their portfolio, the Registrar reviews each document in the built-in Document Viewer modal. Registrars can verify each file with one click, approve the applicant, or flag discrepancies with written rejection reasons.',
    [
      'Status Progression: Submitted -> Documents Under Review -> Verified / Incomplete -> Enrolled.',
      'Automatic Student ID Generation: Once approved, the system automatically assigns an official student identification number formatted as OSK-YYYY-XXXX (e.g. OSK-2026-0901).',
      'Account Number Assignment: A linked banking account number (e.g. OSK-ACC-101) is created to track fee reconciliation.'
    ]
  );

  p3Y = addContentCard(
    p3Y,
    '2.3 Digital Student Identification Cards',
    'Approved students receive a printable, high-resolution Digital Student ID card complete with student photo, grade level, stream, homeroom section, date of birth, emergency contact numbers, and a cryptographic QR verification badge.'
  );

  // ==========================================
  // PAGE 4: FINANCE & RECONCILIATION
  // ==========================================
  doc.addPage();
  drawLetterhead(4);

  let p4Y = 60;
  p4Y = addSectionHeader(p4Y, 'Section 3: Finance Office Operations', 'Tuition Management, Fee Waivers & Bank Reconciliation Engine');

  p4Y = addContentCard(
    p4Y,
    '3.1 Tuition Fee Structures & Payment Schedules',
    'Finance officers oversee real-time fee tracking across all educational divisions:',
    [
      'Kindergarten / Early Years: Annual tuition ETB 45,000 (Installments: Term 1, Term 2, Term 3).',
      'Primary School (Grades 1-8): Annual tuition ETB 55,000.',
      'High School (Grades 9-12): Annual tuition ETB 65,000 to ETB 72,000 (inclusive of laboratory and science fees).',
      'Specialized Fees: Registration fee (ETB 3,000 non-refundable), bus transport, uniform package, and extracurriculars.'
    ]
  );

  p4Y = addContentCard(
    p4Y,
    '3.2 Automated Bank Statement Cross-Checking',
    'The cornerstone of the NexGrid Digital SIS Finance module is the Bulk Bank Statement Cross-Checking Engine:',
    [
      'Multi-Bank Statement Import: Upload statements from Commercial Bank of Ethiopia (CBE), Awash Bank, Dashen Bank, and Telebirr.',
      'Automated Transaction Matching: Matches deposit records against student account numbers, student IDs, and depositor names.',
      'Confidence Scoring: Highlights matched deposits (100% confidence) for 1-click batch reconciliation.',
      'Discrepancy Resolution: Flags unallocated deposits, partial payments, and duplicate reference numbers for audit inspection.',
      'Audit Trail: Generates immutable timestamps, teller references, and cross-checking logs.'
    ]
  );

  p4Y = addContentCard(
    p4Y,
    '3.3 Scholarships, Waivers & Stamped Receipts',
    'The Finance Office handles tuition assistance waivers (Merit, Staff Child, Need-Based). Upon confirmation of payment, the system generates an official, printable PDF receipt with institutional seal, QR validation, and watermark.'
  );

  // ==========================================
  // PAGE 5: PROGRAM OFFICE & CAPACITY PLANNING
  // ==========================================
  doc.addPage();
  drawLetterhead(5);

  let p5Y = 60;
  p5Y = addSectionHeader(p5Y, 'Section 4: Program Office & Section Capacity', 'Automated Class Sizing, Stream Allocation & Timetable Logic');

  p5Y = addContentCard(
    p5Y,
    '4.1 Classroom Capacity Guardrails (Max 30 Students)',
    'To guarantee educational excellence and safe student-to-teacher ratios, the SIS enforces a hard ceiling of 30 students per classroom section.',
    [
      'Live Capacity Indicators: Displays active enrollment counts (e.g. 28/30 - 93% Full) with color-coded alert badges.',
      'Automated Overflow Routing: When Section A hits 30 students, the system automatically redirects incoming enrollments to Section B.',
      'Waitlist & Partitioning: Provides program officers with 1-click tools to spin up new homeroom sections when demand spikes.'
    ]
  );

  p5Y = addContentCard(
    p5Y,
    '4.2 Senior Stream Allocation (Grades 11-12)',
    'The Program Office governs student placement into specialized national curricular streams:',
    [
      'Natural Sciences Stream: Advanced Physics, Chemistry, Biology, Technical Drawing, and Calculus.',
      'Social Sciences Stream: Economics, Geography, History, General Business, and Applied Mathematics.',
      'Cut-Off Eligibility Matrix: Automatically computes placement eligibility based on Grade 10 National Assessment averages.'
    ]
  );

  p5Y = addContentCard(
    p5Y,
    '4.3 Master Timetabling & Room Utilization',
    'Tracks room allocations across laboratory blocks, computer centers, and general lecture halls to eliminate double-booking conflicts.'
  );

  // ==========================================
  // PAGE 6: PRINCIPAL EXECUTIVE APPROVALS
  // ==========================================
  doc.addPage();
  drawLetterhead(6);

  let p6Y = 60;
  p6Y = addSectionHeader(p6Y, 'Section 5: Principal Executive Operations', 'Strict 15-Day Stream Change Policy & Faculty Governance');

  p6Y = addContentCard(
    p6Y,
    '5.1 Strict 15-Day Stream Change Policy',
    'A vital institutional regulation enforced by the Oskar Academy SIS is the 15-Day Stream Change Protocol for Grade 11 & 12 scholars:',
    [
      'The 15-Day Rule: All stream transfer petitions must be officially submitted within the first 15 calendar days of the academic term.',
      'Automated Deadline Calculator: Shows exact remaining days (e.g. "8 Days Remaining Before Cutoff"). Requests filed on Day 16+ are automatically rejected as Ineligible by System Policy.',
      'Three-Tier Review Workflow: Requires review of Grade 10 marks, counsellor recommendation note, and final Principal digital sign-off.',
      'Audit Record: Approvals automatically synchronize with student transcripts, homeroom rosters, and billing brackets.'
    ]
  );

  p6Y = addContentCard(
    p6Y,
    '5.2 Faculty Leave Management',
    'The Principal portal provides executive oversight over faculty absence requests (Personal, Medical, Maternity, Academic Development), complete with substitute teacher assignments to prevent instructional downtime.'
  );

  p6Y = addContentCard(
    p6Y,
    '5.3 Real-Time Institutional KPI Dashboards',
    'Aggregates school-wide metrics including total enrollment, gender ratios, daily attendance rates, tuition collection velocity, and academic grade bell curves.'
  );

  // ==========================================
  // PAGE 7: PASTORAL CARE & DISCIPLINE
  // ==========================================
  doc.addPage();
  drawLetterhead(7);

  let p7Y = 60;
  p7Y = addSectionHeader(p7Y, 'Section 6: Counsellor & Pastoral Care', 'Student Welfare, Disciplinary Tracking & Parent Conferences');

  p7Y = addContentCard(
    p7Y,
    '6.1 Holistic Student Welfare Model',
    'The Counsellor portal balances disciplinary interventions with positive reinforcement to build a supportive academic environment:',
    [
      'Merit & Recognition Logging: Honors student leadership, peer tutoring, athletic achievements, and community service.',
      'Behavioral Incident Tracking: Categorizes infractions (Tardiness, Classroom Disruption, Uniform Violations, Academic Dishonesty) with severity ratings (Low, Medium, Critical).',
      'Restorative Intervention Plans: Tracks assigned counselling sessions, behavioral contracts, and reflective assignments.'
    ]
  );

  p7Y = addContentCard(
    p7Y,
    '6.2 Parent-Teacher Conferences & Case Notes',
    'Allows counsellors to schedule formal guardian meetings, attach confidential case notes, and log agreed parent intervention strategies with cryptographic privacy controls.'
  );

  // ==========================================
  // PAGE 8: FACULTY, STUDENTS & PARENTS
  // ==========================================
  doc.addPage();
  drawLetterhead(8);

  let p8Y = 60;
  p8Y = addSectionHeader(p8Y, 'Section 7: Faculty, Student & Parent Ecosystems', 'Classroom Workspaces, Gradebooks & Family Portals');

  p8Y = addContentCard(
    p8Y,
    '7.1 Teachers Portal & Assessment Gradebook',
    'Homeroom and subject teachers utilize an intuitive marksheet to manage continuous assessments (Quizzes 20%, Mid-Term 30%, Final Exam 50%), calculate letter grades, and submit homeroom attendance with 1-click status toggles.'
  );

  p8Y = addContentCard(
    p8Y,
    '7.2 Student Scholar Portal',
    'Students access a personalized digital dashboard featuring their current GPA, subject breakdowns, interactive weekly class timetable, attendance percentage, and their printable Digital ID Card.'
  );

  p8Y = addContentCard(
    p8Y,
    '7.3 Parent / Guardian Portal',
    'Empowers parents to monitor their child’s progress in real-time, view verified attendance logs, check tuition billing balances, and receive instant institutional SMS/Email notifications.'
  );

  // ==========================================
  // PAGE 9: TERMS, GOVERNANCE & SLA
  // ==========================================
  doc.addPage();
  drawLetterhead(9);

  let p9Y = 60;
  p9Y = addSectionHeader(p9Y, 'Section 8: Terms, Governance & NexGrid Digital SLA', 'Intellectual Property, Data Privacy & Technical Support');

  p9Y = addContentCard(
    p9Y,
    '8.1 Intellectual Property & Development Attribution',
    'The Oskar Academy School Management System (SIS) was Designed and Developed by NexGrid Digital Systems. All proprietary architecture, algorithmic matching modules, UI layouts, and integration codebases are protected under international copyright and enterprise software licensing treaties.'
  );

  p9Y = addContentCard(
    p9Y,
    '8.2 Student Data Privacy & FERPA Compliance',
    'NexGrid Digital Systems implements strict data privacy principles adhering to international education data privacy frameworks. Student records, financial transactions, and pastoral files are encrypted at rest and in transit.'
  );

  p9Y = addContentCard(
    p9Y,
    '8.3 Enterprise Support & Service Level Agreement (SLA)',
    'NexGrid Digital Systems provides enterprise clients with guaranteed 99.9% uptime SLA, automated hourly cloud backups, and 24/7 emergency infrastructure incident response.',
    [
      'Technical Support Desk: support@nexgrid.digital',
      'Executive Hotline: +251 91 100 2244 / +251 11 667 8899',
      'Client Presentation Edition: Staged for Oskar Academy Board of Directors review.'
    ]
  );

  // Return generated doc
  return doc;
}

export function downloadInstructionsManualPdf(schoolName: string) {
  const doc = generateInstructionsManualPdf({ schoolName });
  doc.save(`${schoolName.replace(/\s+/g, '_')}_Instructions_Manual_NexGrid_Digital.pdf`);
}
