// app/components/AuthModal.tsx
"use client";

import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Alert } from "@/components/ui/alert";

type AuthMode = "login" | "signup";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [alertMsg, setAlertMsg] = useState(false);

  if (!isOpen) return null;

  async function handleAuth(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      let error;
      if (mode === "login") {
        ({ error } = await supabaseBrowser.auth.signInWithPassword({
          email,
          password,
        }));
      } else {
        ({ error } = await supabaseBrowser.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/` },
        }));
      }

      if (error) throw error;

      if (mode === "signup") setAlertMsg(true);

      onClose();
      router.refresh();
    } catch (err: any) {
      setErrorMsg(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl p-6 z-10">
        <button
          aria-label="Close"
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
          onClick={onClose}
        >
          ✕
        </button>

        <h2 className="text-xl font-semibold mb-3">{mode === "login" ? "Login" : "Create an account"}</h2>

        <form onSubmit={handleAuth} className="flex flex-col gap-3">
          <label className="text-sm">
            <input
              type="email"
              required
              placeholder="Email"
              className="w-full border border-gray-200 p-2 rounded-md"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>

          <label className="text-sm">
            <input
              type="password"
              required
              placeholder="Password"
              className="w-full border border-gray-200 p-2 rounded-md"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>

          <div className="flex gap-2 mt-1">
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white py-2 rounded-md disabled:opacity-60"
              disabled={loading}
            >
              {loading ? (mode === "login" ? "Signing in…" : "Creating…") : (mode === "login" ? "Login" : "Sign up")}
            </button>
          </div>
        </form>

        {errorMsg && <p className="text-sm text-red-600 mt-3">{errorMsg}</p>}

        {alertMsg && (
          <div className="mt-3">
            <Alert variant="default">
              <div className="text-sm">Please check your email for a verification link.</div>
            </Alert>
          </div>
        )}

        <p className="mt-4 text-sm text-gray-600">
          {mode === "login" ? (
            <>
              Don't have an account?{" "}
              <button className="text-blue-600 underline" onClick={() => setMode("signup")}>
                Sign up
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button className="text-blue-600 underline" onClick={() => setMode("login")}>
                Login
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
