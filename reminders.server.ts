// Automated reminder engine (server-only). Idempotent: each reminder has a
// dedupe_key with a unique index, so re-running never sends duplicates.
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

type Admin = SupabaseClient<Database>;

function todayPk() {
  // Pakistan time (UTC+5) calendar date
  return new Date(Date.now() + 5 * 3600_000).toISOString().slice(0, 10);
}
function daysBetween(a: string, b: string) {
  return Math.round((Date.parse(b) - Date.parse(a)) / 86_400_000);
}
function toIntl(phone: string) {
  let d = (phone || "").replace(/\D/g, "");
  if (d.startsWith("0")) d = "92" + d.slice(1);
  return d ? "+" + d : "";
}
const rs = (n: number) => "Rs. " + Number(n).toLocaleString("en-PK", { maximumFractionDigits: 0 });

export function providerConfigured() {
  return Boolean(process.env['TWILIO_ACCOUNT_SID'] && process.env['TWILIO_AUTH_TOKEN'] && process.env['TWILIO_FROM']);
}

async function deliver(phone: string, body: string): Promise<{ status: string; channel: string; error?: string }> {
  const sid = process.env['TWILIO_ACCOUNT_SID'], token = process.env['TWILIO_AUTH_TOKEN'], from = process.env['TWILIO_FROM'];
  if (!sid || !token || !from) return { status: "demo", channel: "demo" };
  const to = toIntl(phone);
  if (!to) return { status: "failed", channel: "sms", error: "No phone number" };
  const wa = from.startsWith("whatsapp:");
  const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
    method: "POST",
    headers: { Authorization: "Basic " + btoa(`${sid}:${token}`), "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ From: from, To: wa ? `whatsapp:${to}` : to, Body: body }),
  });
  if (!res.ok) return { status: "failed", channel: wa ? "whatsapp" : "sms", error: (await res.text()).slice(0, 300) };
  return { status: "sent", channel: wa ? "whatsapp" : "sms" };
}

type Job = { key: string; kind: string; tenant_id: string; landlord_id: string; rent_record_id: string | null; phone: string; recipient: string; message: string };

export async function runReminders(admin: Admin, landlordId?: string) {
  const today = todayPk();
  const jobs: Job[] = [];

  let rq = admin.from("rent_records").select("id, amount, due_date, tenant_id, landlord_id, tenants(full_name, phone)").neq("status", "paid");
  if (landlordId) rq = rq.eq("landlord_id", landlordId);
  const { data: rent, error: e1 } = await rq;
  if (e1) throw e1;
  for (const r of rent ?? []) {
    const t = r.tenants as { full_name: string; phone: string } | null;
    if (!t) continue;
    const d = daysBetween(today, r.due_date);
    if (d >= 0 && d <= 3) {
      jobs.push({ key: `rent:${r.id}:before`, kind: "rent_before_due", tenant_id: r.tenant_id, landlord_id: r.landlord_id, rent_record_id: r.id, phone: t.phone, recipient: "tenant",
        message: `Assalam o Alaikum ${t.full_name}, your rent of ${rs(r.amount)} is due on ${r.due_date}. — RentAasan` });
    } else if (d < 0) {
      const week = Math.floor((-d - 1) / 7);
      jobs.push({ key: `rent:${r.id}:overdue:${week}`, kind: "rent_overdue", tenant_id: r.tenant_id, landlord_id: r.landlord_id, rent_record_id: r.id, phone: t.phone, recipient: "tenant",
        message: `Dear ${t.full_name}, your rent of ${rs(r.amount)} was due on ${r.due_date} and is ${-d} day(s) overdue. Please pay at the earliest. — RentAasan` });
    }
  }

  let tq = admin.from("tenants").select("id, full_name, unit, landlord_id, agreement_end").eq("status", "Active").not("agreement_end", "is", null);
  if (landlordId) tq = tq.eq("landlord_id", landlordId);
  const { data: tenants, error: e2 } = await tq;
  if (e2) throw e2;
  const ids = [...new Set((tenants ?? []).map((t) => t.landlord_id))];
  const { data: landlords } = ids.length ? await admin.from("profiles").select("id, phone").in("id", ids) : { data: [] };
  for (const t of tenants ?? []) {
    const left = daysBetween(today, t.agreement_end!);
    if (left < 0) continue;
    const T = [7, 15, 30].find((x) => left <= x);
    if (!T) continue;
    jobs.push({ key: `agr:${t.id}:${t.agreement_end}:${T}`, kind: "agreement_expiry", tenant_id: t.id, landlord_id: t.landlord_id, rent_record_id: null,
      phone: landlords?.find((l) => l.id === t.landlord_id)?.phone ?? "", recipient: "landlord",
      message: `RentAasan: the agreement for ${t.full_name} (${t.unit}) expires on ${t.agreement_end} — ${left} day(s) left. Please renew or update it.` });
  }

  const counts = { created: 0, sent: 0, demo: 0, failed: 0 };
  for (const j of jobs) {
    const { data: row } = await admin.from("notifications")
      .upsert({ tenant_id: j.tenant_id, landlord_id: j.landlord_id, rent_record_id: j.rent_record_id, kind: j.kind, dedupe_key: j.key, recipient: j.recipient, channel: "pending", status: "pending", message: j.message },
        { onConflict: "dedupe_key", ignoreDuplicates: true })
      .select("id").maybeSingle();
    if (!row) continue; // already handled earlier
    counts.created++;
    let r: { status: string; channel: string; error?: string };
    try { r = await deliver(j.phone, j.message); } catch (e) { r = { status: "failed", channel: "sms", error: String(e).slice(0, 300) }; }
    counts[r.status as "sent" | "demo" | "failed"]++;
    const { error: ue } = await admin.from("notifications").update({ status: r.status, channel: r.channel, error: r.error ?? null }).eq("id", row.id);
    if (ue) console.error("reminder status update failed", ue);
  }
  return { ...counts, live: providerConfigured() };
}
