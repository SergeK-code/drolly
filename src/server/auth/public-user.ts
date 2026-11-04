export type AppRole = "customer" | "admin";

export type PublicUser = {
  id: string;
  email: string;
  fullName: string;
  role: AppRole;
};

export function toPublicUser(input: PublicUser): PublicUser {
  return {
    id: input.id,
    email: input.email,
    fullName: input.fullName,
    role: input.role,
  };
}
