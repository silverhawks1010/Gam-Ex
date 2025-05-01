import { Metadata } from "next";
import { Navbar } from "@/components/navbar";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Tableau de bord - Gam'Ex",
  description: "Gérez vos jeux et vos listes",
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?redirectTo=/dashboard');
  }

  return (
    <>
      <Navbar />
      <main className="container py-8">
        <h1 className="text-4xl font-bold mb-8">Tableau de bord</h1>
        <div className="grid gap-6">
          <div className="rounded-lg border p-4">
            <h2 className="text-xl font-semibold mb-4">Profil</h2>
            <div className="space-y-2">
              <p>
                <span className="font-medium">Email:</span> {user.email}
              </p>
              <p>
                <span className="font-medium">ID:</span> {user.id}
              </p>
              <p>
                <span className="font-medium">Dernière connexion:</span>{" "}
                {new Date(user.last_sign_in_at || "").toLocaleString("fr-FR")}
              </p>
            </div>
          </div>
        </div>
      </main>
    </>
  );
} 