"use client";

import { useState } from "react";

interface CreateLinkModalProps {
  config: { events: number; ticketsPerEvent: number; avgTicketPrice: number };
  onClose: () => void;
  onCreated: () => void;
}

export default function CreateLinkModal({
  config,
  onClose,
  onCreated,
}: CreateLinkModalProps) {
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [createdSlug, setCreatedSlug] = useState<string | null>(null);
  const [error, setError] = useState("");

  const handleCreate = async () => {
    if (!clientName || !clientEmail) {
      setError("Client name and email are required");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clientEmail.trim())) {
      setError("Please enter a valid email address");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_name: clientName,
          client_email: clientEmail.trim(),
          config,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setCreatedSlug(data.slug);
        onCreated();
      } else {
        setError(data.error || "Failed to create link");
      }
    } catch {
      setError("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fullUrl = typeof window !== "undefined"
    ? `${window.location.origin}/c/${createdSlug}`
    : "";

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-[#111827] rounded-xl border border-[#1e293b] p-6 w-full max-w-md">
        {!createdSlug ? (
          <>
            <h3 className="text-lg font-bold text-white mb-4">
              Generate Client Proposal
            </h3>
            <p className="text-sm text-gray-400 mb-6">
              Save this calculator configuration and send a personalized
              proposal link to your client. They&apos;ll verify access via email OTP.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Client / Company Name
                </label>
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="e.g. Dubai Events Corp"
                  className="w-full bg-[#0d1117] border border-[#1e293b] rounded-lg px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Client Email
                </label>
                <input
                  type="email"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  placeholder="client@company.com"
                  className="w-full bg-[#0d1117] border border-[#1e293b] rounded-lg px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  A one-time code will be sent here for verification
                </p>
              </div>

              <div className="bg-[#0d1117] rounded-lg p-3 border border-[#1e293b]">
                <p className="text-xs text-gray-400 mb-2">
                  Configuration snapshot:
                </p>
                <div className="text-xs text-gray-300 space-y-1">
                  <p>Events/Year: {config.events}</p>
                  <p>Tickets/Event: {config.ticketsPerEvent.toLocaleString()}</p>
                  <p>Avg Price: {config.avgTicketPrice} AED</p>
                </div>
              </div>

              {error && <p className="text-red-400 text-sm">{error}</p>}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2.5 border border-[#1e293b] rounded-lg text-gray-400 hover:text-white hover:border-gray-600 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={!clientName || !clientEmail || loading}
                className="flex-1 px-4 py-2.5 bg-indigo-600 rounded-lg text-white font-medium hover:bg-indigo-500 transition disabled:opacity-40"
              >
                {loading ? "Creating..." : "Create Proposal"}
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-900/40 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-green-400 text-2xl">&#10003;</span>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">
                Proposal Created!
              </h3>
              <p className="text-sm text-gray-400 mb-4">
                Share this link with{" "}
                <span className="text-indigo-400">{clientName}</span>
              </p>
            </div>

            <div className="bg-[#0d1117] rounded-lg p-3 border border-[#1e293b] mb-4">
              <p className="text-xs text-gray-400 mb-1">Proposal Link:</p>
              <p className="text-sm text-indigo-400 break-all font-mono">
                {fullUrl}
              </p>
            </div>

            <div className="bg-[#0d1117] rounded-lg p-3 border border-[#1e293b] mb-4">
              <p className="text-xs text-gray-400 mb-1">Client Email:</p>
              <p className="text-sm text-white font-mono">
                {clientEmail.toLowerCase().trim()}
              </p>
            </div>

            <p className="text-xs text-gray-500 mb-4">
              When the client opens the link, they will enter their email and
              receive a one-time verification code to access the calculator.
            </p>

            <button
              onClick={() => {
                navigator.clipboard.writeText(fullUrl);
              }}
              className="w-full px-4 py-2.5 bg-indigo-600 rounded-lg text-white font-medium hover:bg-indigo-500 transition mb-3"
            >
              Copy Link
            </button>

            <button
              onClick={onClose}
              className="w-full px-4 py-2.5 border border-[#1e293b] rounded-lg text-gray-400 hover:text-white transition"
            >
              Close
            </button>
          </>
        )}
      </div>
    </div>
  );
}
