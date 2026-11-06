import { validationFailed } from "@/server/http/api";

export {
  registerSchema,
  signInSchema,
  type RegisterInput,
  type SignInInput,
} from "@/lib/auth-schemas";

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
