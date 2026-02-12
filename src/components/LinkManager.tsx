"use client";

import { useEffect, useState } from "react";

interface Link {
  id: string;
  client_name: string;
  slug: string;
  config: { events: number; ticketsPerEvent: number; avgTicketPrice: number };
  created_at: string;
  is_active: boolean;
}

export default function LinkManager() {
  const [links, setLinks] = useState<Link[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLinks = async () => {
    setLoading(true);
    const res = await fetch("/api/links");
    const data = await res.json();
    setLinks(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchLinks();
  }, []);

  const handleDeactivate = async (id: string) => {
    await fetch(`/api/links?id=${id}`, { method: "DELETE" });
    fetchLinks();
  };

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";

  if (loading) {
    return (
      <div className="text-center py-8 text-gray-500">Loading links...</div>
    );
  }

  if (links.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-sm">
          No client links created yet. Use the calculator above and click
          &quot;Generate Client Link&quot; to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-gray-400 text-xs uppercase">
            <th className="text-left py-3 px-4">Client</th>
            <th className="text-left py-3 px-4">Link</th>
            <th className="text-center py-3 px-4">Events</th>
            <th className="text-center py-3 px-4">Tickets</th>
            <th className="text-center py-3 px-4">Price</th>
            <th className="text-center py-3 px-4">Created</th>
            <th className="text-center py-3 px-4">Status</th>
            <th className="text-center py-3 px-4">Actions</th>
          </tr>
        </thead>
        <tbody>
          {links.map((link) => (
            <tr key={link.id} className="border-t border-[#1e293b]">
              <td className="py-3 px-4 text-white font-medium">
                {link.client_name}
              </td>
              <td className="py-3 px-4">
                <button
                  onClick={() =>
                    navigator.clipboard.writeText(
                      `${baseUrl}/c/${link.slug}`
                    )
                  }
                  className="text-indigo-400 hover:text-indigo-300 text-xs font-mono truncate max-w-[180px] block"
                  title={`${baseUrl}/c/${link.slug}`}
                >
                  /c/{link.slug}
                </button>
              </td>
              <td className="text-center py-3 px-4 text-gray-300">
                {link.config.events}
              </td>
              <td className="text-center py-3 px-4 text-gray-300">
                {link.config.ticketsPerEvent.toLocaleString()}
              </td>
              <td className="text-center py-3 px-4 text-gray-300">
                {link.config.avgTicketPrice} AED
              </td>
              <td className="text-center py-3 px-4 text-gray-400 text-xs">
                {new Date(link.created_at).toLocaleDateString()}
              </td>
              <td className="text-center py-3 px-4">
                <span
                  className={`text-xs px-2 py-0.5 rounded ${
                    link.is_active
                      ? "bg-green-900/40 text-green-400"
                      : "bg-red-900/40 text-red-400"
                  }`}
                >
                  {link.is_active ? "Active" : "Disabled"}
                </span>
              </td>
              <td className="text-center py-3 px-4">
                {link.is_active && (
                  <button
                    onClick={() => handleDeactivate(link.id)}
                    className="text-xs text-red-400 hover:text-red-300"
                  >
                    Deactivate
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
