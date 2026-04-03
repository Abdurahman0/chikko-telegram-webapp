import { z, type ZodSchema } from "zod";
import type { ApiErrorCode } from "@/types/telegram-webapp";

export class TelegramApiError extends Error {
  status: number;
  code: ApiErrorCode;

  constructor(message: string, status = 0, code: ApiErrorCode = "unknown") {
    super(message);
    this.name = "TelegramApiError";
    this.status = status;
    this.code = code;
  }
}

function mapStatusCodeToErrorCode(status: number): ApiErrorCode {
  if (status === 403) {
    return "forbidden";
  }
  if (status === 400) {
    return "bad_request";
  }
  return "unknown";
}

export async function telegramApiRequest<T>({
  path,
  method = "GET",
  initData,
  body,
  schema,
}: {
  path: string;
  method?: "GET" | "POST";
  initData: string;
  body?: unknown;
  schema: ZodSchema<T>;
}) {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";
  const url = `${baseUrl}${path}`;
  const headers = new Headers({
    "Content-Type": "application/json",
    "X-Telegram-Init-Data": initData ?? "",
  });

  let response: Response;
  try {
    response = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      cache: "no-store",
    });
  } catch {
    throw new TelegramApiError("Network error", 0, "network");
  }

  let payload: unknown = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    const message =
      (payload as { detail?: string } | null)?.detail ??
      (response.status === 403
        ? "Telegram initData is invalid"
        : "Request failed");
    throw new TelegramApiError(
      message,
      response.status,
      mapStatusCodeToErrorCode(response.status),
    );
  }

  const parsed = schema.safeParse(payload);
  if (!parsed.success) {
    throw new TelegramApiError("Invalid response format");
  }

  return parsed.data;
}

export function safeJsonStringify(value: unknown) {
  return z.string().catch("").parse(JSON.stringify(value));
}
