"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import PasswordGate from "@/components/PasswordGate";
import Calculator from "@/components/Calculator";

export default function ClientPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [authenticated, setAuthenticated] = useState(false);
  const [clientData, setClientData] = useState<{
    client_name: string;
    config: { events: number; ticketsPerEvent: number; avgTicketPrice: number };
  } | null>(null);

  if (!authenticated || !clientData) {
    return (
      <PasswordGate
        slug={slug}
        onAuthenticated={(data) => {
          setClientData(data);
          setAuthenticated(true);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0e1a]">
      <header className="border-b border-[#1e293b] bg-[#111827]/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl font-bold text-white">
              Platinum<span className="text-indigo-400">list</span>
            </span>
            <span className="text-xs bg-indigo-900/50 text-indigo-300 px-2 py-0.5 rounded-full">
              Partnership Proposal
            </span>
          </div>
          <span className="text-sm text-gray-400">
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
        />
      </main>

      <footer className="text-center py-8 text-xs text-gray-600">
        Powered by Platinumlist
      </footer>
    </div>
  );
}
