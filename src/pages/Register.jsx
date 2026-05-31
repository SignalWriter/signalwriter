import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Sparkles } from "lucide-react";

export default function Register() {
  const [step, setStep] = useState("register");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      await base44.auth.register({ email, password });
      setStep("otp");
    } catch (err) {
      setError(err.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await base44.auth.verifyOtp({ email, otpCode });
      base44.auth.setToken(result.access_token);
      window.location.href = "/";
    } catch (err) {
      setError(err.message || "Invalid code.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      await base44.auth.resendOtp(email);
    } catch {}
  };

  const handleGoogleLogin = () => {
    base44.auth.loginWithProvider("google", window.location.origin + "/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-background">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-6 h-6 text-primary" />
          </div>
          <h1 className="font-display text-2xl text-foreground">Create Account</h1>
          <p className="text-sm text-muted-foreground mt-1">Start preserving what matters</p>
        </div>

        {step === "register" ? (
          <>
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="bg-card/50" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="bg-card/50" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm">Confirm Password</Label>
                <Input id="confirm" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className="bg-card/50" />
              </div>
              {error && <p className="text-xs text-destructive">{error}</p>}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create Account"}
              </Button>
            </form>
            <Button variant="outline" className="w-full" onClick={handleGoogleLogin}>
              Continue with Google
            </Button>
          </>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <p className="text-sm text-muted-foreground text-center">
              Enter the verification code sent to {email}
            </p>
            <Input value={otpCode} onChange={(e) => setOtpCode(e.target.value)} placeholder="Enter code" className="text-center bg-card/50" required />
            {error && <p className="text-xs text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Verify"}
            </Button>
            <button type="button" onClick={handleResendOtp} className="text-xs text-muted-foreground hover:text-foreground w-full text-center">
              Resend code
            </button>
          </form>
        )}

        <div className="text-center text-sm">
          <Link to="/login" className="text-muted-foreground hover:text-foreground transition-colors">
            Already have an account? Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}