"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export type ProfileRole = "patient" | "doctor" | "admin" | "hospital_admin";

export interface Profile {
  id: string;
  email: string | null;
  role: ProfileRole;
  organization_id: string | null;
  has_password: boolean;
  created_at: string;
  updated_at: string;
}

export function useProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setProfile(null);
        setLoading(false);
        return;
      }
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      setProfile(data as Profile | null);
      setLoading(false);
    };

    fetchProfile();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      fetchProfile();
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  return { profile, loading };
}
