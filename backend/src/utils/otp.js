import logger from './logger.js';

const otpStore = new Map();

export const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

export const storeOTP = (email, data) => {
  otpStore.set(email.toLowerCase(), {
    ...data,
    expires: Date.now() + 10 * 60 * 1000, // 10 min
  });
};

export const verifyOTP = (email, otp) => {
  const entry = otpStore.get(email.toLowerCase());
  if (!entry)              return { valid: false, message: 'OTP not found. Please request a new code.' };
  if (Date.now() > entry.expires) {
    otpStore.delete(email.toLowerCase());
    return { valid: false, message: 'OTP expired. Please request a new code.' };
  }
  if (entry.otp !== otp.toString()) return { valid: false, message: 'Invalid OTP. Please try again.' };
  otpStore.delete(email.toLowerCase());
  return { valid: true, data: entry };
};

export const sendOTPEmail = async (email, name, otp) => {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASSWORD;

  // If email not configured — log OTP to console so dev can test
  if (!user || user === 'your-gmail@gmail.com' || !pass) {
    logger.warn(`⚠️  Email not configured. OTP for ${email} is: ${otp}`);
    console.log(`\n🔐 OTP for ${email}: ${otp}\n`);
    return;
  }

  try {
    const nodemailer = (await import('nodemailer')).default;

    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, // TLS
      auth: { user, pass },
      tls: { rejectUnauthorized: false },
    });

    // Verify connection first
    await transporter.verify();

    await transporter.sendMail({
      from: `"TravelHub" <${user}>`,
      to: email,
      subject: `${otp} is your TravelHub verification code`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;padding:32px;background:#f8fafc;border-radius:16px">
          <h2 style="color:#1e3a5f;margin-bottom:8px">Welcome to TravelHub, ${name}! ✈️</h2>
          <p style="color:#64748b;font-size:15px">Use the code below to verify your account:</p>
          <div style="background:#fff;border:2px solid #e2e8f0;border-radius:12px;padding:24px;text-align:center;margin:24px 0">
            <p style="font-size:40px;font-weight:900;letter-spacing:12px;color:#1e3a5f;margin:0">${otp}</p>
          </div>
          <p style="color:#94a3b8;font-size:13px">This code expires in <strong>10 minutes</strong>.</p>
          <p style="color:#94a3b8;font-size:13px">If you didn't request this, ignore this email.</p>
        </div>
      `,
      text: `Your TravelHub verification code is: ${otp}\nExpires in 10 minutes.`,
    });

    logger.info(`✅ OTP sent to ${email}`);
  } catch (err) {
    logger.error(`❌ OTP email failed for ${email}: ${err.message}`);
    // Log OTP to console as fallback so user isn't stuck
    console.log(`\n🔐 OTP email failed. OTP for ${email} is: ${otp}\n`);
  }
};