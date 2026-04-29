"use client";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo
} from "react";
import { createClient } from "@/lib/supabase/client";
import { MemberType, isPMType } from "@/lib/roles";

type UserState = {
  memberType: MemberType | null;
  role: string;
  isPM: boolean;
  isLoggedIn: boolean;
  loading: boolean;
  refresh: () => Promise<void>;
};

const UserContext = createContext<UserState | null>(null);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const supabase = useMemo(() => createClient(), []);
  const [memberType, setMemberType] = useState<MemberType | null>(null);
  const [role, setRole] = useState("member");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setIsLoggedIn(false);
      setMemberType(null);
      setRole("member");
      setLoading(false);
      return;
    }
    const { data: profile } = await supabase
      .from("profiles")
      .select("member_type, role")
      .eq("user_id", user.id)
      .maybeSingle();
    
    setIsLoggedIn(true);
    setMemberType((profile?.member_type as MemberType) ?? "Free");
    setRole(profile?.role ?? "member");
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    refresh();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      refresh();
    });
    return () => subscription.unsubscribe();
  }, [supabase, refresh]);

  return (
    <UserContext.Provider value={{
      memberType,
      role,
      isPM: isPMType(role),
      isLoggedIn,
      loading,
      refresh,
    }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used within UserProvider");
  return ctx;
}
