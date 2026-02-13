import { supabase } from "./supabase";

export async function logActivity(
  slug: string,
  action: string,
  details: Record<string, any> = {},
  clientEmail?: string
) {
  try {
    await supabase.from("proposal_activity").insert({
      slug,
      client_email: clientEmail?.toLowerCase().trim() || null,
      action,
      details,
    });
  } catch (err) {
    console.error("Failed to log activity:", err);
  }
}

// Human-readable action descriptions
export function describeAction(action: string, details: Record<string, any> = {}): string {
  switch (action) {
    case "proposal_created":
      return `Proposal created for ${details.client_name || "client"}`;
    case "proposal_deactivated":
      return "Proposal was deactivated by admin";
    case "page_visited":
      return "Opened the proposal link";
    case "otp_requested":
      return "Requested a verification code";
    case "otp_request_failed":
      return `Verification code request failed: ${details.reason || "unknown"}`;
    case "otp_verified":
      return "Successfully verified and accessed the proposal";
    case "otp_failed":
      return "Entered an incorrect verification code";
    case "opened_proposal":
      return "Started viewing the calculator";
    case "changed_events":
      return `Changed events/year to ${details.value}`;
    case "changed_tickets":
      return `Changed tickets/event to ${Number(details.value).toLocaleString()}`;
    case "changed_price":
      return `Changed avg ticket price to ${details.value} AED`;
    case "viewed_section":
      return `Scrolled to ${details.section || "a section"}`;
    case "session_ended":
      return `Finished viewing (${details.duration || "unknown"} on page)`;
    default:
      return action.replace(/_/g, " ");
  }
}

// Format time ago
export function timeAgo(date: string): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return new Date(date).toLocaleDateString();
}
