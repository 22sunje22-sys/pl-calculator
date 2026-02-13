"use client";

import { useEffect, useState } from "react";
import { describeAction, timeAgo } from "@/lib/activity";

interface Activity {
  id: string;
  slug: string;
  client_email: string | null;
  action: string;
  details: Record<string, any>;
  created_at: string;
}

interface GroupedSession {
  slug: string;
  client_name: string;
  client_email: string;
  activities: Activity[];
  lastActivity: string;
  hasOpened: boolean;
  sessionDuration: string | null;
}

// Action icons and colors
function actionIcon(action: string): { icon: string; color: string } {
  switch (action) {
    case "proposal_created":
      return { icon: "✦", color: "text-[#79E2FF]" };
    case "proposal_deactivated":
      return { icon: "✕", color: "text-red-400" };
    case "otp_requested":
      return { icon: "✉", color: "text-[#FFD666]" };
    case "otp_request_failed":
      return { icon: "⚠", color: "text-red-400" };
    case "otp_verified":
      return { icon: "✓", color: "text-[#C7F8BA]" };
    case "otp_failed":
      return { icon: "✕", color: "text-red-400" };
    case "opened_proposal":
      return { icon: "👁", color: "text-[#79E2FF]" };
    case "changed_events":
    case "changed_tickets":
    case "changed_price":
      return { icon: "⟡", color: "text-[#FFD666]" };
    case "session_ended":
      return { icon: "◉", color: "text-[#667a8a]" };
    default:
      return { icon: "•", color: "text-[#667a8a]" };
  }
}

export default function ActivityLog() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedSlug, setExpandedSlug] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "opened" | "not_opened">("all");

  useEffect(() => {
    fetch("/api/activity?limit=500")
      .then((r) => r.json())
      .then((data) => {
        setActivities(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="text-center py-8 text-[#4a6070]">
        Loading activity...
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-[#4a6070] text-sm">
          No activity recorded yet. Activity will appear here when clients
          interact with their proposals.
        </p>
      </div>
    );
  }

  // Group activities by slug into sessions
  const sessionsMap = new Map<string, GroupedSession>();

  activities.forEach((a) => {
    if (!sessionsMap.has(a.slug)) {
      sessionsMap.set(a.slug, {
        slug: a.slug,
        client_name:
          a.details?.client_name || a.details?.client_email || a.slug,
        client_email: a.client_email || a.details?.email || a.details?.client_email || "",
        activities: [],
        lastActivity: a.created_at,
        hasOpened: false,
        sessionDuration: null,
      });
    }
    const session = sessionsMap.get(a.slug)!;
    session.activities.push(a);

    // Track metadata
    if (a.action === "opened_proposal" || a.action === "otp_verified") {
      session.hasOpened = true;
    }
    if (a.action === "session_ended" && a.details?.duration) {
      session.sessionDuration = a.details.duration;
    }
    if (a.details?.client_name && a.details.client_name !== a.slug) {
      session.client_name = a.details.client_name;
    }
    if (a.client_email) {
      session.client_email = a.client_email;
    } else if (a.details?.email) {
      session.client_email = a.details.email;
    } else if (a.details?.client_email) {
      session.client_email = a.details.client_email;
    }
  });

  let sessions = Array.from(sessionsMap.values()).sort(
    (a, b) =>
      new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime()
  );

  // Apply filter
  if (filter === "opened") {
    sessions = sessions.filter((s) => s.hasOpened);
  } else if (filter === "not_opened") {
    sessions = sessions.filter((s) => !s.hasOpened);
  }

  return (
    <div className="space-y-4">
      {/* Filter tabs */}
      <div className="flex gap-2 mb-4">
        {(["all", "opened", "not_opened"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 text-xs rounded-lg font-medium transition ${
              filter === f
                ? "bg-[#00A5D3] text-white"
                : "bg-[#081220] text-[#667a8a] border border-[#1a2d4a] hover:text-white"
            }`}
          >
            {f === "all"
              ? `All (${Array.from(sessionsMap.values()).length})`
              : f === "opened"
              ? `Opened (${
                  Array.from(sessionsMap.values()).filter((s) => s.hasOpened)
                    .length
                })`
              : `Not opened (${
                  Array.from(sessionsMap.values()).filter((s) => !s.hasOpened)
                    .length
                })`}
          </button>
        ))}
      </div>

      {sessions.length === 0 && (
        <p className="text-[#4a6070] text-sm text-center py-8">
          No proposals match this filter.
        </p>
      )}

      {/* Session cards */}
      {sessions.map((session) => {
        const isExpanded = expandedSlug === session.slug;
        // Determine last meaningful client action
        const clientActions = session.activities.filter(
          (a) =>
            a.action !== "proposal_created" &&
            a.action !== "proposal_deactivated"
        );
        const lastClientAction =
          clientActions.length > 0 ? clientActions[0] : null;

        return (
          <div
            key={session.slug}
            className="bg-[#081220] rounded-xl border border-[#1a2d4a] overflow-hidden"
          >
            {/* Summary row */}
            <button
              onClick={() =>
                setExpandedSlug(isExpanded ? null : session.slug)
              }
              className="w-full px-5 py-4 flex items-center gap-4 hover:bg-[#0f1d32]/50 transition text-left"
            >
              {/* Status indicator */}
              <div
                className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                  session.hasOpened ? "bg-[#C7F8BA]" : "bg-[#4a6070]"
                }`}
              />

              {/* Client info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-white font-semibold text-sm truncate">
                    {session.client_name}
                  </span>
                  {session.sessionDuration && (
                    <span className="text-xs bg-[#1a2d4a] text-[#8a9bae] px-2 py-0.5 rounded">
                      {session.sessionDuration}
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#4a6070] truncate">
                  {session.client_email}
                </p>
              </div>

              {/* Last action summary */}
              <div className="text-right flex-shrink-0 hidden sm:block">
                <p className="text-xs text-[#8a9bae]">
                  {lastClientAction
                    ? describeAction(
                        lastClientAction.action,
                        lastClientAction.details
                      )
                    : "Proposal sent"}
                </p>
                <p className="text-xs text-[#4a6070] mt-0.5">
                  {timeAgo(session.lastActivity)}
                </p>
              </div>

              {/* Expand arrow */}
              <span
                className={`text-[#4a6070] text-sm transition-transform ${
                  isExpanded ? "rotate-180" : ""
                }`}
              >
                ▾
              </span>
            </button>

            {/* Expanded timeline */}
            {isExpanded && (
              <div className="border-t border-[#1a2d4a] px-5 py-4">
                <div className="relative">
                  {/* Timeline line */}
                  <div className="absolute left-[7px] top-2 bottom-2 w-px bg-[#1a2d4a]" />

                  {/* Timeline items - reversed to show oldest first */}
                  <div className="space-y-3">
                    {[...session.activities].reverse().map((a) => {
                      const { icon, color } = actionIcon(a.action);
                      return (
                        <div key={a.id} className="flex items-start gap-3 relative">
                          <span
                            className={`${color} text-sm w-4 text-center flex-shrink-0 z-10 bg-[#081220]`}
                          >
                            {icon}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-[#8a9bae]">
                              {describeAction(a.action, a.details)}
                            </p>
                            <p className="text-xs text-[#4a6070] mt-0.5">
                              {new Date(a.created_at).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
