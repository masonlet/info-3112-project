"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Menu, X, Heart } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const guestLinks = [
  { href: "/", label: "Home" },
  { href: "/login", label: "Sign In" },
  { href: "/register", label: "Sign Up" },
];

const memberLinks = [
  { href: "/", label: "Home" },
  { href: "/matches", label: "Matches" },
  { href: "/profile", label: "Profile" },
  { href: "/settings", label: "Settings" },
];

const Logo = () => (
  <Link href="/" className="flex items-center gap-2 font-semibold text-lg">
    <Heart className="w-5 h-5 text-rose-500" />
    LookingForLove
  </Link>
);

const supabase = createClient();

export default function Header() {
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setIsLoggedIn(!!user);
      setLoading(false);
    };

    loadUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session?.user);
      setLoading(false);
    });

    return () => { subscription.unsubscribe(); };
  }, []);

  if (loading) return (
    <header className="relative z-50 border-b bg-background px-4 py-3">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        <Logo/>
      </div>
    </header>
  );

  const navLinks = isLoggedIn ? memberLinks : guestLinks;

  return (
    <>
      {menuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 sm:hidden"
          onClick={() => setMenuOpen(false)}
        />
      )}

      <header className="relative z-50 border-b bg-background px-4 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Logo/>

          <nav className="hidden sm:flex items-center gap-2">
            {navLinks.map(({ href, label }) => (
              <Button key={href} variant="ghost" size="sm" asChild>
                <Link href={href}>{label}</Link>
              </Button>
            ))}
          </nav>

          <Button
            variant="ghost"
            size="icon"
            className="sm:hidden"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>

        {menuOpen && (
          <nav className="absolute top-full left-0 right-0 z-50 sm:hidden border-t bg-background flex flex-col gap-1 px-4 py-3">
            {navLinks.map(({ href, label }) => (
              <Button key={href} variant="ghost" className="justify-start" asChild>
                <Link href={href} onClick={() => setMenuOpen(false)}>{label}</Link>
              </Button>
            ))}
          </nav>
        )}
      </header>
    </>
  );
}
