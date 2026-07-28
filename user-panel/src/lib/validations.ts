import { z } from "zod";

// ─── Contact & Shipping ────────────────────────────────────
export const shippingSchema = z.object({
  phone:      z.string().min(10, "Phone number must be at least 10 digits").regex(/^[0-9+\-\s]+$/, "Invalid phone number"),
  fullName:   z.string().min(2, "Full name is required"),
  address:    z.string().min(5, "Address is required"),
  city:       z.string().min(2, "City is required"),
  province:   z.string().min(1, "Please select a province"),
  postalCode: z.string().min(4, "Postal code is required"),
  notes:      z.string().optional(),
  saveInfo:   z.boolean().optional(),
});

export type ShippingFormData = z.infer<typeof shippingSchema>;

// ─── Payment ───────────────────────────────────────────────
export const paymentSchema = z.object({
  method: z.enum(["cod", "card", "jazzcash", "easypaisa", "bank"]),
  cardNumber: z.string().optional(),
  cardName:   z.string().optional(),
  cardExpiry: z.string().optional(),
  cardCVV:    z.string().optional(),
});

export type PaymentFormData = z.infer<typeof paymentSchema>;

// ─── Contact form ──────────────────────────────────────────
export const contactSchema = z.object({
  name:    z.string().min(2, "Name is required"),
  email:   z.string().min(1, "Email is required").email("Invalid email"),
  phone:   z.string().optional(),
  subject: z.string().min(3, "Subject is required"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

export type ContactFormData = z.infer<typeof contactSchema>;

// ─── Pakistan Provinces ────────────────────────────────────
export const PAKISTAN_PROVINCES = [
  { value: "",              label: "Select Province" },
  { value: "punjab",         label: "Punjab" },
  { value: "sindh",          label: "Sindh" },
  { value: "kpk",            label: "Khyber Pakhtunkhwa" },
  { value: "balochistan",    label: "Balochistan" },
  { value: "islamabad",      label: "Islamabad Capital Territory" },
  { value: "gilgit",         label: "Gilgit-Baltistan" },
  { value: "ajk",            label: "Azad Jammu & Kashmir" },
] as const;

// ─── Auth ──────────────────────────────────────────────────
export const loginSchema = z.object({
  email:    z.string().min(1, "Email is required").email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  remember: z.boolean().optional(),
});
export type LoginFormData = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  firstName:       z.string().min(2, "First name is required"),
  lastName:        z.string().min(2, "Last name is required"),
  email:           z.string().min(1, "Email is required").email("Invalid email"),
  phone:           z.string().min(10, "Phone number required").regex(/^[0-9+\-\s]+$/, "Invalid phone"),
  password:        z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(1, "Please confirm password"),
  agree:           z.boolean().refine((v) => v === true, { message: "You must agree to terms" }),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Passwords do not match",
  path:    ["confirmPassword"],
});
export type RegisterFormData = z.infer<typeof registerSchema>;

// ─── Address ───────────────────────────────────────────────
export const addressSchema = z.object({
  label:      z.string().min(1, "Please enter a label"),
  fullName:   z.string().min(2, "Full name is required"),
  phone:      z.string().min(10, "Phone required"),
  street:     z.string().min(5, "Street address is required"),
  city:       z.string().min(2, "City is required"),
  province:   z.string().min(1, "Please select a province"),
  postalCode: z.string().min(4, "Postal code is required"),
  isDefault:  z.boolean().optional(),
});
export type AddressFormData = z.infer<typeof addressSchema>;

// ─── Profile ───────────────────────────────────────────────
export const profileSchema = z.object({
  name:  z.string().min(2, "Name is required"),
  email: z.string().min(1, "Email is required").email("Invalid email"),
  phone: z.string().optional(),
});
export type ProfileFormData = z.infer<typeof profileSchema>;

export const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1, "Current password required"),
  newPassword:     z.string().min(8, "New password must be at least 8 characters"),
  confirmPassword: z.string().min(1, "Please confirm new password"),
}).refine((d) => d.newPassword === d.confirmPassword, {
  message: "Passwords do not match",
  path:    ["confirmPassword"],
});
export type PasswordChangeFormData = z.infer<typeof passwordChangeSchema>;
