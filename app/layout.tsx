import type { Metadata } from "next";
import Filters from "./components/Filters";
import "./globals.css";
import { createServerSupabase } from "@/lib/supabase/server";
import Navbar from "./components/Navbar";
import { supabaseBrowser } from "@/lib/supabase/client";

export const metadata: Metadata = {
  title: "Loan Compass AI",
  description: "Personalized loan discovery dashboard",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <html lang="en">
      <body>
        <div className="absolute inset-0 -z-10 pointer-events-none"></div>

        
          <Navbar  />
        

        <main className="max-w-6xl mx-auto px-4 py-10">
          {children}
        </main>

        <footer className="border-t py-6 text-center text-sm text-gray-600 bg-white/60 backdrop-blur">
          © {new Date().getFullYear()} Loan Compass AI — Built with ❤️
        </footer>
      </body>
    </html>
  );
}
