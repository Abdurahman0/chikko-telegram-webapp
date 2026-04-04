import { NextRequest, NextResponse } from "next/server";

function getBackendBaseUrl() {
  return (
    process.env.API_BASE_URL ??
    process.env.NEXT_PUBLIC_API_BASE_URL ??
    ""
  ).replace(/\/$/, "");
}

function extractChatIdFromInitData(initData: string) {
  if (!initData) {
    return "";
  }

  const params = new URLSearchParams(initData);
  const direct = params.get("chat_id");
  if (direct) {
    return direct;
  }

  const parseJsonId = (value: string | null) => {
    if (!value) {
      return "";
    }
    try {
      const parsed = JSON.parse(value) as { id?: string | number };
      if (parsed?.id !== undefined && parsed?.id !== null) {
        return String(parsed.id);
      }
      return "";
    } catch {
      return "";
    }
  };

  const fromChat = parseJsonId(params.get("chat"));
  if (fromChat) {
    return fromChat;
  }

  const fromUser = parseJsonId(params.get("user"));
  if (fromUser) {
    return fromUser;
  }

  const chatInstance = params.get("chat_instance");
  return chatInstance ?? "";
}

function withChatIdQuery(path: string, chatId: string) {
  if (!chatId) {
    return path;
  }
  const url = new URL(path, "http://local");
  if (!url.searchParams.get("chat_id")) {
    url.searchParams.set("chat_id", chatId);
  }
  return `${url.pathname}${url.search}`;
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
  const chatIdFromHeader = request.headers.get("x-telegram-chat-id") ?? "";
  const chatId = chatIdFromHeader || extractChatIdFromInitData(initData);
  const backendPathWithChat = withChatIdQuery(backendPath, chatId);

  let preparedBody = body;
  if (chatId && method === "POST") {
    if (!preparedBody) {
      preparedBody = JSON.stringify({ chat_id: chatId });
    } else {
      try {
        const parsed = JSON.parse(preparedBody) as unknown;
        if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
          const next = parsed as Record<string, unknown>;
          if (
            next.chat_id === undefined ||
            next.chat_id === null ||
            String(next.chat_id).trim().length === 0
          ) {
            next.chat_id = chatId;
          }
          preparedBody = JSON.stringify(next);
        }
      } catch {
        // keep original body if not JSON
      }
    }
  }

  const headers = new Headers({
    "X-Telegram-Init-Data": initData,
  });
  if (chatId) {
    headers.set("X-Telegram-Chat-Id", chatId);
  }
  if (preparedBody) {
    headers.set("Content-Type", "application/json");
  }

  let response: Response;
  try {
    response = await fetch(`${backendBase}${backendPathWithChat}`, {
      method,
      headers,
      body: preparedBody,
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
