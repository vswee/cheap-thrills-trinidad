import { NextResponse } from "next/server";

export const runtime = "nodejs";

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char] ?? char);
}

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  const ownOrigin = new URL(request.url).origin;
  if (origin && new URL(origin).origin !== ownOrigin) return NextResponse.json({ error: "Invalid origin" }, { status: 403 });

  const length = Number(request.headers.get("content-length") ?? 0);
  if (length > 2500) return NextResponse.json({ error: "Report too long" }, { status: 413 });
  let body: { message?: unknown; page?: unknown; website?: unknown };
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid request" }, { status: 400 }); }
  if (typeof body.website === "string" && body.website.trim()) return NextResponse.json({ ok: true });
  const message = typeof body.message === "string" ? body.message.trim() : "";
  const page = typeof body.page === "string" ? body.page.trim() : "";
  if (message.length < 8 || message.length > 700 || page.length > 300) return NextResponse.json({ error: "Please check the report and try again" }, { status: 400 });
  if (page && (!page.startsWith("https://") || !/^https:\/\//i.test(page))) return NextResponse.json({ error: "Invalid page link" }, { status: 400 });

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return NextResponse.json({ error: "Report service unavailable" }, { status: 503 });
  const text = `<b>Cheap Thrills Trinidad · issue report</b>\n\n${escapeHtml(message)}${page ? `\n\n<a href="${escapeHtml(page)}">Reported page</a>` : ""}`;
  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML", disable_web_page_preview: true }),
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) return NextResponse.json({ error: "Telegram did not accept the report" }, { status: 502 });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Could not deliver the report" }, { status: 502 });
  }
}
