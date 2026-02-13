"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
import PasswordGate from "@/components/PasswordGate";
import Calculator from "@/components/Calculator";

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins < 60) return `${mins}m ${secs}s`;
  const hrs = Math.floor(mins / 60);
  return `${hrs}h ${mins % 60}m`;
}

export default function ClientPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [authenticated, setAuthenticated] = useState(false);
  const [clientData, setClientData] = useState<{
    client_name: string;
    config: { events: number; ticketsPerEvent: number; avgTicketPrice: number };
  } | null>(null);
  const sessionStart = useRef<number>(0);
  const lastActivity = useRef<Record<string, any>>({});

  // Track activity helper - debounces duplicate actions
  const trackActivity = useCallback(
    (action: string, details: Record<string, any> = {}) => {
      // Avoid logging duplicate slider values
      const key = `${action}-${JSON.stringify(details)}`;
      if (lastActivity.current[action] === key) return;
      lastActivity.current[action] = key;

      fetch("/api/activity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, action, details }),
      }).catch(() => {});
    },
    [slug]
  );

  // Track session end on unmount/close
  useEffect(() => {
    if (!authenticated) return;

    sessionStart.current = Date.now();

    const handleEnd = () => {
      const duration = formatDuration(
        Math.floor((Date.now() - sessionStart.current) / 1000)
      );
      // Use sendBeacon for reliability on page close
      const body = JSON.stringify({
        slug,
        action: "session_ended",
        details: { duration },
      });
      navigator.sendBeacon("/api/activity", body);
    };

    window.addEventListener("beforeunload", handleEnd);
    return () => {
      window.removeEventListener("beforeunload", handleEnd);
      handleEnd();
    };
  }, [authenticated, slug]);

  if (!authenticated || !clientData) {
    return (
      <PasswordGate
        slug={slug}
        onAuthenticated={(data) => {
          setClientData(data);
          setAuthenticated(true);
          // Log proposal opened
          fetch("/api/activity", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              slug,
              action: "opened_proposal",
              details: { client_name: data.client_name, config: data.config },
            }),
          }).catch(() => {});
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#0a1628]">
      <header className="border-b border-[#1a2d4a] bg-[#0f1d32]/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.svg" alt="Platinumlist" className="h-7" />
            <span className="text-xs bg-[#00A5D3]/15 text-[#79E2FF] px-2.5 py-0.5 rounded-full font-medium border border-[#00A5D3]/20">
              Partnership Proposal
            </span>
          </div>
          <span className="text-sm text-[#667a8a]">
            Prepared for{" "}
            <span className="text-white font-medium">
              {clientData.client_name}
            </span>
          </span>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <Calculator
          initialEvents={clientData.config.events}
          initialTickets={clientData.config.ticketsPerEvent}
          initialPrice={clientData.config.avgTicketPrice}
          clientName={clientData.client_name}
          onActivity={trackActivity}
        />
      </main>

      <footer className="text-center py-8 text-xs text-[#2a3d5a]">
        Powered by Platinumlist
      </footer>
    </div>
  );
}
