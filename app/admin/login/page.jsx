import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdmin, isAdminConfigured } from "@/lib/admin-auth";
import LoginForm from "@/components/admin/LoginForm";

// Sign-in also reads the session cookie to redirect existing admins.
export const instant = false;

export const metadata = {
  title: "Admin sign in",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage() {
  if (await isAdmin()) redirect("/admin");

  return (
    <main className="admin-login-main">
      <div className="admin-login-card">
        <p className="label">Studio admin</p>
        <h1 className="admin-login-title">Sign in to manage content.</h1>
        <p className="admin-login-copy">
          Add portfolio projects and publish verified client testimonials.
        </p>
        {isAdminConfigured() ? (
          <LoginForm />
        ) : (
          <p className="admin-msg admin-msg--error" role="alert">
            Set <code>ADMIN_PASSWORD</code> in the server environment to enable
            sign in.
          </p>
        )}
        <Link className="admin-login-back" href="/">
          ← Back to the site
        </Link>
      </div>
    </main>
  );
}
