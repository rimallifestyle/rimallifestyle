"use client"

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Store, Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck, KeyRound, ArrowLeft, RefreshCw, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { signIn, getSession } from 'next-auth/react'

type AuthMode = 'login' | 'otp' | 'forgot_email' | 'forgot_otp'

export function LoginScreen({ onSuccess }: { onSuccess: () => void }) {
  const [mode, setMode] = useState<AuthMode>('login')
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [maskedEmail, setMaskedEmail] = useState('')
  const [otp, setOtp] = useState('')
  
  // Forgot password fields
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showNewPassword, setShowNewPassword] = useState(false)

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Resend cooldown timer
  const [countdown, setCountdown] = useState(0)

  useEffect(() => {
    let timer: any
    if (countdown > 0) {
      timer = setInterval(() => setCountdown(prev => prev - 1), 1000)
    }
    return () => clearInterval(timer)
  }, [countdown])

  // Step 1: Submit Credentials
  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    
    try {
      const res = await fetch('/api/admin/auth/send-login-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.message || 'Invalid credentials or access denied.')
        setIsSubmitting(false)
        return
      }

      if (data.requires2FA) {
        setMaskedEmail(data.maskedEmail || email)
        setMode('otp')
        setCountdown(60)
        toast.success(`Verification code sent to ${data.maskedEmail}!`)
        setIsSubmitting(false)
        return
      }

      // If SMTP is not set up yet or 2FA bypassed
      const result = await signIn("credentials", {
        redirect: false,
        email: email.trim(),
        password,
      })

      if (result?.error) {
        setError(result.error)
        setIsSubmitting(false)
      } else {
        const session = await getSession()
        if ((session?.user as any)?.role?.toLowerCase() !== 'admin') {
          setError('Access denied: Administrator permissions required.')
          setIsSubmitting(false)
          return
        }
        toast.success('Successfully logged in!')
        onSuccess()
      }
    } catch {
      setError('An error occurred. Please check your connection.')
      setIsSubmitting(false)
    }
  }

  // Step 2: Verify 2FA OTP
  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!otp.trim() || otp.trim().length !== 6) {
      setError('Please enter the full 6-digit verification code.')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const res = await fetch('/api/admin/auth/verify-login-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), otp: otp.trim() }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.message || 'Invalid or expired verification code.')
        setIsSubmitting(false)
        return
      }

      // Complete NextAuth session
      const result = await signIn("credentials", {
        redirect: false,
        email: email.trim(),
        password,
      })

      if (result?.error) {
        setError(result.error)
        setIsSubmitting(false)
        return
      }

      toast.success('Identity verified! Welcome back.')
      onSuccess()
    } catch {
      setError('Failed to complete verification.')
      setIsSubmitting(false)
    }
  }

  // Resend OTP
  const handleResendOTP = async () => {
    if (countdown > 0) return
    setIsSubmitting(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/auth/send-login-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      })
      if (res.ok) {
        setCountdown(60)
        toast.success('A new verification code has been sent!')
      } else {
        const d = await res.json()
        setError(d.message || 'Failed to resend code')
      }
    } catch {
      setError('Failed to resend code')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Step 3: Request Forgot Password
  const handleForgotPasswordRequest = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid administrator email.')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.message || 'Failed to send password reset code.')
        setIsSubmitting(false)
        return
      }

      toast.success('Password reset code sent to your email!')
      setMode('forgot_otp')
      setCountdown(60)
    } catch {
      setError('Failed to send reset code.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Step 4: Submit Reset Password with OTP
  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!otp.trim() || otp.trim().length !== 6) {
      setError('Please enter the 6-digit reset code.')
      return
    }
    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters.')
      return
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          otp: otp.trim(),
          newPassword,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.message || 'Failed to reset password.')
        setIsSubmitting(false)
        return
      }

      toast.success('Password updated successfully! Please sign in with your new password.')
      setPassword(newPassword)
      setOtp('')
      setNewPassword('')
      setConfirmPassword('')
      setMode('login')
    } catch {
      setError('Failed to reset password.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen w-full flex bg-[#050000]">
      
      {/* Left Side: Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 relative z-10">
        
        {/* Animated Background Gradients */}
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-red-900/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-amber-900/10 rounded-full blur-[100px] pointer-events-none" />

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-[420px]"
        >
          {/* Logo & Header */}
          <div className="mb-8 text-center lg:text-left">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-white/5 border border-white/10 shadow-[0_0_15px_rgba(255,255,255,0.05)] mb-6">
              {mode === 'otp' ? (
                <ShieldCheck className="w-6 h-6 text-gold" />
              ) : mode.startsWith('forgot') ? (
                <KeyRound className="w-6 h-6 text-gold" />
              ) : (
                <Store className="w-6 h-6 text-[#C52A35]" />
              )}
            </div>
            
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
              {mode === 'otp' 
                ? 'Security Verification'
                : mode === 'forgot_email' 
                ? 'Forgot Password'
                : mode === 'forgot_otp'
                ? 'Create New Password'
                : 'Welcome back'}
            </h1>
            
            <p className="text-white/50 text-sm sm:text-base">
              {mode === 'otp'
                ? `Enter the 6-digit 2FA login code sent to ${maskedEmail}`
                : mode === 'forgot_email'
                ? 'Enter your administrator email to receive a password reset code.'
                : mode === 'forgot_otp'
                ? 'Enter the 6-digit code from your email and set your new password.'
                : 'Sign in to Rimal Storefront admin panel to manage your business.'}
            </p>
          </div>

          {/* Error Banner */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-[#C52A35]/10 border border-[#C52A35]/50 text-[#ff8a93] px-4 py-3 rounded-xl text-sm mb-5"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* MODE 1: CREDENTIALS LOGIN */}
          {mode === 'login' && (
            <form onSubmit={handleCredentialsSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-white/80 pl-1">Email or Username</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/40 group-focus-within:text-[#C52A35] transition-colors">
                    <Mail className="w-5 h-5" />
                  </div>
                  <input 
                    type="text" 
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@rimalstore.com"
                    className="w-full h-12 pl-12 pr-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-white/20 focus:outline-none focus:border-[#C52A35]/50 focus:bg-white/10 transition-all shadow-[0_4px_30px_rgba(0,0,0,0.1)] backdrop-blur-sm"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between pl-1 pr-1">
                  <label className="text-sm font-medium text-white/80">Password</label>
                  <button 
                    type="button"
                    onClick={() => {
                      setError(null)
                      setMode('forgot_email')
                    }}
                    className="text-xs font-medium text-[#C52A35] hover:text-white transition-colors cursor-pointer"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/40 group-focus-within:text-[#C52A35] transition-colors">
                    <Lock className="w-5 h-5" />
                  </div>
                  <input 
                    type={showPassword ? 'text' : 'password'} 
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full h-12 pl-12 pr-12 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-white/20 focus:outline-none focus:border-[#C52A35]/50 focus:bg-white/10 transition-all shadow-[0_4px_30px_rgba(0,0,0,0.1)] backdrop-blur-sm"
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-white/40 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="group relative w-full h-12 bg-gradient-to-r from-[#7A1111] to-[#550000] rounded-2xl text-white font-semibold flex items-center justify-center overflow-hidden transition-all hover:shadow-[0_0_30px_rgba(122,17,17,0.4)] disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Verifying Credentials...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 z-10">
                      <span>Sign In to Dashboard</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* MODE 2: 2FA OTP VERIFICATION */}
          {mode === 'otp' && (
            <form onSubmit={handleVerifyOTP} className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest font-semibold text-gold block text-center">
                  6-Digit Verification Code
                </label>
                <input 
                  type="text" 
                  maxLength={6}
                  required
                  autoFocus
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="000000"
                  className="w-full h-14 text-center text-2xl font-mono font-bold tracking-[0.45em] bg-white/5 border border-gold/40 rounded-2xl text-gold focus:outline-none focus:border-gold focus:bg-white/10 transition-all shadow-[0_0_20px_rgba(212,175,55,0.15)]"
                />
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting || otp.length !== 6}
                className="w-full h-12 bg-gold text-black rounded-2xl font-bold flex items-center justify-center gap-2 transition-all hover:bg-gold/90 disabled:opacity-50 cursor-pointer shadow-lg"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Validating Code...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Verify &amp; Enter Dashboard</span>
                  </>
                )}
              </button>

              <div className="flex items-center justify-between text-xs pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setError(null)
                    setOtp('')
                    setMode('login')
                  }}
                  className="text-white/60 hover:text-white flex items-center gap-1 transition cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to password</span>
                </button>

                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={countdown > 0 || isSubmitting}
                  className="text-gold hover:text-cream disabled:opacity-40 transition cursor-pointer flex items-center gap-1"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${countdown > 0 ? 'animate-spin' : ''}`} />
                  <span>{countdown > 0 ? `Resend code (${countdown}s)` : 'Resend Code'}</span>
                </button>
              </div>
            </form>
          )}

          {/* MODE 3: FORGOT PASSWORD - EMAIL */}
          {mode === 'forgot_email' && (
            <form onSubmit={handleForgotPasswordRequest} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-white/80 pl-1">Admin Email</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/40 group-focus-within:text-[#C52A35] transition-colors">
                    <Mail className="w-5 h-5" />
                  </div>
                  <input 
                    type="email" 
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@rimalstore.com"
                    className="w-full h-12 pl-12 pr-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-white/20 focus:outline-none focus:border-[#C52A35]/50 focus:bg-white/10 transition-all"
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full h-12 bg-gradient-to-r from-[#7A1111] to-[#550000] rounded-2xl text-white font-semibold flex items-center justify-center gap-2 hover:shadow-[0_0_20px_rgba(122,17,17,0.5)] transition-all cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Sending Reset Code...</span>
                  </>
                ) : (
                  <span>Send Reset Code</span>
                )}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setError(null)
                    setMode('login')
                  }}
                  className="text-xs text-white/60 hover:text-white flex items-center justify-center gap-1 mx-auto transition cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Return to Sign In</span>
                </button>
              </div>
            </form>
          )}

          {/* MODE 4: FORGOT PASSWORD - RESET OTP & NEW PASSWORD */}
          {mode === 'forgot_otp' && (
            <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs uppercase tracking-widest font-semibold text-gold block text-center">
                  6-Digit Reset Code
                </label>
                <input 
                  type="text" 
                  maxLength={6}
                  required
                  autoFocus
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="000000"
                  className="w-full h-12 text-center text-xl font-mono font-bold tracking-[0.4em] bg-white/5 border border-gold/40 rounded-xl text-gold focus:outline-none focus:border-gold focus:bg-white/10 transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-white/80 pl-1">New Password</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-white/40">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input 
                    type={showNewPassword ? 'text' : 'password'} 
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full h-11 pl-10 pr-10 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-gold"
                  />
                  <button 
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-white/40 hover:text-white"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-white/80 pl-1">Confirm New Password</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-white/40">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input 
                    type={showNewPassword ? 'text' : 'password'} 
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat new password"
                    className="w-full h-11 pl-10 pr-10 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-gold"
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full h-12 bg-gold text-black rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gold/90 transition-all cursor-pointer shadow-lg disabled:opacity-50 mt-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Updating Password...</span>
                  </>
                ) : (
                  <span>Reset &amp; Save Password</span>
                )}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setError(null)
                    setMode('login')
                  }}
                  className="text-xs text-white/60 hover:text-white flex items-center justify-center gap-1 mx-auto transition cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Cancel and back to login</span>
                </button>
              </div>
            </form>
          )}

        </motion.div>
      </div>

      {/* Right Side: Visual/Image Branding */}
      <div className="hidden lg:block lg:w-1/2 relative overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center transform scale-105"
          style={{ 
            backgroundImage: 'url("https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?q=80&w=2070&auto=format&fit=crop")',
          }}
        />
        <div className="absolute inset-0 bg-[#050000]/60 mix-blend-multiply" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#050000] via-[#050000]/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050000] via-transparent to-transparent" />

        <div className="absolute inset-0 flex flex-col justify-end p-12">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="max-w-md"
          >
            <div className="glass-card rounded-3xl p-8 border-white/10 shadow-2xl backdrop-blur-md">
              <div className="flex gap-1 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg key={star} className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-lg font-medium text-white/90 leading-relaxed mb-6 italic">
                "Since switching to Rimal&apos;s premium dashboard, managing our fashion store has become incredibly fast and efficient. The UI is absolutely stunning."
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white/10">
                  <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&auto=format&fit=crop" alt="User" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Sarah Jenkins</h4>
                  <p className="text-xs text-white/50">Founder, Loom &amp; Stitch</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
      
    </div>
  )
}
