import { NextRequest } from "next/server";
import { forwardTelegramRequest } from "@/lib/api/telegram-proxy";

export async function GET(request: NextRequest) {
  return forwardTelegramRequest({
    request,
    backendPath: "/api/integrations/telegram/webapp/profile/",
    method: "GET",
  });
}
