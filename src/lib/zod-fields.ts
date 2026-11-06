import { z } from "zod";

export type FieldErrors = Record<string, string[]>;

export function fieldErrorsFromZod(error: z.ZodError): FieldErrors {
  const fieldErrors: FieldErrors = {};

  for (const issue of error.issues) {
    const field = issue.path.length > 0 ? issue.path.join(".") : "(root)";
    const messages = fieldErrors[field] ?? [];
    messages.push(issue.message);
    fieldErrors[field] = messages;
  }

  return flattenFieldErrors(fieldErrors);
}

export function flattenFieldErrors(fieldErrors: FieldErrors): FieldErrors {
  const flattened: FieldErrors = { ...fieldErrors };

  for (const [key, messages] of Object.entries(fieldErrors)) {
    const leaf = key.includes(".") ? (key.split(".").at(-1) ?? key) : key;
    if (leaf !== key) {
      flattened[leaf] = messages;
    }
  }

  return flattened;
}

export function messageFromFieldErrors(fieldErrors: FieldErrors): string {
  const messages = [...new Set(Object.values(fieldErrors).flat())].filter(
    (message) => message.length > 0,
  );

  if (messages.length === 0) {
    return "Check the highlighted fields and try again.";
  }

  return messages.join(" ");
}

export function validateForm<T>(
  schema: z.ZodType<T>,
  data: unknown,
): { success: true; data: T } | { success: false; fieldErrors: FieldErrors } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }

  return {
    success: false,
    fieldErrors: fieldErrorsFromZod(result.error),
  };
}

export function firstFieldError(
  fieldErrors: FieldErrors | undefined,
  field: string,
): string | undefined {
  return fieldErrors?.[field]?.[0];
}
