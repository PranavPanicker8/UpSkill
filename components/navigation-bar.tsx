"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "@/app/actions/auth";

type Theme = "light" | "dark";

export function RouteNodeBrandMark({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Starting node */}
      <circle cx="5" cy="12" r="3" className="fill-indigo-600 stroke-indigo-600" />
      {/* Route spine path */}
      <path
        d="M8 12h3.5a2.5 2.5 0 0 1 2.5 2.5v0a2.5 2.5 0 0 0 2.5 2.5H16"
        stroke="#4f46e5"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* Intermediate active waypoint */}
      <circle cx="12" cy="12" r="1.5" className="fill-amber-500 animate-pulse" />
      {/* Destination node */}
      <circle cx="19" cy="17" r="3" stroke="#4f46e5" strokeWidth="2" className="fill-white" />
      {/* Secondary route link */}
      <path
        d="M12 12V9a2.5 2.5 0 0 1 2.5-2.5H16"
        stroke="#cbd5e1"
        strokeWidth="1.75"
        strokeDasharray="2 2"
        strokeLinecap="round"
      />
      <circle cx="19" cy="6.5" r="2" className="fill-slate-300 stroke-slate-400" strokeWidth="1" />
    </svg>
  );
}

export function NavigationBar({ signedIn }: { signedIn: boolean }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initialTheme = savedTheme || (prefersDark ? "dark" : "light");
    setTheme(initialTheme);
    document.documentElement.classList.toggle("dark", initialTheme === "dark");
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  const isCurrent = (path: string) => {
    if (path === "/" && pathname === "/") return true;
    if (path !== "/" && pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/90 bg-white/95 backdrop-blur-md dark:border-slate-700/90 dark:bg-slate-900/95">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Brand Logo with Route-Node Brand Mark */}
        <Link href="/" className="group flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-indigo-100 bg-indigo-50/70 shadow-2xs transition-transform group-hover:scale-105 dark:border-indigo-900/50 dark:bg-indigo-950/30">
            <RouteNodeBrandMark className="h-5 w-5" />
          </div>
          <span className="font-serif-heading text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Upskill
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden items-center gap-1 sm:flex">
          <Link
            href="/roadmaps"
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors ${
              isCurrent("/roadmaps")
                ? "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
            }`}
          >
            Explore Paths
          </Link>

          {signedIn ? (
            <>
              <Link
                href="/dashboard"
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors ${
                  isCurrent("/dashboard")
                    ? "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                }`}
              >
                My Learning
              </Link>
              <div className="mx-2 h-4 w-px bg-slate-200 dark:bg-slate-700" />
              <button
                onClick={toggleTheme}
                type="button"
                className="inline-flex items-center justify-center rounded-lg p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors"
                aria-label={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
                title={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
              >
                {mounted && (
                  <span className="text-lg" aria-hidden="true">
                    {theme === "light" ? "☾" : "☀"}
                  </span>
                )}
              </button>
              <form action={signOut}>
                <button
                  type="submit"
                  className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 shadow-2xs transition-colors hover:bg-slate-50 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-slate-100"
                >
                  Sign out
                </button>
              </form>
            </>
          ) : (
            <>
              <div className="mx-2 h-4 w-px bg-slate-200 dark:bg-slate-700" />
              <button
                onClick={toggleTheme}
                type="button"
                className="inline-flex items-center justify-center rounded-lg p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors"
                aria-label={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
                title={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
              >
                {mounted && (
                  <span className="text-lg" aria-hidden="true">
                    {theme === "light" ? "☾" : "☀"}
                  </span>
                )}
              </button>
              <Link
                href="/login"
                className="rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                className="rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600"
              >
                Get started free
              </Link>
            </>
          )}
        </nav>

        {/* Mobile Menu Button */}
        <div className="flex sm:hidden">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            type="button"
            className="inline-flex items-center justify-center rounded-lg p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="border-t border-slate-200 bg-white px-4 pt-3 pb-5 sm:hidden space-y-2 dark:border-slate-700 dark:bg-slate-900">
          <Link
            href="/roadmaps"
            onClick={() => setMobileMenuOpen(false)}
            className={`block rounded-lg px-3 py-2 text-sm font-medium ${
              isCurrent("/roadmaps") ? "bg-slate-100 text-slate-900 font-semibold dark:bg-slate-800 dark:text-slate-100" : "text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
            }`}
          >
            Explore Paths
          </Link>

          {signedIn ? (
            <>
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className={`block rounded-lg px-3 py-2 text-sm font-medium ${
                  isCurrent("/dashboard") ? "bg-slate-100 text-slate-900 font-semibold dark:bg-slate-800 dark:text-slate-100" : "text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
                }`}
              >
                My Learning
              </Link>
              <div className="pt-2">
                <button
                  onClick={toggleTheme}
                  type="button"
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-center text-sm font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                >
                  {theme === "light" ? "☾ Switch to dark mode" : "☀ Switch to light mode"}
                </button>
              </div>
              <div className="pt-2">
                <form action={signOut}>
                  <button
                    type="submit"
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-center text-sm font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                  >
                    Sign out
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="pt-2 space-y-2">
              <button
                onClick={toggleTheme}
                type="button"
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-center text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              >
                {theme === "light" ? "☾ Switch to dark mode" : "☀ Switch to light mode"}
              </button>
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-center text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full rounded-lg bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600"
              >
                Get started free
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}

