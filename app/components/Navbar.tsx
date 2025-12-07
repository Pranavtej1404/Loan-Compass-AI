"use client";

import { useState, useEffect } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";
import Filters from "./Filters";
import AuthModal from "./AuthModel";
import { User } from "lucide-react";
export default function Navbar() {
  const supabase = supabaseBrowser;

  const [user, setUser] = useState<any>(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    async function loadUser() {
      const { data } = await supabase.auth.getUser();
      setUser(data?.user || null);
    }
    loadUser();
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    setUser(null);
    setMenuOpen(false);
  }

  return (
    <>
      {/* NAVBAR */}
      <header className="sticky top-0 z-40 bg-white/70 backdrop-blur border-b shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">

          {/* LEFT — Filters */}
          <div className="flex-1">
            <div className="w-full max-w-sm">
              <Filters searchParams={{}} />
            </div>
          </div>

          {/* CENTER — Title */}
          <h1 className="text-lg font-semibold mx-auto absolute left-1/2 -translate-x-1/2">
            LoanMatch AI
          </h1>

          {/* RIGHT — Auth */}
          <div className="flex items-center gap-2">
            {!user ? (
              <button
                onClick={() => setAuthOpen(true)}
                className="px-4 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
              >
                Login
              </button>
            ) : (
              <div className="relative">
                <button
                  onClick={() => setMenuOpen((p) => !p)}
                  className="p-2 rounded-full hover:scale-100 transition"
                >
                  <User className="h-6 w-6 text-gray-700" />
                </button>

                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-36 bg-white shadow-lg border rounded-xl p-2 text-sm">
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-100"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* AUTH MODAL - OUTSIDE NAVBAR */}
      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />
    </>
  );
}
