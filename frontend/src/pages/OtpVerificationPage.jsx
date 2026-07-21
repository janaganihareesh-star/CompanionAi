import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import useAuth from '../hooks/useAuth';
import ThemeToggle from '../components/ThemeToggle';
import { Sparkles, Loader2 } from 'lucide-react';

export default function OtpVerificationPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { verify, resend, isLoading } = useAuth();
  
  const userId = location.state?.userId || '';

  const [emailOtp, setEmailOtp] = useState(Array(6).fill(''));
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [successBounce, setSuccessBounce] = useState(false);

  const emailRefs = useRef([]);

  // Countdown timer for resending OTPs
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer((t) => t - 1), 1000);
      return () => clearInterval(interval);
    } else {
      setCanResend(true);
    }
  }, [timer]);

  const handleEmailChange = (value, idx) => {
    if (isNaN(value)) return;
    const newOtp = [...emailOtp];
    newOtp[idx] = value;
    setEmailOtp(newOtp);

    // Auto focus next field
    if (value !== '' && idx < 5) {
      emailRefs.current[idx + 1].focus();
    }
  };

  const handleKeyDown = (e, idx) => {
    if (e.key === 'Backspace') {
      if (emailOtp[idx] === '' && idx > 0) {
        emailRefs.current[idx - 1].focus();
      }
    }
  };

  const handleResend = async () => {
    try {
      await resend(userId);
      setTimer(60);
      setCanResend(false);
      toast.success('Verification code resent successfully!');
    } catch (err) {
      toast.error(err.toString() || 'Failed to resend OTP.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const emailCode = emailOtp.join('');

    if (emailCode.length < 6) {
      toast.error('Please complete the verification code.');
      return;
    }

    try {
      const res = await verify({
        userId,
        emailOtp: emailCode
      });

      // Save token for authenticated requests
      localStorage.setItem('closer-token', res.token);

      toast.success(res.message || 'OTP Verified! Redirecting to onboarding...');
      setSuccessBounce(true);

      setTimeout(() => {
        navigate('/onboarding/gender');
      }, 1000);
    } catch (err) {
      toast.error(err.toString() || 'OTP verification failed.');
    }
  };

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center relative px-4">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={successBounce ? { scale: [1, 1.1, 0.9, 1.05, 0], opacity: [1, 1, 1, 1, 0] } : { opacity: 1, y: 0 }}
        transition={successBounce ? { duration: 0.8 } : { type: 'spring', stiffness: 300, damping: 25 }}
        className="w-full max-w-md mx-auto bg-surface/70 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] shadow-[0_0_40px_rgba(167,139,250,0.15)] px-6 py-10 md:px-10 md:py-12 my-auto relative z-10 flex flex-col justify-center transform transition-all hover:shadow-[0_0_50px_rgba(167,139,250,0.25)]"
      >
        <div className="text-center space-y-2 mb-6">
          <div className="flex justify-center items-center gap-1.5 font-bold text-xl tracking-wide font-outfit text-text">
            <Sparkles className="w-6 h-6 text-accent" />
            <span>CloserAI</span>
          </div>
          <h2 className="text-2xl font-bold font-outfit text-text">Verify Identity</h2>
          <p className="text-muted text-sm">Enter the verification code sent to your email.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email OTP Boxes */}
          <div className="space-y-2">
            <label className="text-text font-medium text-sm block">Email Verification Code</label>
            <div className="flex justify-between gap-1.5">
              {emailOtp.map((digit, idx) => (
                <motion.input
                  key={`email-${idx}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  ref={(el) => (emailRefs.current[idx] = el)}
                  type="text"
                  maxLength="1"
                  value={digit}
                  onChange={(e) => handleEmailChange(e.target.value, idx)}
                  onKeyDown={(e) => handleKeyDown(e, idx)}
                  className="w-11 h-13 text-center text-xl font-bold bg-panel border border-border rounded-xl text-text focus:border-accent focus:ring-2 focus:ring-accent/30 outline-none transition"
                />
              ))}
            </div>
          </div>

          {/* Countdown & Resend */}
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted">Didn't receive the code?</span>
            {canResend ? (
              <button
                type="button"
                onClick={handleResend}
                className="text-accent hover:underline font-semibold cursor-pointer"
              >
                Resend OTP
              </button>
            ) : (
              <span className="text-muted font-medium">Resend in {timer}s</span>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl py-3 font-semibold hover:opacity-90 transition flex justify-center items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              'Verify & Proceed'
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
