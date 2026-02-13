"use client";

import { useState, useEffect } from "react";
import {
  calculateFinancials,
  getOptimizationBenchmarks,
  TIERS,
} from "@/lib/tiers";

interface CalculatorProps {
  initialEvents?: number;
  initialTickets?: number;
  initialPrice?: number;
  readOnly?: boolean;
  clientName?: string;
  onActivity?: (action: string, details: Record<string, any>) => void;
}

export default function Calculator({
  initialEvents = 16,
  initialTickets = 2500,
  initialPrice = 250,
  readOnly = false,
  clientName,
  onActivity,
}: CalculatorProps) {
  const [events, setEvents] = useState(initialEvents);
  const [tickets, setTickets] = useState(initialTickets);
  const [price, setPrice] = useState(initialPrice);

  // Track slider changes with debounce
  useEffect(() => {
    if (events === initialEvents) return;
    const t = setTimeout(() => {
      onActivity?.("changed_events", { value: events, initial: initialEvents });
    }, 800);
    return () => clearTimeout(t);
  }, [events, initialEvents, onActivity]);

  useEffect(() => {
    if (tickets === initialTickets) return;
    const t = setTimeout(() => {
      onActivity?.("changed_tickets", { value: tickets, initial: initialTickets });
    }, 800);
    return () => clearTimeout(t);
  }, [tickets, initialTickets, onActivity]);

  useEffect(() => {
    if (price === initialPrice) return;
    const t = setTimeout(() => {
      onActivity?.("changed_price", { value: price, initial: initialPrice });
    }, 800);
    return () => clearTimeout(t);
  }, [price, initialPrice, onActivity]);

  const fin = calculateFinancials(events, tickets, price);
  const benchmarks = getOptimizationBenchmarks(events, tickets, price);

  const tierIndex = TIERS.findIndex((t) => t.name === fin.tierName);

  return (
    <div className="space-y-6">
      {clientName && (
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-white">
            Partnership Calculator
          </h2>
          <p className="text-[#667a8a] mt-1">
            Prepared for{" "}
            <span className="text-[#79E2FF] font-semibold">{clientName}</span>
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Organizer Profile */}
        <div className="bg-[#0f1d32] rounded-xl border border-[#1a2d4a] p-6">
          <div className="flex items-center gap-2 mb-6">
            <span className="text-[#79E2FF]">✦</span>
            <h3 className="text-white font-semibold">Organizer Profile</h3>
          </div>

          <div className="space-y-5">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-[#667a8a]">Planned Events per Year</span>
                <span className="text-white font-bold text-lg">{events}</span>
              </div>
              <input
                type="range"
                min={1}
                max={50}
                value={events}
                onChange={(e) => setEvents(Number(e.target.value))}
                disabled={readOnly}
                className="w-full h-2 bg-[#1a2d4a] rounded-lg appearance-none cursor-pointer accent-[#79E2FF]"
              />
              <div className="flex justify-between text-xs text-[#4a6070] mt-1">
                {TIERS.map((t, i) => (
                  <span
                    key={t.name}
                    className={
                      tierIndex === i
                        ? "text-[#79E2FF] font-bold"
                        : "text-[#4a6070]"
                    }
                  >
                    {t.name} ({t.minEvents > 0 ? t.minEvents + "+" : "0-2"})
                  </span>
                ))}
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-[#667a8a]">Expected Tickets/Event</span>
                <span className="text-white font-semibold">
                  {tickets.toLocaleString()}
                </span>
              </div>
              <input
                type="range"
                min={100}
                max={50000}
                step={100}
                value={tickets}
                onChange={(e) => setTickets(Number(e.target.value))}
                disabled={readOnly}
                className="w-full h-2 bg-[#1a2d4a] rounded-lg appearance-none cursor-pointer accent-[#79E2FF]"
              />
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-[#667a8a]">Avg Ticket Price (AED)</span>
                <span className="text-white font-semibold">{price} AED</span>
              </div>
              <input
                type="range"
                min={10}
                max={5000}
                step={10}
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                disabled={readOnly}
                className="w-full h-2 bg-[#1a2d4a] rounded-lg appearance-none cursor-pointer accent-[#79E2FF]"
              />
            </div>
          </div>

          {fin.eventsToNextTier > 0 && fin.nextTierName && (
            <div className="mt-6 bg-[#00A5D3]/10 border border-[#00A5D3]/30 rounded-lg p-4">
              <p className="text-xs text-[#79E2FF] uppercase font-bold tracking-wider mb-1">
                Efficiency Hack
              </p>
              <p className="text-sm text-[#8a9bae]">
                Plan{" "}
                <span className="text-[#79E2FF] font-bold underline">
                  {fin.eventsToNextTier} more events
                </span>{" "}
                this year to unlock{" "}
                <span className="underline">{fin.nextTierName} rates</span> and
                increase your marketing credits.
              </p>
            </div>
          )}
        </div>

        {/* Fee Cards */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Bank Fee */}
            <div className="bg-[#0f1d32] rounded-xl border border-[#1a2d4a] p-5">
              <p className="text-xs text-[#667a8a] uppercase tracking-wider mb-1">
                Fixed External Cost
              </p>
              <p className="text-sm text-[#8a9bae] font-medium mb-3">
                Bank Transaction Fee
              </p>
              <p className="text-4xl font-bold text-white">
                {fin.bankFee.toFixed(1)}%
              </p>
              <p className="text-xs text-[#4a6070] mt-2">
                Passed directly to processing banks.
              </p>
            </div>

            {/* PL Fee */}
            <div className="bg-[#0f1d32] rounded-xl border border-[#C7F8BA]/30 p-5">
              <p className="text-xs text-[#667a8a] uppercase tracking-wider mb-1">
                Optimized Partner Cost
              </p>
              <p className="text-sm text-[#8a9bae] font-medium mb-3">
                PL Service Fee
              </p>
              <p className="text-4xl font-bold text-[#C7F8BA]">
                {fin.plFee.toFixed(2)}%
              </p>
              <div className="flex gap-2 mt-2">
                <span className="text-xs bg-[#C7F8BA]/10 text-[#C7F8BA]/80 px-2 py-0.5 rounded">
                  {fin.tierName}
                </span>
                <span className="text-xs text-[#C7F8BA] uppercase">
                  Volume Discount Applied
                </span>
              </div>
            </div>
          </div>

          {/* Effective Rate */}
          <div className="bg-gradient-to-r from-[#0f1d32] to-[#132240] rounded-xl border border-[#1a2d4a] p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="text-xl font-bold text-white">
                  Effective Partner Rate
                </h3>
                <p className="text-sm text-[#667a8a]">
                  Your net ticketing cost after reinvested credits.
                </p>
              </div>
              <div className="text-right">
                <p className="text-5xl font-bold text-[#C7F8BA]">
                  {fin.effectiveRate.toFixed(2)}%
                </p>
                <p className="text-xs text-[#C7F8BA]/80 uppercase tracking-wider mt-1">
                  Net Rate Per Ticket
                </p>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Marketing Credits */}
              <div className="bg-[#081220] rounded-lg p-4 border border-[#1a2d4a]">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[#FFD666]">✿</span>
                  <span className="text-sm text-[#8a9bae] font-medium">
                    Marketing Credits Earned
                  </span>
                </div>
                <p className="text-3xl font-bold text-[#FFD666]">
                  {fin.marketingCredit.toFixed(2)}%
                </p>
                <p className="text-xs text-[#4a6070] mt-2">
                  *Credits are applied exclusively to internal marketing
                  packages (Email blasts, Social Media features, etc) for your
                  next event.
                </p>
              </div>

              {/* Breakdown */}
              <div className="bg-[#081220] rounded-lg p-4 border border-[#1a2d4a]">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-[#667a8a]">Gross Fee</span>
                    <span className="text-sm text-white font-semibold">
                      {fin.grossFee.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-[#667a8a]">
                      Marketing Reinvestment
                    </span>
                    <span className="text-sm text-[#C7F8BA] font-semibold">
                      -{fin.marketingCredit.toFixed(2)}%
                    </span>
                  </div>
                  <div className="border-t border-[#1a2d4a] pt-2 flex justify-between">
                    <span className="text-sm text-white font-bold">
                      Net Efficiency
                    </span>
                    <span className="text-sm text-[#C7F8BA] font-bold">
                      {fin.effectiveRate.toFixed(2)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 bg-[#00A5D3] text-center rounded-lg py-2">
              <p className="text-xs text-white font-semibold uppercase tracking-widest">
                The more you organize, the higher your visibility, the lower
                your net cost.
              </p>
            </div>
          </div>

          {/* Revenue Projection */}
          <div className="bg-[#0f1d32] rounded-xl border border-[#1a2d4a] p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <span className="text-[#79E2FF]">₿</span> Revenue Projection
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-xs text-[#667a8a] uppercase mb-1">
                  Total GMV
                </p>
                <p className="text-xl font-bold text-white">
                  {(fin.totalRevenue / 1e6).toFixed(1)}M
                </p>
                <p className="text-xs text-[#4a6070]">AED</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-[#667a8a] uppercase mb-1">
                  Effective Fees
                </p>
                <p className="text-xl font-bold text-[#FFD666]">
                  {(fin.totalFees / 1e6).toFixed(2)}M
                </p>
                <p className="text-xs text-[#4a6070]">AED</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-[#667a8a] uppercase mb-1">
                  Marketing Credits
                </p>
                <p className="text-xl font-bold text-[#C7F8BA]">
                  {(fin.marketingCreditValue / 1e3).toFixed(0)}K
                </p>
                <p className="text-xs text-[#4a6070]">AED</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Optimization Benchmarks */}
      <div className="bg-[#0f1d32] rounded-xl border border-[#1a2d4a] p-6">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <span className="text-[#79E2FF]">↗</span> Optimization Benchmarks
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[#667a8a] text-xs uppercase">
                <th className="text-left py-3 px-4">Volume Level</th>
                <th className="text-center py-3 px-4">Tier</th>
                <th className="text-center py-3 px-4">PL Service Fee</th>
                <th className="text-center py-3 px-4">Marketing Credit</th>
                <th className="text-center py-3 px-4">Effective Rate</th>
              </tr>
            </thead>
            <tbody>
              {benchmarks.map((b, i) => (
                <tr
                  key={i}
                  className={`border-t border-[#1a2d4a] ${
                    i === 0 ? "bg-[#081220]" : ""
                  }`}
                >
                  <td className="py-4 px-4">
                    <span
                      className={`${
                        i === 0 ? "text-white font-bold" : "text-[#8a9bae]"
                      }`}
                    >
                      {b.label}
                    </span>
                  </td>
                  <td className="text-center py-4 px-4">
                    <span
                      className={`font-bold ${
                        i === 0 ? "text-[#79E2FF]" : "text-[#8a9bae]"
                      }`}
                    >
                      {b.tierName}
                    </span>
                  </td>
                  <td className="text-center py-4 px-4 text-[#8a9bae]">
                    {b.plFee.toFixed(2)}%
                  </td>
                  <td className="text-center py-4 px-4 text-[#8a9bae]">
                    {b.marketingCredit.toFixed(2)}%
                  </td>
                  <td className="text-center py-4 px-4">
                    <span
                      className={`font-bold ${
                        i === 0 ? "text-[#C7F8BA]" : "text-[#8a9bae]"
                      }`}
                    >
                      {b.effectiveRate.toFixed(2)}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
