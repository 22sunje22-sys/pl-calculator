"use client";

import { useState, useCallback } from "react";
import Calculator from "@/components/Calculator";
import CreateLinkModal from "@/components/CreateLinkModal";
import LinkManager from "@/components/LinkManager";
import AdminGate from "@/components/AdminGate";

export default function AdminPage() {
  const [adminEmail, setAdminEmail] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [events, setEvents] = useState(16);
  const [tickets, setTickets] = useState(2500);
  const [price, setPrice] = useState(250);
  const [refreshKey, setRefreshKey] = useState(0);
  const [activeTab, setActiveTab] = useState<"calculator" | "links">(
    "calculator"
  );

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
    <div className="min-h-screen bg-[#0a0e1a]">
      {/* Header */}
      <header className="border-b border-[#1e293b] bg-[#111827]/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl font-bold text-white">
              Platinum<span className="text-indigo-400">list</span>
            </span>
            <span className="text-xs bg-indigo-900/50 text-indigo-300 px-2 py-0.5 rounded-full">
              Partner Calculator
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex bg-[#0d1117] rounded-lg border border-[#1e293b] p-0.5">
              <button
                onClick={() => setActiveTab("calculator")}
                className={`px-4 py-1.5 rounded-md text-sm transition ${
                  activeTab === "calculator"
                    ? "bg-indigo-600 text-white"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Calculator
              </button>
              <button
                onClick={() => setActiveTab("links")}
                className={`px-4 py-1.5 rounded-md text-sm transition ${
                  activeTab === "links"
                    ? "bg-indigo-600 text-white"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Shared Links
              </button>
            </div>
            {activeTab === "calculator" && (
              <button
                onClick={() => setShowModal(true)}
                className="px-4 py-2 bg-indigo-600 rounded-lg text-white text-sm font-medium hover:bg-indigo-500 transition"
              >
                Generate Client Link
              </button>
            )}
            <div className="flex items-center gap-2 ml-2 pl-2 border-l border-[#1e293b]">
              <span className="text-xs text-gray-500 hidden sm:inline">
                {adminEmail}
              </span>
              <button
                onClick={handleLogout}
                className="text-xs text-gray-400 hover:text-red-400 transition px-2 py-1 rounded border border-[#1e293b] hover:border-red-900/50"
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
        ) : (
          <div className="bg-[#111827] rounded-xl border border-[#1e293b] p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <span className="text-indigo-400">&#128279;</span> Shared Client
              Links
            </h3>
            <LinkManager key={refreshKey} />
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
