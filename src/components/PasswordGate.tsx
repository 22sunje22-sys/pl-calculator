"use client";

import { useState } from "react";

interface PasswordGateProps {
  slug: string;
  onAuthenticated: (data: { client_name: string; config: any }) => void;
}

export default function PasswordGate({ slug, onAuthenticated }: PasswordGateProps) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, password }),
      });

      if (res.ok) {
        const data = await res.json();
        onAuthenticated(data);
      } else if (res.status === 401) {
        setError("Invalid password. Please try again.");
      } else if (res.status === 404) {
        setError("This link is no longer active.");
      } else {
        setError("Something went wrong. Please try again.");
      }
    } catch {
      setError("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center p-4">
      <div className="bg-[#111827] rounded-xl border border-[#1e293b] p-8 w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-indigo-900/40 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🔒</span>
          </div>
          <h1 className="text-xl font-bold text-white">
            Partnership Calculator
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Enter your access password to view
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Access password"
            className="w-full bg-[#0d1117] border border-[#1e293b] rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500"
            autoFocus
          />

          {error && (
            <p className="text-red-400 text-sm text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={!password || loading}
            className="w-full px-4 py-3 bg-indigo-600 rounded-lg text-white font-medium hover:bg-indigo-500 transition disabled:opacity-40"
          >
            {loading ? "Verifying..." : "Access Calculator"}
          </button>
        </form>

        <p className="text-xs text-gray-600 text-center mt-6">
          Powered by Platinumlist
        </p>
      </div>
    </div>
  );
}
