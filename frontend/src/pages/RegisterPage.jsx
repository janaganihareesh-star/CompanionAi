import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useDispatch } from 'react-redux';
import { GoogleLogin } from '@react-oauth/google';
import { googleLoginAsync } from '../store/authSlice';
import useAuth from '../hooks/useAuth';
import ThemeToggle from '../components/ThemeToggle';
import { Sparkles, Eye, EyeOff, Loader2 } from 'lucide-react';
import axios from 'axios';

export default function RegisterPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { register, isLoading } = useAuth();

  const [formData, setFormData] = useState({
    fullName: '',
    age: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorShake, setErrorShake] = useState(false);
  const [formError, setFormError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Password Strength Logic
  const getPasswordStrength = () => {
    const pass = formData.password;
    if (!pass) return { score: 0, label: '', color: 'bg-border' };
    let score = 0;
    if (pass.length >= 6) score += 33;
    if (/[A-Z]/.test(pass) && /[0-9]/.test(pass)) score += 33;
    if (/[^A-Za-z0-9]/.test(pass)) score += 34;

    if (score < 34) return { score, label: 'Weak', color: 'bg-rose' };
    if (score < 67) return { score, label: 'Medium', color: 'bg-amber' };
    return { score, label: 'Strong', color: 'bg-emerald' };
  };

  const strength = getPasswordStrength();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    const { fullName, age, email, password, confirmPassword } = formData;
    if (!fullName || !age || !email || !password || !confirmPassword) {
      setFormError('Please fill in all registration fields.');
      setErrorShake(true);
      setTimeout(() => setErrorShake(false), 500);
      return;
    }

    if (password !== confirmPassword) {
      setFormError('Passwords do not match. Please check and try again.');
      setErrorShake(true);
      setTimeout(() => setErrorShake(false), 500);
      return;
    }

    try {
      const res = await register({
        fullName,
        age: parseInt(age),
        email,
        password
      });

      toast.success(res.message || 'OTP sent successfully!', { id: 'auth-success' });
      setTimeout(() => {
        navigate('/verify-otp', { state: { userId: res.userId } });
      }, 1500);
    } catch (err) {
      setFormError(err.toString());
      setErrorShake(true);
      setTimeout(() => setErrorShake(false), 500);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setFormError('');
    try {
      const res = await dispatch(googleLoginAsync(credentialResponse.credential)).unwrap();
      toast.success('Google Registration successful! Connecting companion...', { id: 'auth-success' });
      
      setTimeout(() => {
        axios.get('/api/profile/preferences', {
          headers: { Authorization: `Bearer ${res.token}` }
        }).then(prefRes => {
          const pref = prefRes.data?.preference;
          if (pref && pref.onboardingComplete) {
            navigate('/home');
          } else {
            navigate('/onboarding/gender');
          }
        }).catch(() => {
          navigate('/onboarding/gender');
        });
      }, 800);
    } catch (err) {
      setFormError(err.toString());
      setErrorShake(true);
      setTimeout(() => setErrorShake(false), 500);
    }
  };

  const handleGoogleError = () => {
    setFormError('Google Sign-In was unsuccessful. Try again later.');
    setErrorShake(true);
    setTimeout(() => setErrorShake(false), 500);
  };

  // Form container stagger variants
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
    <div className="min-h-screen bg-bg flex flex-col relative px-4 py-12 overflow-y-auto">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={errorShake ? { x: [0, -8, 8, -8, 8, 0] } : { opacity: 1, y: 0 }}
        transition={errorShake ? { duration: 0.4 } : { type: 'spring', stiffness: 300, damping: 25 }}
        className="w-full max-w-[400px] mx-auto bg-surface/70 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] shadow-[0_0_40px_rgba(167,139,250,0.15)] px-6 py-8 md:px-8 md:py-10 my-auto relative z-10 flex flex-col justify-center transform transition-all hover:shadow-[0_0_50px_rgba(167,139,250,0.25)]"
      >
        {/* Title */}
        <div className="text-center space-y-2 mb-6">
          <div className="flex justify-center items-center gap-1.5 font-bold text-xl tracking-wide font-outfit text-text">
            <Sparkles className="w-6 h-6 text-accent" />
            <span>CloserAI</span>
          </div>
          <h2 className="text-2xl font-bold font-outfit text-text">Create Account</h2>
          <p className="text-muted text-sm">Verify to unlock your emotional companion.</p>
        </div>

        {/* Error Callout */}
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

        {/* Register Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="space-y-4"
          >
            {/* Full Name */}
            <motion.div variants={fieldVariants} className="space-y-1">
              <label className="text-text font-medium text-sm">Full Name</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="John Doe"
                className="w-full bg-panel border border-border text-text rounded-xl px-4 py-3 placeholder:text-muted focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition"
              />
            </motion.div>

            {/* Age */}
            <motion.div variants={fieldVariants} className="space-y-1">
              <label className="text-text font-medium text-sm">Age</label>
              <input
                type="number"
                name="age"
                value={formData.age}
                onChange={handleChange}
                placeholder="24"
                className="w-full bg-panel border border-border text-text rounded-xl px-4 py-3 placeholder:text-muted focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition"
              />
            </motion.div>

            {/* Email */}
            <motion.div variants={fieldVariants} className="space-y-1">
              <label className="text-text font-medium text-sm">Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="example@mail.com"
                className="w-full bg-panel border border-border text-text rounded-xl px-4 py-3 placeholder:text-muted focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition"
              />
            </motion.div>



            {/* Password */}
            <motion.div variants={fieldVariants} className="space-y-1">
              <label className="text-text font-medium text-sm">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
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

              {/* Password Strength Bar */}
              {formData.password && (
                <div className="space-y-1 pt-1">
                  <div className="w-full h-1.5 bg-border rounded-full overflow-hidden">
                    <motion.div
                      animate={{ width: `${strength.score}%` }}
                      transition={{ duration: 0.3 }}
                      className={`h-full ${strength.color}`}
                    />
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted">Strength:</span>
                    <span className="font-bold text-text">{strength.label}</span>
                  </div>
                </div>
              )}
            </motion.div>

            {/* Confirm Password */}
            <motion.div variants={fieldVariants} className="space-y-1">
              <label className="text-text font-medium text-sm">Confirm Password</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
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
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              'Sign Up'
            )}
          </button>
        </form>

        <div className="mt-6 space-y-4">
          <div className="relative flex items-center">
            <div className="flex-grow border-t border-border/50"></div>
            <span className="flex-shrink-0 mx-4 text-muted text-xs uppercase tracking-wider font-medium">Or continue with</span>
            <div className="flex-grow border-t border-border/50"></div>
          </div>
          
          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              theme="outline"
              size="large"
              shape="pill"
              text="continue_with"
            />
          </div>
        </div>

        <div className="mt-6 text-center text-sm text-muted">
          Already have an account?{' '}
          <button
            onClick={() => navigate('/login')}
            className="text-accent underline underline-offset-2 font-medium cursor-pointer"
          >
            Login here
          </button>
        </div>
      </motion.div>
    </div>
  );
}
