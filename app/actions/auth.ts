"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type AuthFormState = {
  error?: string;
  notice?: string;
};

function stringValue(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

function validEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function signUp(
  _previousState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = stringValue(formData, "email").toLowerCase();
  const password = stringValue(formData, "password");
  const username = stringValue(formData, "username").toLowerCase();
  const fullName = stringValue(formData, "fullName");

  if (!validEmail(email)) return { error: "Enter a valid email address." };
  if (password.length < 8) return { error: "Password must be at least 8 characters." };
  if (!/^[a-z0-9_]{3,30}$/.test(username)) {
    return { error: "Username must be 3–30 lowercase letters, numbers, or underscores." };
  }
  if (fullName.length > 100) return { error: "Full name must be 100 characters or fewer." };

  const requestHeaders = await headers();
  const origin = requestHeaders.get("origin");
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { username, full_name: fullName || undefined },
      ...(origin ? { emailRedirectTo: `${origin}/auth/callback?next=/dashboard` } : {}),
    },
  });

  if (error) return { error: error.message };
  if (!data.session) {
    return { notice: "Check your email to confirm your account, then sign in." };
  }

  redirect("/dashboard");
}

export async function signIn(
  _previousState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = stringValue(formData, "email").toLowerCase();
  const password = stringValue(formData, "password");

  if (!validEmail(email) || !password) return { error: "Enter your email and password." };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: "Invalid email or password." };

  redirect("/dashboard");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
