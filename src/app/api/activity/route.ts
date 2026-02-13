import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { logActivity } from "@/lib/activity";
import { getAdminFromRequest } from "@/lib/auth";
import { isAdminEmail } from "@/lib/admins";

const UNAUTHORIZED = NextResponse.json({ error: "Unauthorized" }, { status: 401 });

// POST - log a new activity event (called by client-side proposals)
export async function POST(req: NextRequest) {
  try {
    const { slug, action, details, client_email } = await req.json();

    if (!slug || !action) {
      return NextResponse.json(
        { error: "slug and action are required" },
        { status: 400 }
      );
    }

    // Validate that the slug exists and is active (prevents fake activity injection)
    const { data: link, error: linkError } = await supabase
      .from("client_links")
      .select("id, is_active")
      .eq("slug", slug)
      .single();

    if (linkError || !link) {
      return NextResponse.json(
        { error: "Invalid proposal" },
        { status: 404 }
      );
    }

    if (!link.is_active) {
      return NextResponse.json(
        { error: "Proposal is deactivated" },
        { status: 403 }
      );
    }

    // Whitelist allowed client-side actions
    const allowedActions = [
      "opened_proposal",
      "session_ended",
      "changed_events",
      "changed_tickets",
      "changed_price",
    ];

    if (!allowedActions.includes(action)) {
      return NextResponse.json(
        { error: "Invalid action" },
        { status: 400 }
      );
    }

    await logActivity(slug, action, details || {}, client_email);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Activity log error:", err);
    return NextResponse.json(
      { error: "Failed to log activity" },
      { status: 500 }
    );
  }
}

// GET - retrieve activity for admin (requires admin auth)
export async function GET(req: NextRequest) {
  const admin = getAdminFromRequest(req);
  if (!admin || !isAdminEmail(admin)) return UNAUTHORIZED;

  const { searchParams } = new URL(req.url);
  const slug = searchParams.get("slug");
  const limit = parseInt(searchParams.get("limit") || "50");

  let query = supabase
    .from("proposal_activity")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (slug) {
    query = query.eq("slug", slug);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
