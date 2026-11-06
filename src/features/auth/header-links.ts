export type HeaderUser = {
  role: "customer" | "admin";
};

export type HeaderLink = {
  href: string;
  label: string;
};

export function headerLinks(user: HeaderUser | null): HeaderLink[] {
  const links: HeaderLink[] = [
    { href: "/", label: "Catalog" },
    { href: "/cart", label: "Cart" },
  ];

  if (!user) {
    links.push(
      { href: "/sign-in", label: "Sign in" },
      { href: "/sign-up", label: "Create account" },
    );
    return links;
  }

  links.push({ href: "/account", label: "Account" });

  if (user.role === "admin") {
    links.push({ href: "/admin", label: "Admin" });
  }

  return links;
}
