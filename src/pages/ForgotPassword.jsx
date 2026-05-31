import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Sparkles } from "lucide-react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await base44.auth.resetPasswordRequest(email);
    } catch {}
    setSent(true);
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-background">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-6 h-6 text-primary" />
          </div>
          <h1 className="font-display text-2xl text-foreground">Reset Password</h1>
          <p className="text-sm text-muted-foreground mt-1">We'll send you a reset link</p>
        </div>

        {sent ? (
          <div className="text-center space-y-4">
            <p className="text-sm text-muted-foreground">If an account exists with that email, you'll receive a reset link shortly.</p>
            <Link to="/login" className="text-sm text-primary hover:text-primary/80 transition-colors">
              Back to sign in
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="bg-card/50" />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Send Reset Link"}
            </Button>
            <Link to="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors block text-center">
              Back to sign in
            </Link>
          </form>
        )}
      </div>
    </div>
  );
}