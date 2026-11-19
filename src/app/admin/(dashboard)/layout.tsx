import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import { AdminNav } from "./admin-nav";

export const metadata: Metadata = {
  title: { default: "Administration", template: "%s · Admin | mahy.bijoux" },
  robots: { index: false, follow: false, nocache: true },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user } = await requireAdmin();

  return (
    <div className="min-h-dvh bg-[#f8f6f1] lg:grid lg:grid-cols-[15rem_1fr]">
      <AdminNav email={user.email ?? ""} />
      <main className="min-w-0 px-4 py-8 sm:px-8 lg:px-10">{children}</main>
    </div>
  );
}
