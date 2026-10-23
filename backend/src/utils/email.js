import nodemailer from 'nodemailer';
import logger from './logger.js';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export const sendBookingConfirmation = async (to, bookingDetails) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject: 'Booking Confirmation - TravelHub',
      html: `
        <h2>Booking Confirmed!</h2>
        <p>Dear ${bookingDetails.customerName},</p>
        <p>Your booking for <strong>${bookingDetails.packageTitle}</strong> has been confirmed.</p>
        <p><strong>Details:</strong></p>
        <ul>
          <li>Travel Date: ${new Date(bookingDetails.travelDate).toDateString()}</li>
          <li>Travelers: ${bookingDetails.numberOfTravelers}</li>
          <li>Total Price: $${bookingDetails.totalPrice}</li>
        </ul>
        <p>Thank you for choosing TravelHub!</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    logger.info(`Booking confirmation sent to ${to}`);
  } catch (error) {
    logger.error('Email send error:', error);
  }
};

export const sendCustomTripQuote = async (to, tripDetails) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject: 'Your Custom Trip Quote - TravelHub',
      html: `
        <h2>Custom Trip Quote</h2>
        <p>Dear ${tripDetails.customerName},</p>
        <p>We've received your custom trip request!</p>
        <p><strong>Trip Summary:</strong></p>
        <ul>
          <li>Destinations: ${tripDetails.destinations.map((d) => d.name).join(', ')}</li>
          <li>Estimated Price Range: $${tripDetails.minPrice} - $${tripDetails.maxPrice}</li>
          <li>Duration: ${tripDetails.totalDays} days</li>
        </ul>
        <p>Our team will contact you within 24 hours with a detailed quote.</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    logger.info(`Custom trip quote sent to ${to}`);
  } catch (error) {
    logger.error('Email send error:', error);
  }
};

export const sendAdminNotification = async (subject, message) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.ADMIN_EMAIL,
      subject,
      html: `<h2>${subject}</h2><p>${message}</p>`,
    };

    await transporter.sendMail(mailOptions);
    logger.info(`Admin notification sent: ${subject}`);
  } catch (error) {
    logger.error('Email send error:', error);
  }
};

export default { sendBookingConfirmation, sendCustomTripQuote, sendAdminNotification };
