import React, { useState } from "react";
import Link from "next/link";

const Navbar = () => {

  //state pour changer le menu burger en croix et inversement etafficher le menu en responsive

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      {/* navbar responsive avec tailwind */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center bg-gray-800 p-4 text-white">
        <div className="flex justify-between items-center">
          <div className="text-2xl font-bold">Logo</div>
          <div className="md:hidden">
            {/* menu burger */}
            {isMenuOpen ? (
              <svg
                onClick={() => setIsMenuOpen(false)}
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              <svg
                onClick={() => setIsMenuOpen(true)}
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            )}
          </div>
        </div>
        <nav className="flex flex-col md:flex-row md:items-center hidden md:block -mx-4">
          <Link
            className="my-1 mx-4 text-sm font-medium text-gray-100 hover:text-gray-300"
            href="/"
          >
            Home
          </Link>
          <Link
            className="my-1 mx-4 text-sm font-medium text-gray-100 hover:text-gray-300"
            href="#"
          >
            Contact
          </Link>
        </nav>
      </div>

      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link
              className="block px-3 py-2 rounded-md text-base font-medium text-white bg-gray-900"
              href="/"
            >
              Home
            </Link>
            <Link
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-700"
              href="#"
            >
              About
            </Link>
            <Link
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-700"
              href="#"
            >
              Contact
            </Link>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
