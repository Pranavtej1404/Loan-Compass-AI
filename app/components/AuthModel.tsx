"use client";

import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Alert } from "@/components/ui/alert"
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
  const[alertMsg,setAlertMsg]=useState(false);
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
      router.refresh(); // refresh to update session-dependent UI
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow-lg w-[90%] max-w-md relative">
        <button
          className="absolute top-2 right-2 text-gray-500"
          onClick={onClose}
        >
          ✕
        </button>

        <h2 className="text-xl font-bold mb-4">
          {mode === "login" ? "Login" : "Sign Up"}
        </h2>

        <form onSubmit={handleAuth} className="flex flex-col gap-4">
          <input
            type="email"
            required
            placeholder="Email"
            className="border p-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            required
            placeholder="Password"
            className="border p-2"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            type="submit"
            className="bg-blue-500 text-white p-2 rounded"
            disabled={loading}
          >
            {loading ? "Processing..." : mode === "login" ? "Login" : "Sign Up"}
          </button>
        </form>

        {errorMsg && <p className="text-red-500 mt-3">{errorMsg}</p>}
        {alertMsg && (
          <Alert variant="default" className="mt-4">
            <p>Please check your email for a verification link.</p>
          </Alert>
        )}
        
        <p className="mt-3 text-sm text-gray-600">
          {mode === "login" ? (
            <>
              Don't have an account?{" "}
              <button
                className="text-blue-500 underline"
                onClick={() => setMode("signup")}
              >
                Sign Up
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button
                className="text-blue-500 underline"
                onClick={() => setMode("login")}
              >
                Login
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
