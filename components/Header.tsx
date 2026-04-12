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
  { href: "/membership", label: "Membership" },
  { href: "/settings", label: "Settings" },
];

const pmLinks = [
  { href: "/", label: "Home" },
  { href: "/users/", label: "Users" },  
  { href: "/dashboard", label: "Dashboard" },
  { href: "/membership", label: "Membership" },
  { href: "/settings/", label: "Settings" },
];

const Logo = () => (
  <Link href="/" className="flex items-center gap-2 font-semibold text-lg">
    <Heart className="w-5 h-5 text-rose-500" />
    LookingForLove
  </Link>
);

const supabase = createClient();

function getIsPM(profile: { member_type?: string; role?: string } | null): boolean {
  return profile?.member_type === "Product Manager"
      || profile?.role === "product_manager"
      || profile?.role === "owner"
      || false;
}

async function fetchIsPM(userId: string): Promise<boolean> {
  const { data: profile } = await supabase
    .from("profiles")
    .select("member_type, role")
    .eq("user_id", userId)
    .maybeSingle();
  return getIsPM(profile);
}

export default function Header() {
  const [loading, setLoading]       = useState(true);
  const [menuOpen, setMenuOpen]     = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isPM, setIsPM]             = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setIsPM(await fetchIsPM(user.id));
      setIsLoggedIn(!!user);
      setLoading(false);
    };

    loadUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const user = session?.user;
      if (user) setIsPM(await fetchIsPM(user.id));
      else setIsPM(false);
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

  const navLinks = !isLoggedIn ? guestLinks : isPM ? pmLinks : memberLinks;

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
