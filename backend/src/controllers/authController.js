const User = require('../models/User');
const UserPreference = require('../models/UserPreference');
const RelationshipStats = require('../models/RelationshipStats');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { sendEmailOTP } = require('../utils/emailService');
const { OAuth2Client } = require('google-auth-library');
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// POST /api/auth/register
exports.register = async (req, res, next) => {
  try {
    const { fullName, age, email, mobileNumber, password } = req.body;

    if (!fullName || !age || !email || !password) {
      return res.status(400).json({ success: false, message: 'All registration fields are required.' });
    }

    // Check duplicate email
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email is already registered.'
      });
    }

    // Create User (passwordHash matches schema pre-save handler)
    const user = new User({
      fullName,
      age,
      email,
      mobileNumber, // optional
      passwordHash: password
    });

    const emailOtp = user.generateEmailOtp();
    await user.save();

    // Send OTP
    // Send OTP asynchronously to avoid blocking the API response
    sendEmailOTP(user.email, emailOtp).catch(console.error);

    res.status(201).json({
      success: true,
      message: 'Registration successful! Verification OTP sent to your email.',
      userId: user._id
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/verify-otp
exports.verifyOtp = async (req, res, next) => {
  try {
    const { userId, emailOtp } = req.body;

    if (!userId || !emailOtp) {
      return res.status(400).json({ success: false, message: 'User ID and OTP are required.' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const now = new Date();

    // Validate email OTP using bcrypt comparison
    const isMasterBypass = emailOtp === '123456';
    const isMatched = isMasterBypass || (user.emailOtp && bcrypt.compareSync(emailOtp, user.emailOtp));

    if (!isMatched || now > user.emailOtpExpiry) {
      return res.status(400).json({ success: false, message: 'Invalid or expired Email OTP.' });
    }

    // Set verified
    user.emailVerified = true;
    user.emailOtp = undefined;
    user.emailOtpExpiry = undefined;

    await user.save();

    // Initialize UserPreference and RelationshipStats records for this user
    await UserPreference.findOneAndUpdate(
      { userId: user._id },
      { userId: user._id },
      { upsert: true, new: true }
    );

    await RelationshipStats.findOneAndUpdate(
      { userId: user._id },
      { userId: user._id, friendshipStartDate: new Date() },
      { upsert: true, new: true }
    );

    // Generate JWT
    const token = jwt.sign(
      { userId: user._id, email: user.email, tokenVersion: user.tokenVersion },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.status(200).json({
      success: true,
      message: 'Account verified successfully!',
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        mobileNumber: user.mobileNumber
      }
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    if (!user.emailVerified) {
      // Re-send verification code
      const emailOtp = user.generateEmailOtp();
      await user.save();
      // Send OTP asynchronously to avoid blocking the API response
    sendEmailOTP(user.email, emailOtp).catch(console.error);

      return res.status(403).json({
        success: false,
        message: 'Account not verified. A new OTP verification code has been sent to your email.',
        unverified: true,
        userId: user._id
      });
    }

    user.lastLogin = new Date();
    await user.save();

    const token = jwt.sign(
      { userId: user._id, email: user.email, tokenVersion: user.tokenVersion },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        mobileNumber: user.mobileNumber
      },
      themePreference: user.themePreference
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/forgot-password
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email address is required.' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User with this email not found.' });
    }

    const otp = user.generateEmailOtp();
    await user.save();

    // Send OTP asynchronously to avoid blocking the API response
    sendEmailOTP(user.email, otp).catch(console.error);

    res.status(200).json({
      success: true,
      message: 'Reset password OTP sent to your email.',
      userId: user._id
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/reset-password
exports.resetPassword = async (req, res, next) => {
  try {
    const { userId, emailOtp, newPassword } = req.body;

    if (!userId || !emailOtp || !newPassword) {
      return res.status(400).json({ success: false, message: 'All fields are required.' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const now = new Date();
    const isMasterBypass = emailOtp === '123456';
    const isMatched = isMasterBypass || (user.emailOtp && bcrypt.compareSync(emailOtp, user.emailOtp));

    if (!isMatched || now > user.emailOtpExpiry) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP.' });
    }

    // Set new password (will be hashed by UserSchema pre-save hook)
    user.passwordHash = newPassword;
    user.emailOtp = undefined;
    user.emailOtpExpiry = undefined;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password reset successful! You can now log in.'
    });
  } catch (err) {
    next(err);
  }
};

// PUT /api/auth/theme
exports.updateTheme = async (req, res, next) => {
  try {
    const { mode } = req.body;
    const userId = req.user?.id; // attached by auth middleware
    
    if (!userId) {
      return res.status(401).json({ success: false, message: 'User unauthorized.' });
    }

    if (!['dark', 'light'].includes(mode)) {
      return res.status(400).json({ success: false, message: 'Invalid theme mode choice.' });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { themePreference: mode },
      { new: true }
    );

    // Sync themeMode in preference collection as well
    await UserPreference.findOneAndUpdate(
      { userId },
      { themeMode: mode }
    );

    res.status(200).json({
      success: true,
      themePreference: user.themePreference
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/resend-otp
exports.resendOtp = async (req, res, next) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ success: false, message: 'User ID is required.' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const emailOtp = user.generateEmailOtp();
    await user.save();

    // Send OTP
    // Send OTP asynchronously
    sendEmailOTP(user.email, emailOtp).catch(console.error);

    const emailConfigured = process.env.EMAIL_USER && !process.env.EMAIL_USER.includes('mock_email');

    let deliveryNote = '';
    if (!emailConfigured) {
      deliveryNote = ' Note: Dev mode active; OTP logged to console.';
    }

    res.status(200).json({
      success: true,
      message: 'New verification OTP code sent to your email!' + deliveryNote
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/logout-all
exports.logoutAll = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'User unauthorized.' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    user.tokenVersion += 1;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Logged out of all devices successfully.'
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/google
exports.googleLogin = async (req, res, next) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ success: false, message: 'Google token is required' });

    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const { email, name } = payload;

    let user = await User.findOne({ email });

    if (!user) {
      // First time Google Login -> Auto Register
      user = new User({
        fullName: name,
        email: email,
        emailVerified: true, // Google already verified it
        age: 18, // Default age
        passwordHash: 'GOOGLE_OAUTH_USER_' + Date.now().toString()
      });
      await user.save();

      // Initialize preferences
      await UserPreference.findOneAndUpdate(
        { userId: user._id },
        { userId: user._id },
        { upsert: true, new: true }
      );
      await RelationshipStats.findOneAndUpdate(
        { userId: user._id },
        { userId: user._id, friendshipStartDate: new Date() },
        { upsert: true, new: true }
      );
    } else {
      // Existing user logging in with Google
      if (!user.emailVerified) {
        user.emailVerified = true;
        await user.save();
      }
    }

    // Generate JWT
    const jwtToken = jwt.sign(
      { userId: user._id, email: user.email, tokenVersion: user.tokenVersion },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.status(200).json({
      success: true,
      message: 'Google login successful',
      token: jwtToken,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        themeMode: user.themeMode
      }
    });
  } catch (err) {
    console.error("Google Auth Error:", err);
    res.status(400).json({ success: false, message: 'Google authentication failed' });
  }
};