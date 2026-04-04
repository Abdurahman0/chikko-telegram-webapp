import { NextRequest } from "next/server";
import { forwardTelegramRequest } from "@/lib/api/telegram-proxy";

export async function POST(request: NextRequest) {
  const query = request.nextUrl.searchParams.toString();
  const suffix = query.length > 0 ? `?${query}` : "";
  const body = await request.text();
  return forwardTelegramRequest({
    request,
    backendPath: `/api/integrations/telegram/webapp/checkout/${suffix}`,
    method: "POST",
    body,
  });
}
