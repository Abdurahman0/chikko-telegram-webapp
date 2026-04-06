import { NextRequest } from "next/server";
import { forwardTelegramRequest } from "@/lib/api/telegram-proxy";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ categoryId: string }> },
) {
  const { categoryId } = await params;
  const query = request.nextUrl.searchParams.toString();
  const suffix = query.length > 0 ? `?${query}` : "";

  return forwardTelegramRequest({
    request,
    backendPath: `/api/integrations/telegram/webapp/categories/${categoryId}/${suffix}`,
    method: "GET",
  });
}
