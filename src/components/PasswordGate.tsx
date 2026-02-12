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
    <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center p-4">
      <div className="bg-[#111827] rounded-xl border border-[#1e293b] p-8 w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-indigo-900/40 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">{step === "email" ? "\u2709\uFE0F" : "\u{1F510}"}</span>
          </div>
          <h1 className="text-xl font-bold text-white">
            {step === "email" ? "Access Your Proposal" : "Enter Verification Code"}
          </h1>
          <p className="text-sm text-gray-400 mt-1">
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
          Powered by Platinumlist
        </p>
      </div>
    </div>
  );
}
