import crypto from "crypto";

const SECRET = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "fallback-secret";
const TOKEN_TTL = 24 * 60 * 60 * 1000; // 24 hours

export function createAdminToken(email: string): string {
  const timestamp = Date.now().toString();
  const payload = `${email.toLowerCase().trim()}:${timestamp}`;
  const signature = crypto
    .createHmac("sha256", SECRET)
    .update(payload)
    .digest("hex");
  // base64 encode the whole thing
  return Buffer.from(`${payload}:${signature}`).toString("base64");
}

export function verifyAdminToken(token: string): { valid: boolean; email?: string } {
  try {
    const decoded = Buffer.from(token, "base64").toString("utf-8");
    const parts = decoded.split(":");
    if (parts.length !== 3) return { valid: false };

    const [email, timestamp, signature] = parts;
    const payload = `${email}:${timestamp}`;
    const expected = crypto
      .createHmac("sha256", SECRET)
      .update(payload)
      .digest("hex");

    // Timing-safe comparison
    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
      return { valid: false };
    }

    // Check expiration
    const tokenTime = parseInt(timestamp);
    if (Date.now() - tokenTime > TOKEN_TTL) {
      return { valid: false };
    }

    return { valid: true, email };
  } catch {
    return { valid: false };
  }
}

export function getAdminFromRequest(req: Request): string | null {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;

  const token = authHeader.slice(7);
  const result = verifyAdminToken(token);

  if (result.valid && result.email) {
    return result.email;
  }
  return null;
}
