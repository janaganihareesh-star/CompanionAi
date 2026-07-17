import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast, Toaster } from 'react-hot-toast';
import ThemeToggle from '../components/ThemeToggle';
import { Sparkles, Eye, EyeOff, Loader2, ArrowLeft } from 'lucide-react';
import axios from 'axios';

export default function ForgotPasswordPage() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [errorShake, setErrorShake] = useState(false);
  const [formError, setFormError] = useState('');

  const [email, setEmail] = useState('');
  const [userId, setUserId] = useState(null);
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!email) {
      setFormError('Please enter your email address.');
      triggerError();
      return;
    }

    setIsLoading(true);
    try {
      const res = await axios.post('/api/auth/forgot-password', { email });
      setUserId(res.data.userId);
      toast.success(res.data.message || 'OTP sent to your email.');
      setStep(2);
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to send OTP.');
      triggerError();
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    setFormError('');
    if (!otp) {
      setFormError('Please enter the OTP sent to your email.');
      triggerError();
      return;
    }
    setStep(3);
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!newPassword || !confirmPassword) {
      setFormError('Please fill in both password fields.');
      triggerError();
      return;
    }

    if (newPassword !== confirmPassword) {
      setFormError('New password and confirm password thappu unnai chusi enter chai.');
      triggerError();
      return;
    }

    setIsLoading(true);
    try {
      const res = await axios.post('/api/auth/reset-password', {
        userId,
        emailOtp: otp,
        newPassword
      });
      toast.success(res.data.message || 'Password reset successful!');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to reset password. OTP may be invalid.');
      triggerError();
    } finally {
      setIsLoading(false);
    }
  };

  const triggerError = () => {
    setErrorShake(true);
    setTimeout(() => setErrorShake(false), 500);
  };

  const containerVariants = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: 0.08
      }
    }
  };

  const fieldVariants = {
    hidden: { opacity: 0, x: -16 },
    show: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 200 } }
  };

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center relative px-4 py-12">
      <div className="absolute top-4 left-4">
        <button
          onClick={() => navigate('/login')}
          className="p-2 text-muted hover:text-text rounded-lg hover:bg-panel transition-colors flex items-center gap-2 cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium text-sm">Back to Login</span>
        </button>
      </div>
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <Toaster position="top-right" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={errorShake ? { x: [0, -8, 8, -8, 8, 0] } : { opacity: 1, y: 0 }}
        transition={errorShake ? { duration: 0.4 } : { type: 'spring', stiffness: 300, damping: 25 }}
        className="w-full max-w-md mx-auto bg-surface/70 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] shadow-[0_0_40px_rgba(167,139,250,0.15)] px-6 py-10 md:px-10 md:py-12 my-auto relative z-10 flex flex-col justify-center transform transition-all hover:shadow-[0_0_50px_rgba(167,139,250,0.25)]"
      >
        <div className="text-center space-y-2 mb-6">
          <div className="flex justify-center items-center gap-1.5 font-bold text-xl tracking-wide font-outfit text-text">
            <Sparkles className="w-6 h-6 text-accent" />
            <span>CloserAI</span>
          </div>
          <h2 className="text-2xl font-bold font-outfit text-text">
            {step === 1 && "Forgot Password"}
            {step === 2 && "Enter OTP"}
            {step === 3 && "Reset Password"}
          </h2>
          <p className="text-muted text-sm">
            {step === 1 && "Enter your email to receive a verification code."}
            {step === 2 && "Enter the 6-digit code sent to your email."}
            {step === 3 && "Create a new strong password."}
          </p>
        </div>

        <AnimatePresence>
          {formError && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4 p-3 rounded-xl bg-rose/10 border border-rose/20 text-rose text-sm font-medium"
            >
              {formError}
            </motion.div>
          )}
        </AnimatePresence>

        {step === 1 && (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-4">
              <motion.div variants={fieldVariants} className="space-y-1">
                <label className="text-text font-medium text-sm">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@mail.com"
                  className="w-full bg-panel border border-border text-text rounded-xl px-4 py-3 placeholder:text-muted focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition"
                />
              </motion.div>
            </motion.div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-accent text-white rounded-xl py-3 font-semibold hover:opacity-90 transition flex justify-center items-center gap-2 cursor-pointer disabled:opacity-50 mt-4"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Send Verification Code'}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-4">
              <motion.div variants={fieldVariants} className="space-y-1">
                <label className="text-text font-medium text-sm">Verification Code (OTP)</label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="123456"
                  maxLength={6}
                  className="w-full bg-panel border border-border text-text rounded-xl px-4 py-3 placeholder:text-muted focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition text-center tracking-[0.5em] text-lg font-bold"
                />
              </motion.div>
            </motion.div>
            <button
              type="submit"
              className="w-full bg-accent text-white rounded-xl py-3 font-semibold hover:opacity-90 transition flex justify-center items-center gap-2 cursor-pointer mt-4"
            >
              Continue
            </button>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-4">
              <motion.div variants={fieldVariants} className="space-y-1">
                <label className="text-text font-medium text-sm">New Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-panel border border-border text-text rounded-xl px-4 py-3 placeholder:text-muted focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none pr-10 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3.5 text-muted hover:text-text cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </motion.div>

              <motion.div variants={fieldVariants} className="space-y-1">
                <label className="text-text font-medium text-sm">Confirm Password</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-panel border border-border text-text rounded-xl px-4 py-3 placeholder:text-muted focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none pr-10 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3.5 text-muted hover:text-text cursor-pointer"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </motion.div>
            </motion.div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-accent text-white rounded-xl py-3 font-semibold hover:opacity-90 transition flex justify-center items-center gap-2 cursor-pointer disabled:opacity-50 mt-4"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Reset Password'}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
}
