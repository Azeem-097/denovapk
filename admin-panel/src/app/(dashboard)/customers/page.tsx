import { getAllCustomers } from "@/lib/db/repositories/customers";
import { adaptCustomer } from "@/lib/adapters";
import { CustomersPageClient } from "./CustomersPageClient";

export const dynamic   = "force-dynamic";
export const revalidate = 0;

export default async function CustomersPage() {
  const dbCustomers = await getAllCustomers();
  const customers   = dbCustomers.map(adaptCustomer);

  return <CustomersPageClient initialCustomers={customers} />;
}