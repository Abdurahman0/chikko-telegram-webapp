import { NextRequest, NextResponse } from "next/server";

function getBackendBaseUrl() {
  return (
    process.env.API_BASE_URL ??
    process.env.NEXT_PUBLIC_API_BASE_URL ??
    ""
  ).replace(/\/$/, "");
}

export async function forwardTelegramRequest({
  request,
  backendPath,
  method,
  body,
}: {
  request: NextRequest;
  backendPath: string;
  method: "GET" | "POST";
  body?: string;
}) {
  const backendBase = getBackendBaseUrl();
  if (!backendBase) {
    return NextResponse.json(
      { detail: "Backend base URL is not configured" },
      { status: 500 },
    );
  }

  const initData = request.headers.get("x-telegram-init-data") ?? "";
  const authHeader = request.headers.get("authorization") ?? "";
  const headers = new Headers({
    "X-Telegram-Init-Data": initData,
  });
  if (authHeader) {
    headers.set("Authorization", authHeader);
  } else if (initData) {
    headers.set("Authorization", `tma ${initData}`);
  }
  if (body) {
    headers.set("Content-Type", "application/json");
  }

  let response: Response;
  try {
    response = await fetch(`${backendBase}${backendPath}`, {
      method,
      headers,
      body,
      cache: "no-store",
    });
  } catch {
    return NextResponse.json(
      { detail: "Failed to reach backend service" },
      { status: 502 },
    );
  }

  const text = await response.text();
  const contentType = response.headers.get("content-type") ?? "application/json";

  return new NextResponse(text, {
    status: response.status,
    headers: {
      "Content-Type": contentType,
    },
  });
}
