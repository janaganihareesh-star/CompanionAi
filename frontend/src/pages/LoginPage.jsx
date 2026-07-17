import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast, Toaster } from 'react-hot-toast';
import { useDispatch } from 'react-redux';
import { GoogleLogin } from '@react-oauth/google';
import { googleLoginAsync } from '../store/authSlice';
import useAuth from '../hooks/useAuth';
import ThemeToggle from '../components/ThemeToggle';
import { Sparkles, Eye, EyeOff, Loader2 } from 'lucide-react';
import axios from 'axios';

export default function LoginPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { login, isLoading } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errorShake, setErrorShake] = useState(false);
  const [formError, setFormError] = useState('');
  const [successExit, setSuccessExit] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    const { email, password } = formData;
    if (!email || !password) {
      setFormError('Please enter email and password.');
      setErrorShake(true);
      setTimeout(() => setErrorShake(false), 500);
      return;
    }

    try {
      const res = await login({ email, password });
      toast.success('Login successful! Connecting companion...');
      
      // On success: trigger scale 1 -> 1.05 -> 0 exit animation before navigation
      setSuccessExit(true);
      setTimeout(() => {
        // Query user preference to see if onboarding is completed
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
      if (err && typeof err === 'object' && err.unverified) {
        toast.error('Account not verified. Redirecting to OTP verification...');
        setTimeout(() => {
          navigate('/verify-otp', { state: { userId: err.userId } });
        }, 1500);
        return;
      }
      setFormError(typeof err === 'string' ? err : (err?.message || 'Login failed'));
      setErrorShake(true);
      setTimeout(() => setErrorShake(false), 500);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setFormError('');
    try {
      const res = await dispatch(googleLoginAsync(credentialResponse.credential)).unwrap();
      toast.success('Google Login successful! Connecting companion...');
      
      setSuccessExit(true);
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

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center relative px-4">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <Toaster position="top-right" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={
          successExit 
            ? { scale: [1, 1.05, 0], opacity: [1, 1, 0] } 
            : errorShake 
              ? { x: [0, -8, 8, -8, 8, 0] } 
              : { opacity: 1, y: 0 }
        }
        transition={
          successExit 
            ? { duration: 0.6, ease: 'easeInOut' }
            : errorShake 
              ? { duration: 0.4 } 
              : { type: 'spring', stiffness: 300, damping: 25 }
        }
        className="w-full max-w-md mx-auto bg-surface/70 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] shadow-[0_0_40px_rgba(167,139,250,0.15)] px-6 py-10 md:px-10 md:py-12 my-auto relative z-10 flex flex-col justify-center transform transition-all hover:shadow-[0_0_50px_rgba(167,139,250,0.25)]"
      >
        {/* Title */}
        <div className="text-center space-y-2 mb-6">
          <div className="flex justify-center items-center gap-1.5 font-bold text-xl tracking-wide font-outfit text-text">
            <Sparkles className="w-6 h-6 text-accent" />
            <span>CloserAI</span>
          </div>
          <h2 className="text-2xl font-bold font-outfit text-text">Welcome Back</h2>
          <p className="text-muted text-sm">Access your companion space.</p>
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

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div className="space-y-1">
            <label className="text-text font-medium text-sm">Email Address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="example@mail.com"
              className="w-full bg-panel border border-border text-text rounded-xl px-4 py-3 placeholder:text-muted focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition"
            />
          </div>

          {/* Password */}
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="text-text font-medium text-sm">Password</label>
              <button
                type="button"
                onClick={() => navigate('/forgot-password')}
                className="text-xs text-accent hover:underline font-medium cursor-pointer"
              >
                Forgot Password?
              </button>
            </div>
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
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-accent text-white rounded-xl py-3 font-semibold hover:opacity-90 transition flex justify-center items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              'Login'
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
          Don't have an account?{' '}
          <button
            onClick={() => navigate('/register')}
            className="text-accent underline underline-offset-2 font-medium cursor-pointer"
          >
            Register here
          </button>
        </div>
      </motion.div>
    </div>
  );
}
