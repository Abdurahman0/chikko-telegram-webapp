import { NextRequest } from "next/server";
import { forwardTelegramRequest } from "@/lib/api/telegram-proxy";

export async function POST(request: NextRequest) {
  const body = await request.text();
  return forwardTelegramRequest({
    request,
    backendPath: "/api/integrations/telegram/webapp/checkout/",
    method: "POST",
    body,
  });
}
