const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');
const { otpGenerateLimiter, otpVerifyLimiter } = require('../middleware/rateLimiter');

router.post('/register', otpGenerateLimiter, authController.register);
router.post('/verify-otp', otpVerifyLimiter, authController.verifyOtp);
router.post('/resend-otp', otpGenerateLimiter, authController.resendOtp);
router.post('/login', authController.login);
router.post('/forgot-password', otpGenerateLimiter, authController.forgotPassword);
router.post('/reset-password', otpVerifyLimiter, authController.resetPassword);
router.post('/google', authController.googleLogin);
router.put('/theme', auth, authController.updateTheme);

// Log out of all devices
router.post('/logout-all', auth, authController.logoutAll);

module.exports = router;