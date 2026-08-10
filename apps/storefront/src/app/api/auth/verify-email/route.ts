import { NextResponse } from "next/server";
import { consumeEmailVerificationToken } from "@/lib/auth/verify-token";

export const runtime = "nodejs";

// GET so the link in the email is directly clickable.
export async function GET(req: Request) {
  const url = new URL(req.url);
  const token = url.searchParams.get("token") ?? "";
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? url.origin;
  if (!token) {
    return NextResponse.redirect(new URL("/verify-email?status=missing", site));
  }
  const result = await consumeEmailVerificationToken(token);
  if (!result.ok) {
    return NextResponse.redirect(
      new URL(`/verify-email?status=fail&reason=${encodeURIComponent(result.reason)}`, site),
    );
  }
  return NextResponse.redirect(new URL("/verify-email?status=ok", site));
}
