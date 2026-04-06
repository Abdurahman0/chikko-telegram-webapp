import { NextRequest } from "next/server";
import { forwardTelegramRequest } from "@/lib/api/telegram-proxy";

export async function GET(request: NextRequest) {
  return forwardTelegramRequest({
    request,
    backendPath: "/api/integrations/telegram/webapp/favorites/",
    method: "GET",
  });
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  return forwardTelegramRequest({
    request,
    backendPath: "/api/integrations/telegram/webapp/favorites/",
    method: "POST",
    body,
  });
}
