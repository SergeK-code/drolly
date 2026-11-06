import { AddressBook } from "@/features/account/address-book";

export const instant = false;

export default function AccountAddressesPage() {
  return (
    <>
      <h2 className="text-lg font-semibold">Addresses</h2>
      <AddressBook />
    </>
  );
}
