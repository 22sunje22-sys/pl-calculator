import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  const { slug, password } = await req.json();

  if (!slug || !password) {
    return NextResponse.json({ error: "Missing slug or password" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("client_links")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Link not found" }, { status: 404 });
  }

  const valid = await bcrypt.compare(password, data.password_hash);
  if (!valid) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }

  // Log access
  await supabase.from("link_access_logs").insert({
    link_id: data.id,
    ip_address: req.headers.get("x-forwarded-for") || "unknown",
  });

  return NextResponse.json({
    client_name: data.client_name,
    config: data.config,
  });
}
