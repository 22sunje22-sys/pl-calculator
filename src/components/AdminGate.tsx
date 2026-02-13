"use client";

import { useState, useEffect } from "react";

interface AdminGateProps {
  onAuthenticated: (email: string) => void;
}

export default function AdminGate({ onAuthenticated }: AdminGateProps) {
  const [step, setStep] = useState<"email" | "otp">("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Check for existing session on mount
  useEffect(() => {
    const saved = sessionStorage.getItem("pl_admin");
    if (saved) {
      onAuthenticated(saved);
    }
  }, [onAuthenticated]);

  const handleSendOTP = async () => {
    if (!email.trim()) {
      setError("Enter your admin email");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(
          res.status === 403
            ? "This email is not authorized for admin access"
            : data.error || "Failed to send code"
        );
      }
      setStep("otp");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp.trim()) {
      setError("Enter the verification code");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), otp: otp.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(
          res.status === 401
            ? "Invalid or expired code"
            : data.error || "Verification failed"
        );
      }
      sessionStorage.setItem("pl_admin", data.email);
      onAuthenticated(data.email);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center p-4">
      <div className="bg-[#111827] rounded-xl border border-[#1e293b] p-8 w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="mb-4">
            <span className="text-2xl font-bold text-white">
              Platinum<span className="text-indigo-400">list</span>
            </span>
          </div>
          <h1 className="text-lg font-bold text-white">
            {step === "email" ? "Admin Login" : "Enter Verification Code"}
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            {step === "email"
              ? "Sign in to manage partner proposals"
              : `We sent a 6-digit code to ${email}`}
          </p>
        </div>

        {step === "email" ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendOTP();
            }}
            className="space-y-4"
          >
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@platinumlist.net"
              className="w-full bg-[#0d1117] border border-[#1e293b] rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500"
              autoFocus
            />

            {error && <p className="text-red-400 text-sm text-center">{error}</p>}

            <button
              type="submit"
              disabled={!email.trim() || loading}
              className="w-full px-4 py-3 bg-indigo-600 rounded-lg text-white font-medium hover:bg-indigo-500 transition disabled:opacity-40"
            >
              {loading ? "Sending..." : "Send Verification Code"}
            </button>
          </form>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleVerifyOTP();
            }}
            className="space-y-4"
          >
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="000000"
              className="w-full bg-[#0d1117] border border-[#1e293b] rounded-lg px-4 py-3 text-white text-center text-2xl tracking-[0.5em] placeholder-gray-600 focus:outline-none focus:border-indigo-500 font-mono"
              maxLength={6}
              autoFocus
            />

            {error && <p className="text-red-400 text-sm text-center">{error}</p>}

            <button
              type="submit"
              disabled={otp.length < 6 || loading}
              className="w-full px-4 py-3 bg-indigo-600 rounded-lg text-white font-medium hover:bg-indigo-500 transition disabled:opacity-40"
            >
              {loading ? "Verifying..." : "Sign In"}
            </button>

            <div className="flex justify-between text-xs">
              <button
                type="button"
                onClick={() => {
                  setStep("email");
                  setOtp("");
                  setError("");
                }}
                className="text-gray-400 hover:text-white transition"
              >
                Change email
              </button>
              <button
                type="button"
                onClick={handleSendOTP}
                disabled={loading}
                className="text-indigo-400 hover:text-indigo-300 transition disabled:opacity-40"
              >
                Resend code
              </button>
            </div>
          </form>
        )}

        <p className="text-xs text-gray-600 text-center mt-6">
          Partner Calculator Admin Panel
        </p>
      </div>
    </div>
  );
}
