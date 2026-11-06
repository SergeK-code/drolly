import { z } from "zod";
import { validationFailed } from "@/server/http/api";

const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(3)
  .max(255)
  .refine((value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value), {
    message: "Enter a valid email address.",
  });

export const registerSchema = z
  .object({
    fullName: z.string().trim().min(1).max(80),
    email: emailSchema,
    password: z.string().min(8).max(72),
  })
  .strict();

export const signInSchema = z
  .object({
    email: emailSchema,
    password: z.string().min(1).max(72),
  })
  .strict();

export type RegisterInput = z.infer<typeof registerSchema>;
export type SignInInput = z.infer<typeof signInSchema>;

export function rejectClientRoleFields(body: unknown): void {
  if (!body || typeof body !== "object") {
    return;
  }

  if ("role" in body || "role_id" in body) {
    throw validationFailed({
      role: ["Role cannot be set from the client."],
    });
  }
}
