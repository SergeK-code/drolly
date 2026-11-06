import { z } from "zod";

const emptyToNull = (value: unknown) => {
  if (typeof value !== "string") {
    return value;
  }

  const trimmed = value.trim();
  return trimmed.length === 0 ? null : trimmed;
};

export const profileWriteSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(1, "Enter your name.")
      .max(80, "Name is too long."),
    phone: z.preprocess(
      (value) => (value === undefined ? null : emptyToNull(value)),
      z
        .string()
        .trim()
        .min(6, "Enter a phone number (at least 6 digits).")
        .max(30, "Phone number is too long.")
        .regex(/^[+]?[\d\s()-]+$/, "Enter a valid phone number.")
        .nullable(),
    ),
  })
  .strict();

export type ProfileWriteInput = z.infer<typeof profileWriteSchema>;
