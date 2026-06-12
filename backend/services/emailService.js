// backend/services/emailService.js
// Email notifications via SMTP. Configure in .env:
//   SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, EMAIL_FROM, APP_URL
// If SMTP_HOST is not set, every send becomes a silent no-op so the
// app works fine without email configured.
const nodemailer = require('nodemailer');

let transporter = null;
const isConfigured = () => !!process.env.SMTP_HOST;

const getTransporter = () => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
  }
  return transporter;
};

const send = async ({ to, subject, html }) => {
  if (!isConfigured() || !to) return false;
  try {
    await getTransporter().sendMail({
      from: process.env.EMAIL_FROM || process.env.SMTP_USER,
      to,
      subject,
      html,
    });
    return true;
  } catch (err) {
    // Never let a failed notification break the main request
    console.error('Email send failed:', err.message);
    return false;
  }
};

const appUrl = () => process.env.APP_URL || 'http://localhost:5173';

const wrap = (body) => `
  <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;color:#1e293b">
    <div style="font-size:20px;font-weight:bold;color:#4f46e5;margin-bottom:16px">⚡ AI ContractKit</div>
    ${body}
    <p style="font-size:12px;color:#94a3b8;margin-top:24px">Powered by AI ContractKit · Secure &amp; Legally Binding</p>
  </div>`;

// Contract sent to a client for review/signature
const sendContractToClient = ({ clientEmail, clientName, contractTitle, senderName, publicToken }) =>
  send({
    to: clientEmail,
    subject: `${senderName} sent you a contract: ${contractTitle}`,
    html: wrap(`
      <p>Hi ${clientName || 'there'},</p>
      <p><strong>${senderName}</strong> has sent you a contract to review and sign:</p>
      <p style="font-size:16px;font-weight:bold">${contractTitle}</p>
      <p><a href="${appUrl()}/contract/public/${publicToken}"
            style="display:inline-block;background:#4f46e5;color:white;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:bold">
        Review &amp; Sign Contract</a></p>`),
  });

// Client added a change request — notify the freelancer
const notifyCommentAdded = ({ ownerEmail, contractTitle, contractId, note }) =>
  send({
    to: ownerEmail,
    subject: `New change request on "${contractTitle}"`,
    html: wrap(`
      <p>Your client requested a change on <strong>${contractTitle}</strong>:</p>
      <blockquote style="border-left:3px solid #e2e8f0;margin:12px 0;padding:8px 16px;color:#475569">${note}</blockquote>
      <p><a href="${appUrl()}/contracts/${contractId}"
            style="display:inline-block;background:#4f46e5;color:white;padding:10px 24px;border-radius:8px;text-decoration:none;font-weight:bold">
        Open Negotiation Table</a></p>`),
  });

// Contract was signed — notify the freelancer
const notifyContractSigned = ({ ownerEmail, contractTitle, contractId, signerName }) =>
  send({
    to: ownerEmail,
    subject: `🎉 "${contractTitle}" was signed by ${signerName}`,
    html: wrap(`
      <p>Great news — <strong>${signerName}</strong> just signed <strong>${contractTitle}</strong>.</p>
      <p><a href="${appUrl()}/contracts/${contractId}"
            style="display:inline-block;background:#16a34a;color:white;padding:10px 24px;border-radius:8px;text-decoration:none;font-weight:bold">
        View Signed Contract</a></p>`),
  });

module.exports = { isConfigured, sendContractToClient, notifyCommentAdded, notifyContractSigned };
