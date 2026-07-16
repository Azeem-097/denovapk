import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getUserById, updateUser } from "@/lib/db/repositories/users";
import { createOrder } from "@/lib/db/repositories/orders";
import { clearCart } from "@/lib/db/repositories/cart";
import { validateDiscount } from "@/lib/db/repositories/discounts";
import { createAddress, getUserAddresses, updateAddress, setDefaultAddress } from "@/lib/db/repositories/users";
import { markCartRecovered } from "@/lib/db/repositories/abandonedCart";
import { redeemPoints, awardPointsForOrder, getUserPoints } from "@/lib/db/repositories/loyalty";
import { isBirthdayWithinValidityPeriod } from "@/lib/db/repositories/birthday";
import { getBoolSetting, getNumberSetting } from "@/lib/db/repositories/settings";
import { rupeesToPaisa } from "@/lib/priceUtils";
import { db } from "@/lib/db/client";
import { now } from "@/lib/db/helpers";
import type { PaymentMethod } from "@/lib/db/types";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      shipping, shippingMethod, paymentMethod,
      items, discountCode, saveAddress,
      loyaltyPointsToUse,
    } = body;

    if (!shipping || !items || items.length === 0 || !paymentMethod) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const user = await getCurrentUser();
    const fullUser = user ? await getUserById(user.id) : null;

    // Convert items to paisa
    const orderItems = items.map((item: {
      productId: string; variantId: string; name: string; image: string;
      size: string; color: string; price: number; quantity: number;
    }) => ({
      productId: item.productId, variantId: item.variantId,
      name: item.name, image: item.image,
      size: item.size, color: item.color, sku: "",
      price: rupeesToPaisa(item.price), quantity: item.quantity,
    }));

    const subtotal     = orderItems.reduce((sum: number, i: { price: number; quantity: number }) => sum + i.price * i.quantity, 0);
    const shippingCost = rupeesToPaisa(shippingMethod?.price ?? 0);

    // ─── Discount code ────────────────────────────────────
    let discountAmount = 0;
    let discountId: string | undefined;
    if (discountCode) {
      const validation = await validateDiscount(discountCode, subtotal);
      if (validation.valid) {
        discountAmount = validation.amount!;
        discountId     = validation.discount!.id;
      }
    }

    // ═══════════════════════════════════════════════════════
    // EXCLUSIVE PROMOTION LOGIC
    // Priority: Birthday > First Order > Loyalty
    // Only ONE can apply per order
    // ═══════════════════════════════════════════════════════

    let promoType: "birthday" | "first_order" | "loyalty" | null = null;
    let birthdayDiscount = 0;
    let isBirthdayOrder  = false;
    let loyaltyDiscountPaisa = 0;
    let actualPointsToUse    = 0;
    let canEarnLoyalty        = true;

    // ── CHECK 1: Birthday ────────────────────────────────
    if (fullUser?.birthday) {
      const bdayEnabled = await getBoolSetting("birthday_enabled", true);
      if (bdayEnabled) {
        const [validityDays, discountPct, fixedAmount, minOrderRupees] = await Promise.all([
          getNumberSetting("birthday_validity_days", 7),
          getNumberSetting("birthday_discount_pct", 15),
          getNumberSetting("birthday_fixed_amount", 0),
          getNumberSetting("birthday_min_order", 3000),
        ]);

        const minOrderPaisa = rupeesToPaisa(minOrderRupees);
        const isEligible = isBirthdayWithinValidityPeriod(fullUser.birthday, validityDays);

        if (isEligible && subtotal >= minOrderPaisa) {
          promoType = "birthday";
          isBirthdayOrder = true;
          canEarnLoyalty = false;

          if (fixedAmount > 0) {
            birthdayDiscount = rupeesToPaisa(fixedAmount);
          } else if (discountPct > 0) {
            birthdayDiscount = Math.round((subtotal * discountPct) / 100);
          }
        }
      }
    }

    // ── CHECK 2: First Order (only if birthday not active) ─
    if (!promoType && user) {
      const foEnabled = await getBoolSetting("first_order_enabled", true);
      if (foEnabled) {
        const orderCount = await db.execute({
          sql:  "SELECT COUNT(*) as c FROM orders WHERE userId = ?",
          args: [user.id],
        });
        const hasOrders = Number(orderCount.rows[0].c) > 0;

        if (!hasOrders) {
          const [foPct, foFixed, foMinOrder] = await Promise.all([
            getNumberSetting("first_order_discount_pct", 10),
            getNumberSetting("first_order_fixed_amount", 0),
            getNumberSetting("first_order_min_order", 2000),
          ]);

          const minPaisa = rupeesToPaisa(foMinOrder);
          if (subtotal >= minPaisa) {
            promoType = "first_order";
            canEarnLoyalty = false;

            if (foFixed > 0) {
              birthdayDiscount = rupeesToPaisa(foFixed); // Reuse same field for simplicity
            } else {
              birthdayDiscount = Math.round((subtotal * foPct) / 100);
            }
          }
        }
      }
    }

    // ── CHECK 3: Loyalty (only if no higher promo) ────────
    if (!promoType && user && loyaltyPointsToUse && loyaltyPointsToUse > 0) {
      const loyaltyEnabled = await getBoolSetting("loyalty_enabled", true);

      if (loyaltyEnabled) {
        const [pointValue, minRedeem, maxRedeemPct, currentBalance] = await Promise.all([
          getNumberSetting("loyalty_point_value", 1),
          getNumberSetting("loyalty_min_redemption", 100),
          getNumberSetting("loyalty_max_redemption_pct", 20),
          getUserPoints(user.id),
        ]);

        if (loyaltyPointsToUse >= minRedeem && loyaltyPointsToUse <= currentBalance) {
          promoType = "loyalty";
          const maxDiscountRupees = (subtotal / 100) * (maxRedeemPct / 100);
          const maxPointsAllowed  = Math.floor(maxDiscountRupees / pointValue);
          actualPointsToUse       = Math.min(loyaltyPointsToUse, maxPointsAllowed, currentBalance);
          loyaltyDiscountPaisa    = actualPointsToUse * pointValue * 100;
        }
      }
    }

    const total = subtotal - discountAmount - birthdayDiscount - loyaltyDiscountPaisa + shippingCost;

    // ─── Smart address handling ────────────────────────────
    let addressId: string | null = null;
    if (user && saveAddress) {
      const existingAddresses = await getUserAddresses(user.id);
      const matchingAddress = existingAddresses.find((a) =>
        a.street.trim().toLowerCase() === shipping.address.trim().toLowerCase() &&
        a.city.trim().toLowerCase()   === shipping.city.trim().toLowerCase() &&
        a.postalCode.trim()           === shipping.postalCode.trim()
      );

      if (matchingAddress) {
        addressId = matchingAddress.id;
        await updateAddress(matchingAddress.id, {
          fullName: `${shipping.firstName} ${shipping.lastName}`.trim(),
          phone: shipping.phone, apartment: shipping.apartment, province: shipping.province,
        });
      } else {
        const isFirst = existingAddresses.length === 0;
        const newAddr = await createAddress({
          userId: user.id,
          label: isFirst ? "Home" : "Address " + (existingAddresses.length + 1),
          fullName: `${shipping.firstName} ${shipping.lastName}`.trim(),
          phone: shipping.phone, street: shipping.address, apartment: shipping.apartment,
          city: shipping.city, province: shipping.province, postalCode: shipping.postalCode,
          isDefault: isFirst,
        });
        addressId = newAddr.id;
        if (!isFirst && !existingAddresses.some((a) => a.isDefault === 1)) {
          await setDefaultAddress(user.id, newAddr.id);
        }
      }

      if (fullUser && shipping.phone && fullUser.phone !== shipping.phone) {
        await updateUser(user.id, { phone: shipping.phone });
      }
      const newFullName = `${shipping.firstName} ${shipping.lastName}`.trim();
      if (fullUser && newFullName && fullUser.name !== newFullName) {
        await updateUser(user.id, { name: newFullName });
      }
    }

    // ─── Create order ────────────────────────────────────
    const order = await createOrder({
      userId: user?.id ?? null,
      guestEmail: user ? undefined : shipping.email,
      guestName:  user ? undefined : `${shipping.firstName} ${shipping.lastName}`,
      guestPhone: user ? undefined : shipping.phone,
      items: orderItems, subtotal, discount: discountAmount,
      shipping: shippingCost, total,
      paymentMethod: paymentMethod.toUpperCase() as PaymentMethod,
      addressId,
      shippingAddress: {
        fullName: `${shipping.firstName} ${shipping.lastName}`,
        phone: shipping.phone, email: shipping.email,
        street: shipping.address, apartment: shipping.apartment,
        city: shipping.city, province: shipping.province, postalCode: shipping.postalCode,
      },
      shippingMethod: shippingMethod?.name ?? "Standard Delivery",
      customerNote: shipping.notes,
      discountCode: discountCode || undefined, discountId,
    });

    // Update order with promo fields
    await db.execute({
      sql: `UPDATE orders SET
              loyaltyDiscount = ?, loyaltyPointsUsed = ?,
              birthdayDiscount = ?, isBirthdayOrder = ?,
              updatedAt = ?
            WHERE id = ?`,
      args: [
        loyaltyDiscountPaisa, actualPointsToUse,
        birthdayDiscount, isBirthdayOrder ? 1 : 0,
        now(), order.id,
      ],
    });

    // Loyalty: Redeem (only if loyalty promo active)
    if (promoType === "loyalty" && user && actualPointsToUse > 0) {
      try {
        const pointValue = await getNumberSetting("loyalty_point_value", 1);
        await redeemPoints(user.id, order.id, actualPointsToUse, pointValue);
      } catch (err) { console.error("Loyalty redemption failed:", err); }
    }

    // Loyalty: Award (only if canEarnLoyalty is true)
    let pointsEarned = 0;
    if (user && canEarnLoyalty) {
      try {
        const loyaltyEnabled = await getBoolSetting("loyalty_enabled", true);
        if (loyaltyEnabled) {
          const earningRate = await getNumberSetting("loyalty_earning_rate", 5);
          const finalAmount = subtotal - discountAmount - birthdayDiscount - loyaltyDiscountPaisa;
          if (finalAmount > 0) {
            pointsEarned = await awardPointsForOrder(user.id, order.id, finalAmount, earningRate);
            if (pointsEarned > 0) {
              await db.execute({
                sql: `UPDATE orders SET loyaltyPointsEarned = ?, updatedAt = ? WHERE id = ?`,
                args: [pointsEarned, now(), order.id],
              });
            }
          }
        }
      } catch (err) { console.error("Loyalty earning failed:", err); }
    }

    // Cleanup
    if (user) await clearCart(user.id);
    try { await markCartRecovered(user?.id ?? null, shipping.phone, order.id); } catch {}

    return NextResponse.json({
      success: true,
      orderId: order.id,
      orderNumber: order.orderNumber,
      total: total / 100,
      promoType,
      pointsEarned,
      pointsUsed: actualPointsToUse,
      loyaltyDiscount: loyaltyDiscountPaisa / 100,
      birthdayDiscount: birthdayDiscount / 100,
      isBirthdayOrder,
    });
  } catch (err) {
    console.error("Checkout error:", err);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}