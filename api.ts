// Data access layer — all database/storage calls live here, UI stays clean.
// Access control is enforced in the database (row-level security + triggers).
import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";
import { activeChannel, reminderMessage, type ReminderPayload } from "./notifications";

export type Property = Tables<"properties">;
export type Tenant = Tables<"tenants">;
export type RentRecord = Tables<"rent_records">;
export type Agreement = Tables<"agreements">;
export type Deposit = Tables<"deposits">;
export type Complaint = Tables<"maintenance_requests">;
export type ComplaintUpdate = Tables<"complaint_updates">;
export type Profile = Tables<"profiles">;
export type Role = "landlord" | "tenant";

export type TenantWithProperty = Tenant & { properties: Pick<Property, "id" | "name"> | null };
export type RentWithTenant = RentRecord & {
  tenants: Pick<Tenant, "id" | "full_name" | "unit" | "phone"> & {
    properties: Pick<Property, "name"> | null;
  };
};
export type ComplaintWithTenant = Complaint & {
  tenants: Pick<Tenant, "id" | "full_name" | "unit" | "phone"> | null;
  properties: Pick<Property, "name"> | null;
};

function ok<T>(res: { data: T; error: unknown }): NonNullable<T> {
  if (res.error) throw res.error;
  return res.data as NonNullable<T>;
}

// ---------- session ----------
export async function getMe() {
  const { data } = await supabase.auth.getUser();
  const user = data.user;
  if (!user) return null;
  const [{ data: roles }, { data: profile }] = await Promise.all([
    supabase.from("user_roles").select("role").eq("user_id", user.id),
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
  ]);
  const role: Role = roles?.some((r) => r.role === "landlord") ? "landlord" : "tenant";
  return { user, role, profile };
}

export async function updateProfile(id: string, patch: { full_name: string; phone: string }) {
  ok(await supabase.from("profiles").update({ ...patch, updated_at: new Date().toISOString() }).eq("id", id));
}

// ---------- properties ----------
export async function listProperties() {
  return ok(await supabase.from("properties").select("*").order("created_at", { ascending: false }));
}
export async function getProperty(id: string) {
  return ok(await supabase.from("properties").select("*").eq("id", id).single());
}
export async function saveProperty(p: TablesInsert<"properties"> & { id?: string }) {
  const { id, ...rest } = p;
  if (id) return ok(await supabase.from("properties").update(rest).eq("id", id).select().single());
  return ok(await supabase.from("properties").insert(rest).select().single());
}
export async function deleteProperty(id: string) {
  const res = await supabase.from("properties").delete().eq("id", id);
  if (res.error?.code === "23503") throw new Error("Remove the tenants of this property first.");
  ok(res);
}

// ---------- tenants ----------
export async function listTenants(propertyId?: string) {
  let q = supabase.from("tenants").select("*, properties(id, name)").order("created_at", { ascending: false });
  if (propertyId) q = q.eq("property_id", propertyId);
  return ok(await q) as TenantWithProperty[];
}
export async function getTenant(id: string) {
  return ok(await supabase.from("tenants").select("*, properties(id, name)").eq("id", id).single()) as TenantWithProperty;
}
export async function saveTenant(t: TablesInsert<"tenants"> & { id?: string }, depositAmount?: number) {
  const { id, ...rest } = t;
  const row = id
    ? ok(await supabase.from("tenants").update(rest).eq("id", id).select().single())
    : ok(await supabase.from("tenants").insert(rest).select().single());
  if (!id) {
    await supabase.from("deposits").insert({
      tenant_id: row!.id,
      amount: depositAmount ?? 0,
      status: "Received",
      received_on: new Date().toISOString().slice(0, 10),
    });
    await supabase.rpc("generate_monthly_rent");
  }
  return row;
}
export async function deleteTenant(id: string) {
  ok(await supabase.from("tenants").delete().eq("id", id));
}

// tenant self
export async function getMyTenancy(userId: string) {
  const result = await supabase.from("tenants").select("*, properties(id, name, address)").eq("user_id", userId).order("created_at", { ascending: false }).limit(1).maybeSingle();
  if (result.error) throw result.error;
  const t = result.data as (Tenant & { properties: Pick<Property, "id" | "name" | "address"> | null }) | null;
  if (!t) return null;
  const { data: landlord } = await supabase.from("profiles").select("full_name, phone, email").eq("id", t.landlord_id).maybeSingle();
  return { ...t, landlord };
}

// ---------- rent ----------
export async function generateMonthlyRent() {
  await supabase.rpc("generate_monthly_rent");
}
export async function listRent(tenantId?: string) {
  let q = supabase
    .from("rent_records")
    .select("*, tenants(id, full_name, unit, phone, properties(name))")
    .order("period", { ascending: false })
    .order("due_date", { ascending: true });
  if (tenantId) q = q.eq("tenant_id", tenantId);
  return ok(await q) as RentWithTenant[];
}
export async function markPaid(id: string, v: { paid_at: string; method: string; notes?: string }) {
  ok(
    await supabase
      .from("rent_records")
      .update({ status: "paid", paid_at: v.paid_at, method: v.method, notes: v.notes || null, updated_at: new Date().toISOString() })
      .eq("id", id),
  );
  return ok(await supabase.from("rent_records").select("*, tenants(id, full_name, unit, phone, properties(name))").eq("id", id).single()) as RentWithTenant;
}
export async function saveAgreementDates(tenantId: string, start: string | null, end: string | null) {
  if (start && end && end <= start) throw new Error("Expiry date must be after the start date.");
  ok(await supabase.from("tenants").update({ agreement_start: start, agreement_end: end }).eq("id", tenantId));
}
export async function markUnpaid(id: string) {
  ok(await supabase.from("rent_records").update({ status: "due", paid_at: null, method: null, receipt_no: null, updated_at: new Date().toISOString() }).eq("id", id));
}
export async function updateRentAmount(id: string, patch: TablesUpdate<"rent_records">) {
  ok(await supabase.from("rent_records").update(patch).eq("id", id));
}

// ---------- reminders ----------
export async function listReminders() {
  return ok(
    await supabase.from("notifications").select("*, tenants(full_name)").order("created_at", { ascending: false }).limit(50),
  ) as (Tables<"notifications"> & { tenants: { full_name: string } | null })[];
}
export async function sendReminder(r: RentWithTenant, landlordName: string) {
  const payload: ReminderPayload = {
    tenantName: r.tenants.full_name,
    phone: r.tenants.phone,
    amount: Number(r.amount),
    dueDate: r.due_date,
    landlordName,
  };
  const result = await activeChannel.send(payload);
  ok(
    await supabase.from("notifications").insert({
      tenant_id: r.tenant_id,
      rent_record_id: r.id,
      channel: result.channel,
      status: result.status,
      message: reminderMessage(payload),
    }),
  );
  return result;
}

// ---------- agreements ----------
export async function getAgreement(tenantId: string) {
  const result = await supabase.from("agreements").select("*").eq("tenant_id", tenantId).maybeSingle();
  if (result.error) throw result.error;
  return result.data;
}
export async function listAgreements() {
  return ok(await supabase.from("agreements").select("*"));
}
export async function uploadAgreement(tenant: Tenant, file: File) {
  if (file.type !== "application/pdf") throw new Error("Only PDF files are allowed.");
  if (file.size > 10 * 1024 * 1024) throw new Error("File is larger than 10 MB.");
  const existing = await getAgreement(tenant.id);
  const path = `${tenant.landlord_id}/${tenant.id}/${Date.now()}.pdf`;
  const up = await supabase.storage.from("agreements").upload(path, file, { contentType: "application/pdf" });
  if (up.error) throw new Error("Upload failed: " + up.error.message);
  const safeName = file.name.replace(/[^\w.\- ]/g, "").slice(0, 120) || "agreement.pdf";
  if (existing) {
    ok(await supabase.from("agreements").update({ file_path: path, file_name: safeName, uploaded_at: new Date().toISOString() }).eq("id", existing.id));
    await supabase.storage.from("agreements").remove([existing.file_path]);
  } else {
    ok(await supabase.from("agreements").insert({ tenant_id: tenant.id, property_id: tenant.property_id, file_path: path, file_name: safeName }));
  }
}
export async function deleteAgreement(a: Agreement) {
  ok(await supabase.from("agreements").delete().eq("id", a.id));
  await supabase.storage.from("agreements").remove([a.file_path]);
}
export async function agreementUrl(path: string) {
  const { data, error } = await supabase.storage.from("agreements").createSignedUrl(path, 300);
  if (error) throw error;
  return data.signedUrl;
}

// ---------- deposits ----------
export async function getDeposit(tenantId: string) {
  const result = await supabase.from("deposits").select("*").eq("tenant_id", tenantId).maybeSingle();
  if (result.error) throw result.error;
  return result.data;
}
export async function saveDeposit(tenantId: string, d: Omit<TablesInsert<"deposits">, "tenant_id">) {
  const existing = await getDeposit(tenantId);
  const patch = { ...d, updated_at: new Date().toISOString() };
  if (existing) ok(await supabase.from("deposits").update(patch).eq("id", existing.id));
  else ok(await supabase.from("deposits").insert({ ...patch, tenant_id: tenantId }));
}

// ---------- complaints ----------
export async function listComplaints() {
  return ok(
    await supabase
      .from("maintenance_requests")
      .select("*, tenants(id, full_name, unit, phone), properties(name)")
      .order("created_at", { ascending: false }),
  ) as ComplaintWithTenant[];
}
export async function getComplaint(id: string) {
  return ok(
    await supabase.from("maintenance_requests").select("*, tenants(id, full_name, unit, phone), properties(name)").eq("id", id).single(),
  ) as ComplaintWithTenant;
}
export async function listComplaintUpdates(id: string) {
  return ok(await supabase.from("complaint_updates").select("*").eq("request_id", id).order("created_at"));
}
export async function createComplaint(
  tenantId: string,
  v: { category: string; title: string; details: string; urgency: string },
  files: File[],
) {
  const paths: string[] = [];
  for (const f of files.slice(0, 4)) {
    if (!["image/jpeg", "image/png", "image/webp"].includes(f.type)) throw new Error("Photos must be JPG, PNG or WEBP.");
    if (f.size > 5 * 1024 * 1024) throw new Error("Each photo must be under 5 MB.");
    const ext = f.type.split("/")[1];
    const path = `${tenantId}/${crypto.randomUUID()}.${ext}`;
    const up = await supabase.storage.from("complaint-photos").upload(path, f, { contentType: f.type });
    if (up.error) throw new Error("Photo upload failed: " + up.error.message);
    paths.push(path);
  }
  return ok(
    await supabase
      .from("maintenance_requests")
      .insert({ tenant_id: tenantId, landlord_id: (await getTenant(tenantId)).landlord_id, ...v, photos: paths })
      .select()
      .single(),
  );
}
export async function updateComplaint(id: string, patch: { status?: string; worker?: string | null }) {
  ok(await supabase.from("maintenance_requests").update(patch).eq("id", id));
}
export async function replyComplaint(id: string, authorId: string, message: string) {
  ok(await supabase.from("complaint_updates").insert({ request_id: id, author_id: authorId, kind: "reply", message }));
}
export async function photoUrls(paths: string[]) {
  if (!paths.length) return [];
  const { data } = await supabase.storage.from("complaint-photos").createSignedUrls(paths, 600);
  return (data ?? []).map((d) => d.signedUrl).filter(Boolean) as string[];
}

export async function loadDemoData() {
  ok(await supabase.rpc("load_demo_data"));
  await generateMonthlyRent();
}
