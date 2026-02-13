import { NextRequest, NextResponse } from "next/server";
import { supabaseAuth } from "@/lib/supabase";
import { isAdminEmail } from "@/lib/admins";

export async function POST(req: NextRequest) {
  const { email } = await req.json();

  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  if (!isAdminEmail(email)) {
    return NextResponse.json(
      { error: "This email is not authorized for admin access" },
      { status: 403 }
    );
  }

  const { error } = await supabaseAuth.auth.signInWithOtp({
    email: email.toLowerCase().trim(),
    options: { shouldCreateUser: true },
  });

  if (error) {
    console.error("Admin OTP send error:", error);
    return NextResponse.json(
      { error: "Failed to send verification code" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
