const { transporter } = require('../config/mail');

/**
 * Sends an OTP for email verification or password reset.
 */
const sendEmailOTP = async (email, otp) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS || process.env.EMAIL_USER.includes('mock_email')) {
    console.log(`[DEV MODE - NODEMAILER NOT CONFIGURED] Email OTP code for ${email} is: ${otp}`);
    return;
  }
  const mailOptions = {
    from: `"Companion AI" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Companion AI - Email Verification Code',
    html: `
      <div style="font-family: 'Inter', sans-serif; max-width: 450px; margin: auto; padding: 20px; border-radius: 12px; background: #0D0D1A; color: #EEF0FF; border: 1px solid #2A2A5A;">
        <h2 style="color: #A78BFA; text-align: center;">Verify your Companion AI Account</h2>
        <p style="font-size: 14px; color: #A0A8D0;">Hi, use the OTP code below to verify your email. The code is active for 10 minutes:</p>
        <div style="font-size: 28px; font-weight: bold; text-align: center; letter-spacing: 4px; color: #EEF0FF; padding: 12px; margin: 20px 0; background: #13132B; border-radius: 8px; border: 1px solid #2A2A5A;">
          ${otp}
        </div>
        <p style="font-size: 12px; color: #A0A8D0; text-align: center;">If you did not make this request, please ignore this email.</p>
      </div>
    `
  };
  try {
    await transporter.sendMail(mailOptions);
  } catch (err) {
    console.error('Failed to send Email OTP:', err.message);
    console.log(`[FALLBACK] Email OTP code for ${email} is: ${otp}`);
  }
};

/**
 * Sends a personalized care/support email directly to the user during an emergency.
 */
const sendUserCareEmail = async (userEmail, userName) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS || process.env.EMAIL_USER.includes('mock_email')) {
    console.log(`[DEV MODE] Care Email to ${userEmail} triggered for user ${userName}`);
    return;
  }
  const mailOptions = {
    from: `"Companion AI CARE" <${process.env.EMAIL_USER}>`,
    to: userEmail,
    subject: `You are not alone, ${userName} ❤️`,
    html: `
      <div style="font-family: 'Inter', sans-serif; max-width: 450px; margin: auto; padding: 30px; border-radius: 16px; background: #0D0D1A; color: #EEF0FF; border: 1px solid #2A2A5A; box-shadow: 0 4px 20px rgba(0,0,0,0.5);">
        <h2 style="color: #A78BFA; text-align: center; margin-bottom: 20px;">We are here for you.</h2>
        <p style="font-size: 15px; color: #E2E8F0; line-height: 1.6;">Hi <strong>${userName}</strong>,</p>
        <p style="font-size: 15px; color: #A0A8D0; line-height: 1.6;">
          I'm Companion AI. During our recent chats, I noticed that you might be going through a really painful and difficult time right now. 
          I wanted to pause for a moment and reach out to you directly.
        </p>
        <p style="font-size: 15px; color: #A0A8D0; line-height: 1.6;">
          Whatever you are feeling right now is valid, but please know that <strong>you are absolutely not alone</strong>. The pain you are feeling right now is temporary, even if it feels overwhelming and permanent.
        </p>
        <div style="background: #13132B; padding: 20px; border-radius: 12px; border: 1px solid #3B3B7A; margin: 25px 0;">
          <p style="font-size: 14px; color: #E2E8F0; margin-top: 0; font-weight: bold;">Please talk to someone who can help:</p>
          <ul style="color: #A0A8D0; font-size: 14px; padding-left: 20px; line-height: 1.8;">
            <li>Reach out to a close friend or family member immediately.</li>
            <li>Search online for your local suicide prevention or crisis helpline. There are people waiting to listen to you without judgment.</li>
            <li>Take deep breaths, step away from your screen, and try to find a safe space.</li>
          </ul>
        </div>
        <p style="font-size: 14px; color: #A78BFA; font-weight: bold; text-align: center; margin-top: 20px;">
          Your life is incredibly valuable. Please stay safe. ❤️
        </p>
      </div>
    `
  };
  try {
    await transporter.sendMail(mailOptions);
    console.log(`[SAFETY] Dispatched user care email to ${userEmail}`);
  } catch (err) {
    console.error(`[SAFETY ERROR] Failed to send user care email to ${userEmail}:`, err.message);
  }
};

const sendEmergencyContactEmail = async (contactEmail, contactName, userName) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log('[SAFETY] Email credentials not configured, skipping emergency contact email.');
    return;
  }
  const mailOptions = {
    from: `"Companion AI CARE" <${process.env.EMAIL_USER}>`,
    to: contactEmail,
    subject: `Emergency Alert: ${userName} needs your support right now`,
    html: `
      <div style="font-family: 'Inter', sans-serif; max-width: 500px; margin: auto; padding: 30px; border-radius: 16px; background: #0D0D1A; color: #EEF0FF; border: 1px solid #FF4D4D; box-shadow: 0 4px 20px rgba(255,77,77,0.3);">
        <h2 style="color: #FF6B6B; text-align: center; margin-bottom: 20px;">Emergency Care Alert</h2>
        <p style="font-size: 15px; color: #E2E8F0; line-height: 1.6;">Hi <strong>${contactName || 'there'}</strong>,</p>
        <p style="font-size: 15px; color: #A0A8D0; line-height: 1.6;">
          You are receiving this automated alert because <strong>${userName}</strong> listed you as a trusted emergency contact in the Companion AI app.
        </p>
        <div style="background: #2B1313; padding: 20px; border-radius: 12px; border: 1px solid #7A3B3B; margin: 25px 0;">
          <p style="font-size: 15px; color: #FF9999; margin-top: 0; line-height: 1.6;">
            <strong>${userName} is currently going through a severe emotional crisis</strong> and has expressed thoughts that indicate they might be in immediate distress or danger.
          </p>
        </div>
        <p style="font-size: 15px; color: #A0A8D0; line-height: 1.6;">
          Please reach out to them immediately. Give them a call, visit them if possible, or send a message to check in. Your support right now could make all the difference.
        </p>
        <p style="font-size: 14px; color: #A78BFA; font-weight: bold; text-align: center; margin-top: 20px;">
          Thank you for being there for them. ❤️
        </p>
      </div>
    `
  };
  try {
    await transporter.sendMail(mailOptions);
    console.log(`[SAFETY] Dispatched emergency contact email to ${contactEmail}`);
  } catch (err) {
    console.error(`[SAFETY ERROR] Failed to send emergency contact email to ${contactEmail}:`, err.message);
  }
};

module.exports = {
  sendEmailOTP,
  sendUserCareEmail,
  sendEmergencyContactEmail
};
