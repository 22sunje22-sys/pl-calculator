import { NextRequest, NextResponse } from "next/server";
import { supabase, supabaseAuth } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  const { slug, email, otp } = await req.json();

  if (!slug || !email || !otp) {
    return NextResponse.json(
      { error: "Slug, email, and OTP code are required" },
      { status: 400 }
    );
  }

  // Look up the link
  const { data: link, error: linkError } = await supabase
    .from("client_links")
    .select("*")
    .eq("slug", slug)
    .single();

  if (linkError || !link) {
    return NextResponse.json({ error: "Proposal not found" }, { status: 404 });
  }

  if (!link.is_active) {
    return NextResponse.json(
      { error: "This proposal has been deactivated" },
      { status: 403 }
    );
  }

  // Verify email matches
  if (link.client_email?.toLowerCase() !== email.toLowerCase().trim()) {
    return NextResponse.json(
      { error: "Email does not match" },
      { status: 401 }
    );
  }

  // Verify OTP via Supabase Auth
  const { error: otpError } = await supabaseAuth.auth.verifyOtp({
    email: email.toLowerCase().trim(),
    token: otp,
    type: "email",
  });

  if (otpError) {
    console.error("OTP verify error:", otpError);
    return NextResponse.json(
      { error: "Invalid or expired verification code" },
      { status: 401 }
    );
  }

  // Log access
  await supabase.from("link_access_logs").insert({
    link_id: link.id,
    ip_address: req.headers.get("x-forwarded-for") || "unknown",
  });

  return NextResponse.json({
    client_name: link.client_name,
    config: link.config,
  });
}
