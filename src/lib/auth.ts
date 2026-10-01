import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "./supabase";

export async function checkIsAdmin() {
  if (!supabase) return false;
  const { data, error } = await supabase.rpc("is_admin");
  return !error && data === true;
}

type AdminState = { status: "loading" } | { status: "signed-out" } | { status: "admin"; session: Session };

export function useAdminSession(): AdminState {
  const [state, setState] = useState<AdminState>({ status: "loading" });

  useEffect(() => {
    if (!supabase) {
      setState({ status: "signed-out" });
      return;
    }
    let active = true;
    const resolve = async (session: Session | null) => {
      if (!session) return active && setState({ status: "signed-out" });
      const ok = await checkIsAdmin();
      if (!active) return;
      if (!ok) {
        await supabase!.auth.signOut();
        setState({ status: "signed-out" });
      } else {
        setState({ status: "admin", session });
      }
    };
    supabase.auth.getSession().then(({ data }) => resolve(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") setState({ status: "signed-out" });
      // Supabase calls inside this callback can deadlock the auth lock, so defer.
      else if (event === "SIGNED_IN") setTimeout(() => resolve(session), 0);
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return state;
}
