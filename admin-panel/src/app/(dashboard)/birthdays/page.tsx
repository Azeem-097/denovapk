import { getBirthdayUsersToday, getBirthdayUsersUpcoming, daysUntilBirthday, calculateAge } from "@/lib/db/repositories/birthday";
import { getSettingsByCategory } from "@/lib/db/repositories/settings";
import { BirthdaysClient } from "./BirthdaysClient";

export const dynamic   = "force-dynamic";
export const revalidate = 0;

export default async function BirthdaysPage() {
  const settings = await getSettingsByCategory("birthday");
  const reminderDays = Number(settings.birthday_reminder_days ?? 7);

  const [today, upcoming] = await Promise.all([
    getBirthdayUsersToday(),
    getBirthdayUsersUpcoming(reminderDays),
  ]);

  const todayEnriched = today.map((u) => ({
    id: u.id, name: u.name, email: u.email, phone: u.phone,
    birthday: u.birthday!, age: calculateAge(u.birthday!),
    daysUntil: 0,
  }));

  const upcomingEnriched = upcoming.map((u) => ({
    id: u.id, name: u.name, email: u.email, phone: u.phone,
    birthday: u.birthday!, age: calculateAge(u.birthday!),
    daysUntil: daysUntilBirthday(u.birthday!),
  })).sort((a, b) => a.daysUntil - b.daysUntil);

  return (
    <BirthdaysClient
      today={todayEnriched}
      upcoming={upcomingEnriched}
      settings={{
        enabled:       settings.birthday_enabled === "true",
        discountPct:   Number(settings.birthday_discount_pct ?? 15),
        fixedAmount:   Number(settings.birthday_fixed_amount ?? 0),
        minOrder:      Number(settings.birthday_min_order ?? 3000),
        validityDays:  Number(settings.birthday_validity_days ?? 7),
        reminderDays:  reminderDays,
        waMessage:     settings.birthday_wa_message ?? "",
        freeGift:      settings.birthday_free_gift ?? "",
      }}
    />
  );
}