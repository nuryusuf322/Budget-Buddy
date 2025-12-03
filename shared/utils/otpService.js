const nodemailer = require('nodemailer');
const OTP = require('../../modules/auth/otp.model');

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Create email transporter
const createTransporter = () => {
  // Validate environment variables
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new Error('EMAIL_USER and EMAIL_PASS must be set in .env file');
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

// Send OTP email
const sendOTPEmail = async (email, otp) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Budget Buddy - OTP Verification',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #667eea;">Budget Buddy - OTP Verification</h2>
          <p>Your OTP code for login is:</p>
          <div style="background-color: #f0f0f0; padding: 20px; text-align: center; margin: 20px 0;">
            <h1 style="color: #667eea; margin: 0; font-size: 32px; letter-spacing: 5px;">${otp}</h1>
          </div>
          <p>This code will expire in 10 minutes.</p>
          <p style="color: #666; font-size: 12px;">If you didn't request this code, please ignore this email.</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ OTP email sent successfully to ${email}`);
    return true;
  } catch (error) {
    console.error('❌ Error sending email:', error.message);
    console.error('Full error:', error);
    
    // Provide more specific error messages
    if (error.message.includes('EMAIL_USER') || error.message.includes('EMAIL_PASS')) {
      console.error('⚠️  Make sure EMAIL_USER and EMAIL_PASS are set in your .env file');
    } else if (error.code === 'EAUTH') {
      console.error('⚠️  Authentication failed. Check your EMAIL_PASS (App Password) in .env');
    } else if (error.code === 'ECONNECTION') {
      console.error('⚠️  Connection failed. Check your internet connection and email service settings');
    }
    
    return false;
  }
};

// Store OTP in database
const storeOTP = async (email, otp) => {
  try {
    // Delete any existing OTP for this email
    await OTP.deleteMany({ email });

    // Create new OTP with 10 minute expiration
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10);

    const otpRecord = new OTP({
      email,
      otp,
      expiresAt
    });

    await otpRecord.save();
    return true;
  } catch (error) {
    console.error('Error storing OTP:', error);
    return false;
  }
};

// Verify OTP
const verifyOTP = async (email, otp) => {
  try {
    const otpRecord = await OTP.findOne({ email });

    if (!otpRecord) {
      return { valid: false, message: 'OTP not found or expired' };
    }

    if (otpRecord.attempts >= 5) {
      return { valid: false, message: 'Too many failed attempts. Please request a new OTP.' };
    }

    if (new Date() > otpRecord.expiresAt) {
      await OTP.deleteOne({ _id: otpRecord._id });
      return { valid: false, message: 'OTP has expired' };
    }

    if (otpRecord.otp !== otp) {
      otpRecord.attempts += 1;
      await otpRecord.save();
      return { valid: false, message: 'Invalid OTP' };
    }

    // OTP is valid, delete it
    await OTP.deleteOne({ _id: otpRecord._id });
    return { valid: true, message: 'OTP verified successfully' };
  } catch (error) {
    console.error('Error verifying OTP:', error);
    return { valid: false, message: 'Error verifying OTP' };
  }
};

module.exports = {
  generateOTP,
  sendOTPEmail,
  storeOTP,
  verifyOTP
};

