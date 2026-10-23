import dotenv from 'dotenv';
dotenv.config();

const { EMAIL_USER, EMAIL_PASSWORD, ADMIN_EMAIL } = process.env;

console.log('EMAIL_USER:', EMAIL_USER);
console.log('EMAIL_PASSWORD length:', EMAIL_PASSWORD?.length);
console.log('Sending to:', ADMIN_EMAIL);

const nodemailer = (await import('nodemailer')).default;

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: { user: EMAIL_USER, pass: EMAIL_PASSWORD },
  tls: { rejectUnauthorized: false },
});

try {
  await transporter.verify();
  console.log('✅ SMTP connection verified');

  await transporter.sendMail({
    from: `"TravelHub" <${EMAIL_USER}>`,
    to: ADMIN_EMAIL,
    subject: 'TravelHub Email Test',
    text: 'If you see this, email is working correctly!',
  });
  console.log('✅ Test email sent to', ADMIN_EMAIL);
} catch (err) {
  console.error('❌ Error:', err.message);
  if (err.message.includes('Invalid login')) {
    console.log('\n👉 Fix: Generate new App Password at https://myaccount.google.com/apppasswords');
  }
  if (err.message.includes('Username and Password')) {
    console.log('\n👉 Fix: Make sure 2FA is enabled and you are using App Password not Gmail password');
  }
}
process.exit(0);