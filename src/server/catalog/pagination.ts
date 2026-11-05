import { z } from "zod";
import { AppError } from "@/server/http/api";

const productCursorSchema = z
  .object({
    createdAt: z.string().min(1),
    id: z.uuid(),
  })
  .strict();

const categoryCursorSchema = z
  .object({
    sortOrder: z.number().int().nonnegative(),
    id: z.uuid(),
  })
  .strict();

export type ProductCursor = z.infer<typeof productCursorSchema>;
export type CategoryCursor = z.infer<typeof categoryCursorSchema>;

export type PaginatedResult<T> = {
  items: T[];
  hasMore: boolean;
  nextCursor: string | null;
  page: number | null;
};

export function encodeCursor(value: object): string {
  return Buffer.from(JSON.stringify(value), "utf8").toString("base64url");
}

function decodeCursorJson(value: string): unknown {
  try {
    return JSON.parse(Buffer.from(value, "base64url").toString("utf8")) as unknown;
  } catch {
    throw invalidCursorError();
  }
}

export function decodeProductCursor(value: string): ProductCursor {
  const parsed = productCursorSchema.safeParse(decodeCursorJson(value));
  if (!parsed.success) {
    throw invalidCursorError();
  }

  return parsed.data;
}

export function decodeCategoryCursor(value: string): CategoryCursor {
  const parsed = categoryCursorSchema.safeParse(decodeCursorJson(value));
  if (!parsed.success) {
    throw invalidCursorError();
  }

  return parsed.data;
}

export function splitPage<T>(rows: T[], limit: number): { items: T[]; hasMore: boolean } {
  const hasMore = rows.length > limit;
  return {
    items: hasMore ? rows.slice(0, limit) : rows,
    hasMore,
  };
}

export function pageOffset(page: number, limit: number): number {
  return (page - 1) * limit;
}

function invalidCursorError(): AppError {
  return new AppError("VALIDATION_ERROR", 400, "The submitted data is invalid.", {
    fieldErrors: { cursor: ["Invalid cursor."] },
  });
}
