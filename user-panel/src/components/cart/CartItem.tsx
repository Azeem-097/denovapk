"use client";
import Image from "next/image";
import Link from "next/link";
import { X, Minus, Plus } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { formatPrice } from "@/lib/utils";
import type { CartItem as CartItemType } from "@/types";

interface CartItemProps {
  item:       CartItemType;
  onLinkClick?: () => void;
  compact?:   boolean;
}

export function CartItem({ item, onLinkClick, compact = false }: CartItemProps) {
  const { updateQty, removeItem } = useCartStore();

  return (
    <div className="flex gap-3 sm:gap-4 py-4 border-b border-[#e5e7eb]">

      {/* Image */}
      <Link
        href={`/products/${item.slug}`}
        onClick={onLinkClick}
        className={`relative flex-shrink-0 bg-[#fafaf9] overflow-hidden ${compact ? "w-20 h-24" : "w-24 h-32 sm:w-28 sm:h-36"}`}
      >
        <Image
          src={item.image}
          alt={item.name}
          fill
          className="object-cover"
          sizes="120px"
        />
      </Link>

      {/* Details */}
      <div className="flex-1 min-w-0 flex flex-col">

        {/* Top row: name + remove */}
        <div className="flex items-start justify-between gap-2 mb-1">
          <Link
            href={`/products/${item.slug}`}
            onClick={onLinkClick}
            className="text-sm font-medium text-[#1a1a1a] hover:text-[#c9a96e] transition-colors line-clamp-2 leading-snug"
          >
            {item.name}
          </Link>
          <button
            onClick={() => removeItem(item.id)}
            className="flex-shrink-0 text-[#6b7280] hover:text-red-500 transition-colors p-0.5 -mt-0.5"
            aria-label="Remove item"
          >
            <X size={16} />
          </button>
        </div>

        {/* Variant info */}
        <div className="flex items-center gap-3 text-xs text-[#6b7280] mb-2">
          <span className="flex items-center gap-1.5">
            <span
              className="w-3 h-3 rounded-full border border-[#e5e7eb]"
              style={{ backgroundColor: item.colorHex }}
            />
            {item.color}
          </span>
          <span className="text-[#e5e7eb]">|</span>
          <span>Size: <span className="text-[#1a1a1a] font-medium">{item.size}</span></span>
        </div>

        {/* Bottom row: quantity + price */}
        <div className="mt-auto flex items-end justify-between gap-2">

          {/* Quantity */}
          <div className="inline-flex items-center border border-[#e5e7eb]">
            <button
              onClick={() => updateQty(item.id, item.quantity - 1)}
              className="w-8 h-8 flex items-center justify-center text-[#6b7280] hover:bg-[#fafaf9] hover:text-[#1a1a1a] transition-colors"
              aria-label="Decrease quantity"
            >
              <Minus size={12} />
            </button>
            <span className="w-8 text-center text-xs font-medium text-[#1a1a1a]">
              {item.quantity}
            </span>
            <button
              onClick={() => updateQty(item.id, item.quantity + 1)}
              className="w-8 h-8 flex items-center justify-center text-[#6b7280] hover:bg-[#fafaf9] hover:text-[#1a1a1a] transition-colors"
              aria-label="Increase quantity"
            >
              <Plus size={12} />
            </button>
          </div>

          {/* Price */}
          <p className="text-sm font-bold text-[#1a1a1a]">
            {formatPrice(item.price * item.quantity)}
          </p>
        </div>
      </div>
    </div>
  );
}