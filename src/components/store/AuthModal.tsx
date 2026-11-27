import { useState } from "react";
import { signIn } from "next-auth/react";
import { X, Mail, Lock, User, ArrowLeft, KeyRound, Loader2, ShieldCheck } from "lucide-react";
import bannerImg from "@/assets/banner-1.jpg";
import { toast } from "sonner";

interface AuthModalProps {
  onComplete: (data: { name: string; email: string }) => void;
  onCancel: () => void;
}

type ModalView = "login" | "register" | "register_otp" | "forgot_email" | "forgot_otp";

export function AuthModal({ onComplete, onCancel }: AuthModalProps) {
  const [view, setView] = useState<ModalView>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  
  // Forgot password
  const [resetOtp, setResetOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // 1. Verify Registration OTP
  const handleRegisterOTPVerification = async (otpValue: string) => {
    setError("");
    if (!otpValue.trim() || otpValue.length !== 6) {
      setError("Please enter the 6-digit OTP code.");
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), password, otp: otpValue.trim() }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.message || "Invalid or expired OTP code.");
        setIsLoading(false);
        return;
      }

      toast.success("Account created successfully!");

      // Auto sign in
      const result = await signIn("credentials", {
        redirect: false,
        email: email.trim(),
        password,
      });

      if (result?.error) {
        setError(result.error);
      } else {
        const resolvedName = name || email.split("@")[0];
        onComplete({ name: resolvedName, email: email.trim() });
      }
    } catch {
      setError("An error occurred during registration.");
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Submit Main Form (Login / Register / Register OTP)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (view === "register_otp") {
      await handleRegisterOTPVerification(otp);
      return;
    }

    if (view === "register" && !name.trim()) {
      setError("Please enter your name.");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }
    if (view !== "forgot_email" && (!password.trim() || password.length < 6)) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setIsLoading(true);
    try {
      if (view === "register") {
        // Send OTP via SMTP
        const res = await fetch("/api/auth/send-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: email.trim() }),
        });

        const data = await res.json();
        if (!res.ok) {
          setError(data.message || "Failed to send verification code.");
          setIsLoading(false);
          return;
        }

        toast.success(`Verification code sent to ${email}!`);
        setView("register_otp");
        setError("");
        setIsLoading(false);
        return;
      }

      // Login Flow
      const result = await signIn("credentials", {
        redirect: false,
        email: email.trim(),
        password,
      });

      if (result?.error) {
        setError(result.error);
      } else {
        toast.success("Logged in successfully!");
        const resolvedName = name || email.split("@")[0];
        onComplete({ name: resolvedName, email: email.trim() });
      }
    } catch {
      setError("An error occurred. Please check your connection.");
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Request Password Reset OTP
  const handleForgotRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email.trim() || !email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Failed to send reset code.");
        setIsLoading(false);
        return;
      }

      toast.success("Password reset code sent to your email!");
      setView("forgot_otp");
    } catch {
      setError("Failed to send reset code.");
    } finally {
      setIsLoading(false);
    }
  };

  // 4. Submit Reset Password
  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!resetOtp.trim() || resetOtp.trim().length !== 6) {
      setError("Please enter the 6-digit reset code.");
      return;
    }
    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          otp: resetOtp.trim(),
          newPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Failed to reset password.");
        setIsLoading(false);
        return;
      }

      toast.success("Password reset successfully! Please sign in with your new password.");
      setPassword(newPassword);
      setResetOtp("");
      setNewPassword("");
      setConfirmPassword("");
      setView("login");
    } catch {
      setError("Failed to reset password.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = (provider: string) => {
    signIn(provider.toLowerCase(), { callbackUrl: "/" });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
      <div className="bg-card w-full max-w-[900px] min-h-[550px] rounded-[1.5rem] md:rounded-[2rem] border border-border shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden animate-in zoom-in-95 duration-300 flex relative">
        
        {/* Close Button */}
        <button
          onClick={onCancel}
          aria-label="Close"
          className="absolute top-4 right-4 z-50 text-muted-foreground hover:text-foreground transition bg-secondary/80 hover:bg-secondary p-2 rounded-full backdrop-blur-sm cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Left Side: Brand Imagery */}
        <div className="hidden md:flex md:w-1/2 relative bg-secondary overflow-hidden">
          <img
            src={(bannerImg as any).src || bannerImg}
            alt="Rimal Collection"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

          <div className="relative z-10 flex flex-col justify-end p-10 h-full w-full">
            <h1 className="font-display text-4xl leading-[1.1] text-white tracking-wide uppercase">
              Elevate.
              <br />
              Your.
              <br />
              Style.
            </h1>
            <p className="text-white/80 mt-4 text-sm font-medium">
              Discover the latest premium collections tailored for your modern lifestyle.
            </p>
          </div>
        </div>

        {/* Right Side: Authentication Forms */}
        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center relative bg-card">
          
          <div className="text-center mb-6">
            <h2 className="font-display text-3xl md:text-4xl text-gold uppercase tracking-widest mb-2">
              Rimal
            </h2>
            <h3 className="font-display text-2xl text-cream uppercase">
              {view === "register_otp"
                ? "Verify Email"
                : view === "forgot_email" || view === "forgot_otp"
                ? "Reset Password"
                : view === "login"
                ? "Welcome Back"
                : "Join the Club"}
            </h3>
            <p className="text-muted-foreground text-xs sm:text-sm mt-1.5 font-medium">
              {view === "register_otp"
                ? `Enter the 6-digit code sent to ${email}`
                : view === "forgot_email"
                ? "Enter your email to receive a password reset verification code."
                : view === "forgot_otp"
                ? `Enter the 6-digit code sent to ${email} and your new password.`
                : view === "login"
                ? "Enter your email and password to access your account."
                : "Create an account for a seamless checkout experience."}
            </p>
          </div>

          {/* VIEW: FORGOT PASSWORD - ENTER EMAIL */}
          {view === "forgot_email" && (
            <form onSubmit={handleForgotRequest} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">
                  Account Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your registered email"
                    className="w-full bg-secondary/50 border border-border/50 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-gold focus:border-gold transition-all text-foreground"
                  />
                </div>
              </div>

              {error && <p className="text-red-400 text-xs font-medium bg-red-400/10 rounded-xl px-4 py-2.5">{error}</p>}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 bg-gold text-background font-bold uppercase tracking-widest text-xs rounded-xl hover:bg-cream transition-colors active:scale-[0.98] mt-2 disabled:opacity-70 flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Send Reset Code"}
              </button>

              <button
                type="button"
                onClick={() => { setView("login"); setError(""); }}
                className="w-full text-center text-xs text-muted-foreground hover:text-white transition-colors flex items-center justify-center gap-1.5 pt-2 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to Sign In</span>
              </button>
            </form>
          )}

          {/* VIEW: FORGOT PASSWORD - ENTER OTP & NEW PASSWORD */}
          {view === "forgot_otp" && (
            <form onSubmit={handleResetSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-gold mb-1 uppercase tracking-wider text-center">
                  6-Digit Reset Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  required
                  autoFocus
                  value={resetOtp}
                  onChange={(e) => setResetOtp(e.target.value.replace(/\D/g, ""))}
                  placeholder="000000"
                  className="w-full bg-secondary/50 border border-gold/40 rounded-xl px-4 py-2.5 text-center tracking-[0.45em] text-lg font-bold font-mono focus:outline-none focus:border-gold text-gold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wider">
                  New Password
                </label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full bg-secondary/50 border border-border/50 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-gold text-foreground"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wider">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                  className="w-full bg-secondary/50 border border-border/50 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-gold text-foreground"
                />
              </div>

              {error && <p className="text-red-400 text-xs font-medium bg-red-400/10 rounded-xl px-4 py-2.5">{error}</p>}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 bg-gold text-background font-bold uppercase tracking-widest text-xs rounded-xl hover:bg-cream transition-colors active:scale-[0.98] mt-2 disabled:opacity-70 flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Reset & Save Password"}
              </button>

              <button
                type="button"
                onClick={() => { setView("login"); setError(""); }}
                className="w-full text-center text-xs text-muted-foreground hover:text-white transition-colors flex items-center justify-center gap-1.5 pt-1 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Cancel &amp; Back to Login</span>
              </button>
            </form>
          )}

          {/* VIEW: LOGIN & REGISTER & REGISTER OTP */}
          {(view === "login" || view === "register" || view === "register_otp") && (
            <form onSubmit={handleSubmit} className="space-y-4">
              {view === "register_otp" ? (
                <div>
                  <label className="block text-xs font-semibold text-gold mb-2 uppercase tracking-widest text-center">
                    6-Digit Verification Code
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    autoFocus
                    value={otp}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "");
                      setOtp(val);
                      if (val.length === 6) {
                        handleRegisterOTPVerification(val);
                      }
                    }}
                    placeholder="000000"
                    className="w-full bg-secondary/50 border border-gold/40 rounded-xl px-4 py-3 text-center tracking-[0.5em] text-xl font-bold font-mono focus:outline-none focus:border-gold transition-all text-gold shadow-[0_0_20px_rgba(212,175,55,0.15)]"
                  />
                </div>
              ) : (
                <>
                  {view === "register" && (
                    <div>
                      <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. John Doe"
                        className="w-full bg-secondary/50 border border-border/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-gold focus:border-gold transition-all text-foreground placeholder:text-muted-foreground/50"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="w-full bg-secondary/50 border border-border/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-gold focus:border-gold transition-all text-foreground placeholder:text-muted-foreground/50"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">
                      Password
                    </label>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-secondary/50 border border-border/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-gold focus:border-gold transition-all text-foreground placeholder:text-muted-foreground/50"
                    />
                  </div>

                  {view === "login" && (
                    <div className="flex items-center justify-between mt-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          defaultChecked
                          className="w-3.5 h-3.5 rounded border-border bg-secondary accent-gold"
                        />
                        <span className="text-xs font-medium text-muted-foreground">Remember me</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => { setView("forgot_email"); setError(""); }}
                        className="text-xs font-medium text-gold hover:underline cursor-pointer"
                      >
                        Forgot Password?
                      </button>
                    </div>
                  )}
                </>
              )}

              {error && <p className="text-red-400 text-xs font-medium pt-2 bg-red-400/10 rounded-xl px-4 py-2.5">{error}</p>}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 bg-gold text-background font-bold uppercase tracking-widest text-xs rounded-xl hover:bg-cream transition-colors active:scale-[0.98] mt-4 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{view === "register_otp" ? "Verifying..." : view === "register" ? "Sending Code..." : "Signing In..."}</span>
                  </>
                ) : view === "register_otp" ? (
                  "Verify & Complete Signup"
                ) : view === "login" ? (
                  "Sign In"
                ) : (
                  "Sign Up"
                )}
              </button>
              
              {view === "register_otp" && (
                <button
                  type="button"
                  onClick={() => { setView("register"); setError(""); }}
                  className="w-full text-center text-xs font-medium text-muted-foreground hover:text-gold transition-colors mt-2 cursor-pointer"
                >
                  Change email or back to registration
                </button>
              )}
            </form>
          )}

          {/* Social Logins - Only for Login and Register views */}
          {(view === "login" || view === "register") && (
            <>
              <div className="mt-4 mb-4 relative flex items-center justify-center">
                <span className="absolute inset-x-0 h-px bg-border/60"></span>
                <span className="relative bg-card px-2 text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">
                  Or
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleSocialLogin("Google")}
                  className="w-full h-10 rounded-xl bg-white text-black font-semibold text-xs flex items-center justify-center gap-2 transition-transform active:scale-[0.98] shadow-sm hover:bg-white/90 cursor-pointer"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  <span>Google</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSocialLogin("Facebook")}
                  className="w-full h-10 rounded-xl bg-[#1877F2] text-white font-semibold text-xs flex items-center justify-center gap-2 transition-transform active:scale-[0.98] shadow-sm hover:bg-[#1877F2]/90 cursor-pointer"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M24 12.07C24 5.41 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.04V9.41c0-3.02 1.8-4.7 4.54-4.7 1.31 0 2.68.24 2.68.24v2.95h-1.5c-1.5 0-1.96.93-1.96 1.89v2.26h3.32l-.53 3.5h-2.8V24C19.62 23.1 24 18.1 24 12.07z"/>
                  </svg>
                  <span>Facebook</span>
                </button>
              </div>

              <div className="mt-6 text-center text-xs font-medium text-muted-foreground">
                {view === "login" ? "Don't have an account? " : "Already have an account? "}
                <button
                  type="button"
                  onClick={() => {
                    setView(view === "login" ? "register" : "login");
                    setError("");
                  }}
                  className="text-gold hover:text-cream transition-colors font-bold ml-1 cursor-pointer"
                >
                  {view === "login" ? "Sign up" : "Log in"}
                </button>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
}
