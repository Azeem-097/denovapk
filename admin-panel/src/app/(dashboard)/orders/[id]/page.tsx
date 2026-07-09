import { notFound } from "next/navigation";
import { getOrderById } from "@/lib/db/repositories/orders";
import { getUserById } from "@/lib/db/repositories/users";
import { adaptOrder } from "@/lib/adapters";
import { OrderDetailClient } from "./OrderDetailClient";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function OrderDetailPage({ params }: Props) {
  const { id } = await params;
  const dbOrder = await getOrderById(id);
  if (!dbOrder) notFound();

  let userName  = "";
  let userEmail = "";
  let userPhone = "";

  if (dbOrder.userId) {
    const user = await getUserById(dbOrder.userId);
    if (user) {
      userName  = user.name;
      userEmail = user.email;
      userPhone = user.phone ?? "";
    }
  }

  const order = adaptOrder(dbOrder, userName, userEmail, userPhone);
  // Add city + address from db
  if (dbOrder.address) {
    order.city = dbOrder.address.city;
    order.address = `${dbOrder.address.street}${dbOrder.address.apartment ? `, ${dbOrder.address.apartment}` : ""}`;
  }

  return <OrderDetailClient order={order} />;
}