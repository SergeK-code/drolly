export type HeaderUser = {
  role: "customer" | "admin";
};

export type HeaderLink = {
  href: string;
  label: string;
  match: "exact" | "prefix";
};

export function headerLinks(user: HeaderUser | null): HeaderLink[] {
  const links: HeaderLink[] = [
    { href: "/", label: "Catalog", match: "exact" },
    { href: "/cart", label: "Cart", match: "exact" },
  ];

  if (!user) {
    return links;
  }

  links.push({ href: "/account", label: "Account", match: "prefix" });

  if (user.role === "admin") {
    links.push({ href: "/admin", label: "Admin", match: "prefix" });
  }

  return links;
}
