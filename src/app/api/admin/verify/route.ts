import { NextRequest, NextResponse } from "next/server";
import { supabase, supabaseAuth } from "@/lib/supabase";
import { isAdminEmail } from "@/lib/admins";
import { createAdminToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { email, otp } = await req.json();

  if (!email || !otp) {
    return NextResponse.json(
      { error: "Email and verification code are required" },
      { status: 400 }
    );
  }

  if (!isAdminEmail(email)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { error } = await supabaseAuth.auth.verifyOtp({
    email: email.toLowerCase().trim(),
    token: otp,
    type: "email",
  });

  if (error) {
    console.error("Admin OTP verify error:", error);
    return NextResponse.json(
      { error: "Invalid or expired verification code" },
      { status: 401 }
    );
  }

  // Generate signed admin token
  const adminToken = createAdminToken(email);

  // Log admin login
  try {
    await supabase.from("link_access_logs").insert({
      link_id: null,
      ip_address: req.headers.get("x-forwarded-for") || "unknown",
    });
  } catch {
    // ignore if table doesn't exist
  }

  return NextResponse.json({
    success: true,
    email: email.toLowerCase().trim(),
    token: adminToken,
  });
}
