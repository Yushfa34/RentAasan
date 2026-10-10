import { createFileRoute } from "@tanstack/react-router";

// Daily reminder job. The caller must present a server-only token stored in a
// table no browser role can read, so this cannot be triggered by visitors.
export const Route = createFileRoute("/api/public/hooks/reminders")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const token = /^Bearer (\S+)$/.exec(request.headers.get("authorization") ?? "")?.[1];
        if (!token) return new Response("Unauthorized", { status: 401 });
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data } = await supabaseAdmin.from("app_cron_tokens").select("token").eq("name", "reminders").maybeSingle();
        if (!data || data.token.length !== token.length || data.token !== token) return new Response("Unauthorized", { status: 401 });
        const { runReminders } = await import("@/lib/reminders.server");
        return Response.json(await runReminders(supabaseAdmin));
      },
    },
  },
});
