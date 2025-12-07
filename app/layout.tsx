import type { Metadata } from "next";
import Filters from "./components/Filters";
import "./globals.css";
import { createServerSupabase } from "@/lib/supabase/server";
export const metadata: Metadata = {
  title: "Loan Compass AI",
  description: "Personalized loan discovery dashboard",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerSupabase();
  
  const { data: { user } } = await supabase.auth.getUser();
  return (
    <html lang="en">
      <body className="bg-[#f9fafb] text-gray-900 relative overflow-x-hidden">
        
        {/* --- Background Layer --- */}
        <BackgroundDesign />

        {/* --- Header --- */}
        <header 
  className="sticky top-0 z-40 border-b bg-white/80 backdrop-blur"
  role="banner"
>
  <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
    
    {/* Logo */}
    <a href="/" aria-label="LoanCompass Home">
      <img
        src="/logo.svg"
        alt="LoanCompass logo"
        className="h-8 w-auto"
      />
    </a>

    {/* Search */}
    <Filters searchParams={{}} />

    {/* User Button */}
    <button
      aria-label="User menu"
      className="focus:ring-2 focus:ring-primary rounded-full p-2"
    >
      <img 
        src="/avatar.png" 
        alt="User profile" 
        className="h-8 w-8 rounded-full"
      />
    </button>
  </div>
</header>

        {/* --- Main Container --- */}
        <main className="max-w-6xl w-full mx-auto px-4 py-10 relative z-10">
          {children}
        </main>

        {/* --- Footer --- */}
        <footer className="border-t text-center py-6 text-sm text-gray-500 bg-white/60 backdrop-blur-md">
          © {new Date().getFullYear()} Loan Compass AI — Built with ❤️
        </footer>
      </body>
    </html>
  );
}

function BackgroundDesign() {
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">

      {/* Blurry Circle 1 - Top Left */}
      <div
        className="absolute top-[-150px] left-[-150px] w-[350px] h-[350px]
        bg-purple-300 blur-[180px] opacity-40 rounded-full"
      ></div>

      {/* Blurry Circle 2 - Bottom Right */}
      <div
        className="absolute bottom-[-150px] right-[-150px] w-[350px] h-[350px]
        bg-blue-300 blur-[200px] opacity-40 rounded-full"
      ></div>

      {/* Subtle Blurred Grid */}
      <div className="absolute inset-0 opacity-[0.15]">
        <svg
          width="100%"
          height="100%"
          xmlns="http://www.w3.org/2000/svg"
          className="blur-[1px]"
        >
          <defs>
            <pattern
              id="grid"
              width="40"
              height="40"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 40 0 L 0 0 0 40"
                fill="none"
                stroke="#cbd5e1"
                strokeWidth="1"
              />
            </pattern>
          </defs>

          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>
    </div>
  );
}
