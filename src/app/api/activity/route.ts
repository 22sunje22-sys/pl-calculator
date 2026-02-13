import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { logActivity } from "@/lib/activity";

// POST - log a new activity event
export async function POST(req: NextRequest) {
  try {
    const { slug, action, details, client_email } = await req.json();

    if (!slug || !action) {
      return NextResponse.json(
        { error: "slug and action are required" },
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

// GET - retrieve activity for admin
export async function GET(req: NextRequest) {
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
