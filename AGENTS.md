<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Keep account-scoped data operations in the imported `src/lib/api.ts` layer and use the managed authenticated route gate for signed-in pages; this preserves database access rules and avoids duplicating auth checks.
- Keep landlord and tenant navigation in a shared workspace shell while giving each task its own route; this keeps mobile navigation consistent and pages shareable.
- Automated reminders run in `src/lib/reminders.server.ts`, triggered daily by pg_cron via `/api/public/hooks/reminders` (token in the RLS-locked `app_cron_tokens` table) and on demand by a landlord server function; `notifications.dedupe_key` is unique so reminders never duplicate.
- Reminder delivery uses Twilio only when TWILIO_ACCOUNT_SID/TWILIO_AUTH_TOKEN/TWILIO_FROM are set; otherwise rows are stored as `demo`, never `sent`, so nothing is falsely shown as delivered.
- Receipts and report exports are generated in the browser (`src/lib/pdf.ts`) from database records; receipt numbers are assigned by a database trigger when rent is marked paid.
