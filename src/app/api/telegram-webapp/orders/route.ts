import { NextRequest } from "next/server";
import { forwardTelegramRequest } from "@/lib/api/telegram-proxy";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.toString();
  const suffix = query.length > 0 ? `?${query}` : "";

  return forwardTelegramRequest({
    request,
    backendPath: `/api/integrations/telegram/webapp/orders/${suffix}`,
    method: "GET",
  });
}
