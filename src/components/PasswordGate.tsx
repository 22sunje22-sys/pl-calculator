"use client";

import { useState } from "react";

interface PasswordGateProps {
  slug: string;
  onAuthenticated: (data: { client_name: string; config: any }) => void;
}

export default function PasswordGate({ slug, onAuthenticated }: PasswordGateProps) {
  const [step, setStep] = useState<"email" | "otp">("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendOTP = async () => {
    if (!email.trim()) {
      setError("Please enter your email");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, email: email.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(
          res.status === 401
            ? "This email is not authorized for this proposal"
            : res.status === 404
            ? "Proposal not found"
            : res.status === 403
            ? "This proposal has been deactivated"
            : data.error || "Failed to send verification code"
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
      setError("Please enter the verification code");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, email: email.trim(), otp: otp.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(
          res.status === 401
            ? "Invalid or expired verification code"
            : data.error || "Verification failed"
        );
      }
      onAuthenticated(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a1628] flex items-center justify-center p-4">
      <div className="bg-[#0f1d32] rounded-2xl border border-[#1a2d4a] p-8 w-full max-w-sm shadow-2xl shadow-black/40">
        <div className="text-center mb-6">
          <div className="mb-6">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.svg" alt="Platinumlist" className="h-8 mx-auto" />
          </div>
          <h1 className="text-lg font-bold text-white tracking-tight">
            {step === "email" ? "Access Your Proposal" : "Enter Verification Code"}
          </h1>
          <p className="text-sm text-[#667a8a] mt-2">
            {step === "email"
              ? "Enter your email to receive a one-time access code"
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
              placeholder="your@email.com"
              className="w-full bg-[#081220] border border-[#1a2d4a] rounded-lg px-4 py-3 text-white placeholder-[#3a4f66] focus:outline-none focus:border-[#79E2FF] focus:ring-1 focus:ring-[#79E2FF]/30 transition"
              autoFocus
            />

            {error && <p className="text-red-400 text-sm text-center">{error}</p>}

            <button
              type="submit"
              disabled={!email.trim() || loading}
              className="w-full px-4 py-3 bg-[#00A5D3] rounded-lg text-white font-semibold hover:bg-[#79E2FF] hover:text-[#0a1628] transition-all disabled:opacity-40"
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
              className="w-full bg-[#081220] border border-[#1a2d4a] rounded-lg px-4 py-3 text-[#C7F8BA] text-center text-2xl tracking-[0.5em] placeholder-[#3a4f66] focus:outline-none focus:border-[#79E2FF] focus:ring-1 focus:ring-[#79E2FF]/30 font-mono transition"
              maxLength={6}
              autoFocus
            />

            {error && <p className="text-red-400 text-sm text-center">{error}</p>}

            <button
              type="submit"
              disabled={otp.length < 6 || loading}
              className="w-full px-4 py-3 bg-[#00A5D3] rounded-lg text-white font-semibold hover:bg-[#79E2FF] hover:text-[#0a1628] transition-all disabled:opacity-40"
            >
              {loading ? "Verifying..." : "Verify & Access"}
            </button>

            <div className="flex justify-between text-xs">
              <button
                type="button"
                onClick={() => {
                  setStep("email");
                  setOtp("");
                  setError("");
                }}
                className="text-[#667a8a] hover:text-white transition"
              >
                Change email
              </button>
              <button
                type="button"
                onClick={handleSendOTP}
                disabled={loading}
                className="text-[#79E2FF] hover:text-[#C7F8BA] transition disabled:opacity-40"
              >
                Resend code
              </button>
            </div>
          </form>
        )}

        <p className="text-xs text-[#2a3d5a] text-center mt-8">
          Platinumlist for Organisers
        </p>
      </div>
    </div>
  );
}
