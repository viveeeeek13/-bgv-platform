// src/pages/LoginPage.jsx
// Authentication - Login screen

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authAPI } from '../services/api';
import useAuthStore from '../store/authStore';
import Spinner from '../components/ui/Spinner';
import { useState } from 'react';

const LoginPage = () => {
  const navigate = useNavigate();
  const { setAuth, isAuthenticated } = useAuthStore();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard', { replace: true });
  }, [isAuthenticated, navigate]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const res = await authAPI.login(data);
      setAuth(res.data.data);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex w-1/2 bg-slate-900 flex-col justify-between p-12 relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white to-transparent" />
          {[...Array(12)].map((_, i) => (
            <div key={i} className="absolute h-px w-full bg-slate-400" style={{ top: `${(i + 1) * 80}px`, opacity: 0.1 }} />
          ))}
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <span className="text-2xl">🛡</span>
            <span className="font-display text-xl font-bold text-white">BGV Platform</span>
          </div>
          <h2 className="font-display text-4xl font-bold text-white leading-tight mb-4">
            Enterprise-grade<br />background verification
          </h2>
          <p className="text-slate-400 text-base leading-relaxed">
            Streamline your hiring process with automated Aadhaar and PAN verification, professional reports, and real-time status tracking.
          </p>
        </div>

        <div className="relative z-10 grid grid-cols-2 gap-4">
          {[
            { n: '2,400+', l: 'Verifications' },
            { n: '98.2%', l: 'Accuracy Rate' },
            { n: '<2min', l: 'Avg. Turnaround' },
            { n: '100%', l: 'Secure & Compliant' },
          ].map((s) => (
            <div key={s.l} className="rounded-xl bg-slate-800/60 p-4 border border-slate-700/50">
              <p className="font-display text-2xl font-bold text-white">{s.n}</p>
              <p className="text-xs text-slate-400 mt-0.5">{s.l}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel - Login form */}
      <div className="flex flex-1 items-center justify-center p-6 bg-slate-50">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-6 lg:hidden">
              <span className="text-xl">🛡</span>
              <span className="font-display text-lg font-bold text-slate-900">BGV Platform</span>
            </div>
            <h1 className="font-display text-2xl font-bold text-slate-900">Sign in</h1>
            <p className="text-sm text-slate-500 mt-1">Enter your credentials to continue</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Email address</label>
              <input
                type="email"
                {...register('email', {
                  required: 'Email is required',
                  pattern: { value: /^\S+@\S+\.\S+$/, message: 'Invalid email' },
                })}
                className={`input-field ${errors.email ? 'input-error' : ''}`}
                placeholder="you@company.com"
                autoComplete="email"
              />
              {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
              <input
                type="password"
                {...register('password', { required: 'Password is required' })}
                className={`input-field ${errors.password ? 'input-error' : ''}`}
                placeholder="••••••••"
                autoComplete="current-password"
              />
              {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>}
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full mt-2 py-3">
              {loading ? <><Spinner size="sm" /> Signing in...</> : 'Sign in'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-brand-600 hover:text-brand-700">
              Create one
            </Link>
          </p>

          {/* Demo credentials hint */}
          <div className="mt-6 rounded-lg bg-brand-50 border border-brand-200 p-3">
            <p className="text-xs font-semibold text-brand-700 mb-1">Demo Credentials</p>
            <p className="text-xs text-brand-600 font-mono">admin@bgv.com / Admin1234</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
