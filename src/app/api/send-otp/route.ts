import { NextRequest, NextResponse } from "next/server";
import { supabase, supabaseAuth } from "@/lib/supabase";
import { logActivity } from "@/lib/activity";

export async function POST(req: NextRequest) {
  const { slug, email } = await req.json();

  if (!slug || !email) {
    return NextResponse.json(
      { error: "Slug and email are required" },
      { status: 400 }
    );
  }

  // Look up the link by slug
  const { data: link, error: linkError } = await supabase
    .from("client_links")
    .select("*")
    .eq("slug", slug)
    .single();

  if (linkError || !link) {
    await logActivity(slug, "otp_request_failed", {
      reason: "Proposal not found",
      email: email.toLowerCase().trim(),
    }, email);
    return NextResponse.json({ error: "Proposal not found" }, { status: 404 });
  }

  if (!link.is_active) {
    await logActivity(slug, "otp_request_failed", {
      reason: "Proposal deactivated",
      email: email.toLowerCase().trim(),
    }, email);
    return NextResponse.json(
      { error: "This proposal has been deactivated" },
      { status: 403 }
    );
  }

  // Verify the email matches the one on file
  if (link.client_email?.toLowerCase() !== email.toLowerCase().trim()) {
    await logActivity(slug, "otp_request_failed", {
      reason: "Unauthorized email",
      attempted_email: email.toLowerCase().trim(),
    }, email);
    return NextResponse.json(
      { error: "This email is not authorized for this proposal" },
      { status: 401 }
    );
  }

  // Send OTP via Supabase Auth
  const { error: otpError } = await supabaseAuth.auth.signInWithOtp({
    email: email.toLowerCase().trim(),
    options: {
      shouldCreateUser: true,
    },
  });

  if (otpError) {
    console.error("OTP send error:", otpError);
    await logActivity(slug, "otp_request_failed", {
      reason: otpError.message,
      email: email.toLowerCase().trim(),
    }, email);
    return NextResponse.json(
      { error: "Failed to send verification code. Please try again." },
      { status: 500 }
    );
  }

  // Log successful OTP request
  await logActivity(slug, "otp_requested", {
    client_name: link.client_name,
    email: email.toLowerCase().trim(),
  }, email);

  return NextResponse.json({ success: true });
}
