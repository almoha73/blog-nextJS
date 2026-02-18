import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";

const Navbar = () => {
  //state pour changer le menu burger en croix et inversement etafficher le menu en responsive

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();
  return (
    <>
      {/* navbar responsive avec tailwind */}
      <div className="sticky top-0 z-50 glass-card !rounded-none !border-x-0 !border-t-0 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="bg-white p-1 rounded-xl shadow-inner">
            <Image
              src="/logo-brain.png"
              alt="logo"
              width={32}
              height={32}
              className="rounded-lg"
            />
          </div>
          <span className="font-black text-xl tracking-tight text-slate-800">
            BrainBlog
          </span>
        </div>

        <nav className="hidden md:flex items-center gap-8">
          <Link
            href="/"
            className={`text-sm font-bold transition-colors ${router.pathname === "/" ? "text-teal-600" : "text-slate-500 hover:text-teal-500"}`}
          >
            Accueil
          </Link>
        </nav>

        <div className="md:hidden">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            {isMenuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 glass-card !rounded-none !border-x-0">
            <Link
              className={`block px-3 py-2 rounded-md text-base font-medium ${router.pathname === "/" ? "text-teal-600 bg-teal-50" : "text-slate-600 hover:text-teal-500 hover:bg-slate-50"}`}
              href="/"
            >
              Accueil
            </Link>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
