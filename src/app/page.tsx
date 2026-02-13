"use client";

import { useState, useCallback } from "react";
import Calculator from "@/components/Calculator";
import CreateLinkModal from "@/components/CreateLinkModal";
import LinkManager from "@/components/LinkManager";
import ActivityLog from "@/components/ActivityLog";
import AdminGate from "@/components/AdminGate";

export default function AdminPage() {
  const [adminEmail, setAdminEmail] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [events, setEvents] = useState(16);
  const [tickets, setTickets] = useState(2500);
  const [price, setPrice] = useState(250);
  const [refreshKey, setRefreshKey] = useState(0);
  const [activeTab, setActiveTab] = useState<
    "calculator" | "links" | "updates"
  >("calculator");

  const handleAuth = useCallback((email: string) => {
    setAdminEmail(email);
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem("pl_admin");
    setAdminEmail(null);
  };

  if (!adminEmail) {
    return <AdminGate onAuthenticated={handleAuth} />;
  }

  return (
    <div className="min-h-screen bg-[#0a1628]">
      {/* Header */}
      <header className="border-b border-[#1a2d4a] bg-[#0f1d32]/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.svg" alt="Platinumlist" className="h-7" />
            <span className="text-xs bg-[#00A5D3]/15 text-[#79E2FF] px-2.5 py-0.5 rounded-full font-medium border border-[#00A5D3]/20">
              Partner Calculator
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex bg-[#081220] rounded-lg border border-[#1a2d4a] p-0.5">
              <button
                onClick={() => setActiveTab("calculator")}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${
                  activeTab === "calculator"
                    ? "bg-[#00A5D3] text-white"
                    : "text-[#667a8a] hover:text-white"
                }`}
              >
                Calculator
              </button>
              <button
                onClick={() => setActiveTab("links")}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${
                  activeTab === "links"
                    ? "bg-[#00A5D3] text-white"
                    : "text-[#667a8a] hover:text-white"
                }`}
              >
                Shared Links
              </button>
              <button
                onClick={() => setActiveTab("updates")}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${
                  activeTab === "updates"
                    ? "bg-[#00A5D3] text-white"
                    : "text-[#667a8a] hover:text-white"
                }`}
              >
                Updates
              </button>
            </div>
            {activeTab === "calculator" && (
              <button
                onClick={() => setShowModal(true)}
                className="px-4 py-2 bg-[#00A5D3] rounded-lg text-white text-sm font-semibold hover:bg-[#79E2FF] hover:text-[#0a1628] transition-all"
              >
                Generate Client Link
              </button>
            )}
            <div className="flex items-center gap-2 ml-2 pl-2 border-l border-[#1a2d4a]">
              <span className="text-xs text-[#4a6070] hidden sm:inline">
                {adminEmail}
              </span>
              <button
                onClick={handleLogout}
                className="text-xs text-[#667a8a] hover:text-red-400 transition px-2 py-1 rounded border border-[#1a2d4a] hover:border-red-900/50"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {activeTab === "calculator" ? (
          <CalculatorWrapper
            events={events}
            tickets={tickets}
            price={price}
            onEventsChange={setEvents}
            onTicketsChange={setTickets}
            onPriceChange={setPrice}
          />
        ) : activeTab === "links" ? (
          <div className="bg-[#0f1d32] rounded-2xl border border-[#1a2d4a] p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <span className="text-[#79E2FF]">&#128279;</span> Shared Client
              Links
            </h3>
            <LinkManager key={refreshKey} />
          </div>
        ) : (
          <div className="bg-[#0f1d32] rounded-2xl border border-[#1a2d4a] p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <span className="text-[#79E2FF]">↗</span> Client Activity
            </h3>
            <p className="text-sm text-[#667a8a] mb-6">
              Track how clients interact with their proposals — who opened, what
              they explored, and where they stopped.
            </p>
            <ActivityLog key={refreshKey} />
          </div>
        )}
      </main>

      {showModal && (
        <CreateLinkModal
          config={{ events, ticketsPerEvent: tickets, avgTicketPrice: price }}
          onClose={() => setShowModal(false)}
          onCreated={() => setRefreshKey((k) => k + 1)}
        />
      )}
    </div>
  );
}

function CalculatorWrapper({
  events,
  tickets,
  price,
  onEventsChange,
  onTicketsChange,
  onPriceChange,
}: {
  events: number;
  tickets: number;
  price: number;
  onEventsChange: (v: number) => void;
  onTicketsChange: (v: number) => void;
  onPriceChange: (v: number) => void;
}) {
  return (
    <Calculator
      initialEvents={events}
      initialTickets={tickets}
      initialPrice={price}
    />
  );
}
