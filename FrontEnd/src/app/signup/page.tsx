'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';

export default function SignUpPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const { signup, googleSignin } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }
    setIsLoading(true);
    try {
      const roleResult = await signup(name, email, password);
      if (roleResult === 'ADMIN') {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to register account');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setError('');
    setIsGoogleLoading(true);
    try {
      await googleSignin();
      router.push('/dashboard');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Google registration failed');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg flex">
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between w-[46%] bg-brand-charcoal p-12 relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-brand-orange opacity-10" />
        <div className="absolute bottom-20 -left-16 w-60 h-60 rounded-full bg-brand-orange opacity-10" />
        <div className="absolute top-1/2 right-8 w-32 h-32 rounded-full bg-white opacity-5" />

        {/* Logo */}
        <div className="relative z-10">
          <Image
            src="/assets/images/tasknera_logo.png"
            alt="TaskNera"
            width={140}
            height={40}
            className="h-9 w-auto object-contain brightness-0 invert"
            priority
          />
        </div>

        {/* Content */}
        <div className="relative z-10 space-y-8">
          <div>
            <h2 className="text-3xl font-bold text-white leading-tight">
              Hire with confidence.<br />Every time.
            </h2>
            <p className="text-white/60 mt-3 text-sm leading-relaxed">
              TaskNera evaluates every candidate against your job requirements — objectively, consistently, and at scale.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[
              { value: '10x', label: 'Faster screening' },
              { value: '94%', label: 'Accuracy rate' },
              { value: '60%', label: 'Less bias' },
              { value: '3min', label: 'Per evaluation' },
            ].map((stat, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-4">
                <div className="text-2xl font-bold text-brand-orange">{stat.value}</div>
                <div className="text-white/50 text-xs mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-white/30 text-xs">People. Processes. Performance.</p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="lg:hidden mb-8">
          <Image src="/assets/images/tasknera_logo.png" alt="TaskNera" width={130} height={36} className="h-8 w-auto object-contain" />
        </div>

        <div className="w-full max-w-md bg-white p-8 rounded-3xl border border-slate-200 shadow-xl">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-brand-charcoal">Create your account</h1>
            <p className="text-brand-charcoal-3 text-sm mt-1">Start evaluating candidates with TaskNera</p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm flex items-center gap-3">
              <svg className="w-5 h-5 flex-shrink-0 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {/* Google Sign-Up Section */}
          <div className="mb-6">
            <button
              type="button"
              onClick={handleGoogleSignUp}
              disabled={isGoogleLoading || isLoading}
              className="w-full py-3 px-4 bg-white hover:bg-slate-50 disabled:opacity-60 text-brand-charcoal font-semibold text-sm rounded-xl border border-slate-300 shadow-2xs hover:shadow-xs transition-all flex items-center justify-center gap-3 cursor-pointer"
            >
              {isGoogleLoading ? (
                <>
                  <svg className="animate-spin w-4 h-4 text-brand-charcoal" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Connecting to Google...</span>
                </>
              ) : (
                <>
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    className="w-5 h-5 flex-shrink-0"
                    style={{ width: '20px', height: '20px', minWidth: '20px', minHeight: '20px' }}
                  >
                    <path
                      fill="#4285F4"
                      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                    />
                  </svg>
                  <span>Continue with Google</span>
                </>
              )}
            </button>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-brand-border"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-brand-bg px-3 text-brand-charcoal-3 font-semibold tracking-wider">
                  or register with email
                </span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-brand-charcoal-2 uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Sarah Mitchell"
                className="w-full px-4 py-2.5 rounded-xl bg-white border border-brand-border text-brand-charcoal placeholder-brand-charcoal-3 focus:outline-none focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/10 transition-all text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-brand-charcoal-2 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@tasknera.com"
                className="w-full px-4 py-2.5 rounded-xl bg-white border border-brand-border text-brand-charcoal placeholder-brand-charcoal-3 focus:outline-none focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/10 transition-all text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-brand-charcoal-2 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full px-4 py-2.5 pr-11 rounded-xl bg-white border border-brand-border text-brand-charcoal placeholder-brand-charcoal-3 focus:outline-none focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/10 transition-all text-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-charcoal-3 hover:text-brand-charcoal transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {showPassword
                      ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858-5.908a10.05 10.05 0 012.122-.163c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21M3 3l18 18" />
                      : <><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></>
                    }
                  </svg>
                </button>
              </div>
              <p className="text-[10px] text-brand-charcoal-3 mt-1">Minimum 6 characters</p>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-brand-orange hover:bg-brand-orange-hover disabled:opacity-60 text-white text-xs font-bold rounded-xl transition-all shadow-orange flex items-center justify-center gap-2 mt-2 cursor-pointer"
            >
              {isLoading ? (
                <span>Creating Account...</span>
              ) : (
                <span>Create Account</span>
              )}
            </button>
          </form>

          <p className="mt-8 pt-6 border-t border-brand-border text-center text-xs text-brand-charcoal-3">
            Already have an account?{' '}
            <Link href="/signin" className="text-brand-orange hover:text-brand-orange-hover font-semibold transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
