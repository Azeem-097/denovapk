"use client";
import { Plus, Shield } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { getInitials } from "@/lib/utils";

const STAFF = [
  { id: "s1", name: "Hassan Sheikh",  email: "admin@denovapk.com",     role: "super_admin", isActive: true,  lastLogin: "Just now" },
  { id: "s2", name: "Ayesha Malik",   email: "ayesha@denovapk.com",    role: "admin",       isActive: true,  lastLogin: "2 hours ago" },
  { id: "s3", name: "Bilal Ahmed",    email: "bilal@denovapk.com",     role: "manager",     isActive: true,  lastLogin: "Yesterday" },
  { id: "s4", name: "Zainab Ahmed",   email: "zainab@denovapk.com",    role: "staff",       isActive: true,  lastLogin: "3 days ago" },
];

const ROLE_COLORS: Record<string, string> = {
  super_admin: "bg-[#c9a96e] text-white",
  admin:       "bg-blue-100 text-blue-700",
  manager:     "bg-green-100 text-green-700",
  staff:       "bg-gray-100 text-gray-700",
};

export default function StaffPage() {
  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#1a1a1a]">Staff & Roles</h1>
          <p className="text-sm text-[#6b7280] mt-0.5">Manage staff accounts and permissions.</p>
        </div>
        <Button variant="primary">
          <Plus size={14} />
          Invite Staff
        </Button>
      </div>

      <div className="bg-white border border-[#e5e7eb] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#e5e7eb] bg-[#fafaf9]">
                {["Member", "Email", "Role", "Status", "Last Login"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-[#6b7280]">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e5e7eb]">
              {STAFF.map((s) => (
                <tr key={s.id} className="hover:bg-[#fafaf9]">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#f5f0e8] flex items-center justify-center">
                        <span className="text-xs font-bold text-[#c9a96e]">{getInitials(s.name)}</span>
                      </div>
                      <span className="text-sm font-semibold text-[#1a1a1a]">{s.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-[#6b7280]">{s.email}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 font-semibold uppercase tracking-wide capitalize ${ROLE_COLORS[s.role]}`}>
                      {s.role === "super_admin" && <Shield size={9} />}
                      {s.role.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={s.isActive ? "success" : "default"}>
                      {s.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-xs text-[#6b7280]">{s.lastLogin}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}