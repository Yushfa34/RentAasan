import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const runRemindersNow = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: roles } = await context.supabase.from("user_roles").select("role").eq("user_id", context.userId);
    if (!roles?.some((r) => r.role === "landlord")) throw new Error("Only landlords can run reminders.");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { runReminders } = await import("./reminders.server");
    return runReminders(supabaseAdmin, context.userId);
  });

export const reminderMode = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async () => {
    const { providerConfigured } = await import("./reminders.server");
    return { live: providerConfigured() };
  });
