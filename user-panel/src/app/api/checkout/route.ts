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

// Map client-facing payment method to admin setting key
const PAYMENT_METHOD_SETTING_MAP: Record<string, string> = {
  cod:       "payment_cod_enabled",
  card:      "payment_card_enabled",
  jazzcash:  "payment_jazzcash_enabled",
  easypaisa: "payment_easypaisa_enabled",
  bank:      "payment_bank_enabled",
};

// Friendly labels for error messages
const PAYMENT_METHOD_LABELS: Record<string, string> = {
  cod:       "Cash on Delivery",
  card:      "Credit / Debit Card",
  jazzcash:  "JazzCash",
  easypaisa: "Easypaisa",
  bank:      "Bank Transfer",
};

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

    const stockError = await validateCheckoutStock(items);
    if (stockError) {
      return NextResponse.json(stockError, { status: 400 });
    }

    // ═══════════════════════════════════════════════════════
    //  VALIDATE PAYMENT METHOD (server-side, never trust client)
    // ═══════════════════════════════════════════════════════
    const pmLower = String(paymentMethod).toLowerCase();
    const settingKey = PAYMENT_METHOD_SETTING_MAP[pmLower];

    if (!settingKey) {
      return NextResponse.json({
        error: `Invalid payment method: ${paymentMethod}`,
      }, { status: 400 });
    }

    // Check if this payment method is enabled by admin
    // Fallback for COD: check legacy `cod_enabled` too
    let isMethodEnabled = await getBoolSetting(settingKey, true);
    if (pmLower === "cod") {
      const legacyCod = await getBoolSetting("cod_enabled", true);
      isMethodEnabled = isMethodEnabled && legacyCod;
    }

    if (!isMethodEnabled) {
      return NextResponse.json({
        error: `${PAYMENT_METHOD_LABELS[pmLower]} is currently unavailable. Please choose another payment method.`,
      }, { status: 400 });
    }

    const user = await getCurrentUser();
    const fullUser = user ? await getUserById(user.id) : null;
    const shippingFullName = String(shipping.fullName || `${shipping.firstName ?? ""} ${shipping.lastName ?? ""}`).trim();

    const orderItems = items.map((item: {
      productId: string; variantId: string; name: string; image: string;
      size: string; color: string; price: number; quantity: number;
    }) => ({
      productId: item.productId, variantId: item.variantId,
      name: item.name, image: item.image,
      size: item.size, color: item.color, sku: "",
      price: rupeesToPaisa(item.price), quantity: item.quantity,
    }));

    const subtotal = orderItems.reduce(
      (sum: number, i: { price: number; quantity: number }) => sum + i.price * i.quantity,
      0
    );

    // ─── Server-side shipping calc ───────────────────────
    const [freeDeliveryAll, baseCost, threshold, codFee] = await Promise.all([
      getBoolSetting("free_delivery_all",       false),
      getNumberSetting("shipping_base_cost",    250),
      getNumberSetting("free_shipping_threshold", 5000),
      getNumberSetting("cod_extra_fee",         0),
    ]);

    const subtotalRupees = subtotal / 100;
    let shippingRupees = 0;
    if (freeDeliveryAll) {
      shippingRupees = 0;
    } else if (threshold > 0 && subtotalRupees >= threshold) {
      shippingRupees = 0;
    } else {
      shippingRupees = baseCost;
    }
    if (pmLower === "cod" && codFee > 0) {
      shippingRupees += codFee;
    }
    const shippingCost = rupeesToPaisa(shippingRupees);

    // ─── Discount code ────────────────────────────────────
    let discountAmount = 0;
    let discountId: string | undefined;
    if (discountCode) {
      const validation = await validateDiscount(discountCode, subtotal);
      if (validation.valid) {
        discountAmount = validation.amount!;
        discountId     = validation.discount!.id;
      } else {
        return NextResponse.json({
          error: validation.error || "Invalid discount code",
        }, { status: 400 });
      }
    }

    // ═══════════════════════════════════════════════════════
    //  Promotion logic (unchanged)
    // ═══════════════════════════════════════════════════════
    let promoType: "birthday" | "first_order" | "loyalty" | null = null;
    let birthdayDiscount = 0;
    let isBirthdayOrder  = false;
    let loyaltyDiscountPaisa = 0;
    let actualPointsToUse    = 0;
    let canEarnLoyalty        = true;

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
              birthdayDiscount = rupeesToPaisa(foFixed);
            } else {
              birthdayDiscount = Math.round((subtotal * foPct) / 100);
            }
          }
        }
      }
    }

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

    // ─── Address handling (unchanged) ────────────────────
    let addressId: string | null = null;
    if (user && saveAddress) {
      const existingAddresses = await getUserAddresses(user.id);
      const matchingAddress = existingAddresses.find((a) =>
        a.street.trim().toLowerCase() === String(shipping.address).trim().toLowerCase() &&
        a.city.trim().toLowerCase()   === String(shipping.city).trim().toLowerCase() &&
        a.postalCode.trim()           === String(shipping.postalCode).trim()
      );

      if (matchingAddress) {
        addressId = matchingAddress.id;
        await updateAddress(matchingAddress.id, {
          fullName: shippingFullName,
          phone: shipping.phone, province: shipping.province,
        });
      } else {
        const isFirst = existingAddresses.length === 0;
        const newAddr = await createAddress({
          userId: user.id,
          label: isFirst ? "Home" : "Address " + (existingAddresses.length + 1),
          fullName: shippingFullName,
          phone: shipping.phone, street: shipping.address, apartment: "",
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
      if (fullUser && shippingFullName && fullUser.name !== shippingFullName) {
        await updateUser(user.id, { name: shippingFullName });
      }
    }

    const order = await createOrder({
      userId: user?.id ?? null,
      guestEmail: undefined,
      guestName:  user ? undefined : shippingFullName,
      guestPhone: user ? undefined : shipping.phone,
      items: orderItems, subtotal, discount: discountAmount,
      shipping: shippingCost, total,
      paymentMethod: paymentMethod.toUpperCase() as PaymentMethod,
      addressId,
      shippingAddress: {
        fullName: shippingFullName,
        phone: shipping.phone, email: "",
        street: shipping.address, apartment: "",
        city: shipping.city, province: shipping.province, postalCode: shipping.postalCode,
      },
      shippingMethod: shippingMethod?.name ?? "Standard Delivery",
      customerNote: shipping.notes,
      discountCode: discountCode || undefined, discountId,
    });

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

    if (promoType === "loyalty" && user && actualPointsToUse > 0) {
      try {
        const pointValue = await getNumberSetting("loyalty_point_value", 1);
        await redeemPoints(user.id, order.id, actualPointsToUse, pointValue);
      } catch (err) { console.error("Loyalty redemption failed:", err); }
    }

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

async function validateCheckoutStock(items: Array<{ variantId?: string; quantity?: number }>) {
  const requestedByVariant = new Map<string, number>();

  for (const item of items) {
    if (!item.variantId) {
      return { error: "Invalid cart item." };
    }
    const quantity = Math.max(1, Math.floor(Number(item.quantity) || 1));
    requestedByVariant.set(item.variantId, (requestedByVariant.get(item.variantId) ?? 0) + quantity);
  }

  const variantIds = [...requestedByVariant.keys()];
  if (variantIds.length === 0) return { error: "Your cart is empty." };

  const placeholders = variantIds.map(() => "?").join(",");
  const result = await db.execute({
    sql:  `SELECT id, stock FROM product_variants WHERE id IN (${placeholders})`,
    args: variantIds,
  });

  const stockByVariant = new Map(
    result.rows.map((row) => [String(row.id), Math.max(0, Math.floor(Number(row.stock) || 0))])
  );

  for (const [variantId, quantity] of requestedByVariant) {
    const stock = stockByVariant.get(variantId) ?? 0;
    if (quantity > stock) {
      return {
        error: stock > 0
          ? `Only ${stock} items are available in stock.`
          : "One or more items in your cart are out of stock.",
        stock,
        variantId,
      };
    }
  }

  return null;
}
