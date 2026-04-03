import type { Messages } from "./types";
import { ruMessages } from "./ru";
import { uzMessages } from "./uz";

export const messagesByLocale: Record<"uz" | "ru", Messages> = {
  uz: uzMessages,
  ru: ruMessages,
};
