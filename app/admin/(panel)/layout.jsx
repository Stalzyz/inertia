import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin-auth";
import AdminNav from "@/components/admin/AdminNav";

// The panel reads the session cookie on every request. It is intentionally a
// blocking route; there is no useful static shell to preserve for admins.
export const instant = false;

export const metadata = {
  title: "Studio admin",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }) {
  if (!(await isAdmin())) redirect("/admin/login");

  return (
    <div className="admin-shell">
      <header className="admin-top">
        <div className="container admin-top-inner">
          <Link href="/admin" className="admin-brand">
            Inertia <span>Studio admin</span>
          </Link>
          <AdminNav />
        </div>
      </header>
      <main className="admin-main container">{children}</main>
    </div>
  );
}
