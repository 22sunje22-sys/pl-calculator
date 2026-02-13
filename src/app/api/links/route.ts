import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { logActivity } from "@/lib/activity";
import { getAdminFromRequest } from "@/lib/auth";
import { isAdminEmail } from "@/lib/admins";
import { nanoid } from "nanoid";

const UNAUTHORIZED = NextResponse.json({ error: "Unauthorized" }, { status: 401 });

export async function GET(req: NextRequest) {
  const admin = getAdminFromRequest(req);
  if (!admin || !isAdminEmail(admin)) return UNAUTHORIZED;

  const { data, error } = await supabase
    .from("client_links")
    .select("id, client_name, client_email, slug, config, created_at, is_active")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const admin = getAdminFromRequest(req);
  if (!admin || !isAdminEmail(admin)) return UNAUTHORIZED;

  const body = await req.json();
  const { client_name, client_email, config } = body;

  if (!client_name || !client_email || !config) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const slug = nanoid(10);

  const { data, error } = await supabase
    .from("client_links")
    .insert({
      client_name,
      client_email: client_email.toLowerCase().trim(),
      slug,
      password_hash: "otp-auth",
      config,
    })
    .select("id, client_name, client_email, slug, config, created_at, is_active")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Log proposal creation
  await logActivity(slug, "proposal_created", {
    client_name,
    client_email: client_email.toLowerCase().trim(),
    config,
  });

  return NextResponse.json(data, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const admin = getAdminFromRequest(req);
  if (!admin || !isAdminEmail(admin)) return UNAUTHORIZED;

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  // Get the link info for logging
  const { data: link } = await supabase
    .from("client_links")
    .select("slug, client_name")
    .eq("id", id)
    .single();

  const { error } = await supabase
    .from("client_links")
    .update({ is_active: false })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (link) {
    await logActivity(link.slug, "proposal_deactivated", {
      client_name: link.client_name,
    });
  }

  return NextResponse.json({ success: true });
}
