import { createClient } from "@/lib/supabase/server";
import { NavigationBar } from "./navigation-bar";

export async function Navigation() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const signedIn = Boolean(data?.claims?.sub);

  return <NavigationBar signedIn={signedIn} />;
}
