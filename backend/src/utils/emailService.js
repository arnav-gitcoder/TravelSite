import nodemailer from 'nodemailer';
import logger from '../utils/logger.js';

let transporter = null;

const getTransporter = () => {
  if (transporter) return transporter;

  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD ||
      process.env.EMAIL_USER === 'your-email@gmail.com') {
    logger.warn('Email service not configured — emails will be skipped');
    return null;
  }

  transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
  return transporter;
};

const send = async (options) => {
  const t = getTransporter();
  if (!t) return; // graceful no-op when email not configured
  try {
    await t.sendMail({ from: `"TravelHub Travel" <${process.env.EMAIL_USER}>`, ...options });
    logger.info(`Email sent to ${options.to} — "${options.subject}"`);
  } catch (err) {
    logger.error(`Email send error: ${err.message}`);
    // Never throw — email failure should not break the API response
  }
};

/* ── Booking confirmation to customer ── */
export const sendBookingConfirmation = async (booking) => {
  await send({
    to: booking.customerEmail,
    subject: `Booking Confirmed ✅ — ${booking.packageTitle}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto">
        <h2 style="color:#16a34a">Booking Confirmed!</h2>
        <p>Hi <strong>${booking.customerName}</strong>,</p>
        <p>Your booking has been received. Here's your summary:</p>
        <table style="width:100%;border-collapse:collapse">
          <tr><td style="padding:8px;border:1px solid #e5e7eb"><strong>Package</strong></td><td style="padding:8px;border:1px solid #e5e7eb">${booking.packageTitle}</td></tr>
          <tr><td style="padding:8px;border:1px solid #e5e7eb"><strong>Travel Date</strong></td><td style="padding:8px;border:1px solid #e5e7eb">${new Date(booking.travelDate).toDateString()}</td></tr>
          <tr><td style="padding:8px;border:1px solid #e5e7eb"><strong>Travelers</strong></td><td style="padding:8px;border:1px solid #e5e7eb">${booking.numberOfTravelers}</td></tr>
          <tr><td style="padding:8px;border:1px solid #e5e7eb"><strong>Total Price</strong></td><td style="padding:8px;border:1px solid #e5e7eb"><strong>$${booking.totalPrice}</strong></td></tr>
          ${booking.specialRequests ? `<tr><td style="padding:8px;border:1px solid #e5e7eb"><strong>Special Requests</strong></td><td style="padding:8px;border:1px solid #e5e7eb">${booking.specialRequests}</td></tr>` : ''}
        </table>
        <p style="margin-top:20px">Our team will be in touch within 24 hours. Thank you for choosing TravelHub!</p>
      </div>
    `,
  });
};

/* ── Booking alert to admin ── */
export const sendBookingAdminAlert = async (booking) => {
  await send({
    to: process.env.ADMIN_EMAIL,
    subject: `🆕 New Booking — ${booking.packageTitle}`,
    html: `
      <h2>New Booking Received</h2>
      <p><strong>Customer:</strong> ${booking.customerName} (${booking.customerEmail})</p>
      <p><strong>Phone:</strong> ${booking.customerPhone}</p>
      <p><strong>Package:</strong> ${booking.packageTitle}</p>
      <p><strong>Date:</strong> ${new Date(booking.travelDate).toDateString()}</p>
      <p><strong>Travelers:</strong> ${booking.numberOfTravelers}</p>
      <p><strong>Total Price:</strong> $${booking.totalPrice}</p>
      ${booking.specialRequests ? `<p><strong>Requests:</strong> ${booking.specialRequests}</p>` : ''}
    `,
  });
};

/* ── Custom package submitted — notify admin ── */
export const sendCustomPackageNotification = async (customPackage) => {
  const destList = customPackage.destinations
    .map((d) => `<li>${d.name} — ${d.days} days @ $${d.costPerDay}/day</li>`)
    .join('');

  await send({
    to: process.env.ADMIN_EMAIL,
    subject: `🗺️ New Custom Trip Request — ${customPackage.title}`,
    html: `
      <h2>New Custom Trip Request</h2>
      ${customPackage.customerName ? `<p><strong>From:</strong> ${customPackage.customerName} (${customPackage.customerEmail})</p>` : ''}
      ${customPackage.customerPhone ? `<p><strong>Phone:</strong> ${customPackage.customerPhone}</p>` : ''}
      <p><strong>Title:</strong> ${customPackage.title}</p>
      <p><strong>Destinations:</strong></p><ul>${destList}</ul>
      <p><strong>Travelers:</strong> ${customPackage.numberOfTravelers}</p>
      <p><strong>Total Days:</strong> ${customPackage.totalDays}</p>
      <p><strong>Estimated Price:</strong> $${customPackage.totalPrice}</p>
      ${customPackage.startDate ? `<p><strong>Start:</strong> ${new Date(customPackage.startDate).toDateString()}</p>` : ''}
      ${customPackage.specialRequests ? `<p><strong>Special Requests:</strong> ${customPackage.specialRequests}</p>` : ''}
    `,
  });
};

/* ── Custom package acknowledgment to customer ── */
export const sendCustomPackageAck = async (customPackage) => {
  if (!customPackage.customerEmail) return;
  const destNames = customPackage.destinations.map((d) => d.name).join(', ');
  await send({
    to: customPackage.customerEmail,
    subject: `We got your custom trip request! ✈️`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto">
        <h2 style="color:#7c3aed">Custom Trip Received!</h2>
        <p>Hi ${customPackage.customerName || 'Traveler'},</p>
        <p>We've received your custom trip request for <strong>${destNames}</strong>.</p>
        <p>Our team will review it and reach out within 24 hours with a personalised quote.</p>
        <p><strong>Trip Summary:</strong></p>
        <ul>
          ${customPackage.destinations.map((d) => `<li>${d.name} — ${d.days} days</li>`).join('')}
        </ul>
        <p><strong>Estimated Total: $${customPackage.totalPrice}</strong></p>
        <p>Thank you for choosing TravelHub! 🌍</p>
      </div>
    `,
  });
};

/* ── Contact form admin notification ── */
export const sendContactNotification = async ({ name, email, phone, message }) => {
  await send({
    to: process.env.ADMIN_EMAIL,
    subject: `📬 New Contact Form — ${name}`,
    html: `
      <h2>New Contact Form Submission</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      ${phone ? `<p><strong>Phone:</strong> ${phone}</p>` : ''}
      <p><strong>Message:</strong></p>
      <p>${message.replace(/\n/g, '<br>')}</p>
    `,
  });
};

/* ── Password reset ── */
export const sendPasswordReset = async (email, resetToken) => {
  const resetLink = `${process.env.FRONTEND_URL?.split(',')[0]}/reset-password?token=${resetToken}`;
  await send({
    to: email,
    subject: 'Password Reset — TravelHub',
    html: `
      <h2>Password Reset Request</h2>
      <p><a href="${resetLink}" style="background:#7c3aed;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none">Reset Password</a></p>
      <p>Link expires in 1 hour. If you didn't request this, ignore this email.</p>
    `,
  });
};

export const initEmailService = getTransporter; // kept for backward compat

export default {
  initEmailService,
  sendBookingConfirmation,
  sendBookingAdminAlert,
  sendCustomPackageNotification,
  sendCustomPackageAck,
  sendContactNotification,
  sendPasswordReset,
};