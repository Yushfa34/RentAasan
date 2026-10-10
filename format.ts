import { differenceInCalendarDays, format, parseISO } from "date-fns";

export function pkr(n: number | string | null | undefined) {
  const v = Number(n ?? 0);
  return "Rs. " + v.toLocaleString("en-PK", { maximumFractionDigits: 0 });
}

export function fmtDate(d: string | Date | null | undefined, f = "d MMM yyyy") {
  if (!d) return "—";
  return format(typeof d === "string" ? parseISO(d) : d, f);
}

export function monthLabel(period: string) {
  return format(parseISO(period), "MMMM yyyy");
}

export type RentStatus = "Paid" | "Due" | "Overdue";

export function rentStatus(r: { status: string; due_date: string }): RentStatus {
  if (r.status === "paid") return "Paid";
  return differenceInCalendarDays(parseISO(r.due_date), new Date()) < 0 ? "Overdue" : "Due";
}

export function daysUntil(d: string) {
  return differenceInCalendarDays(parseISO(d), new Date());
}

export function dueLabel(d: string) {
  const n = daysUntil(d);
  if (n === 0) return "Due today";
  if (n > 0) return `Due in ${n} day${n === 1 ? "" : "s"}`;
  return `${-n} day${n === -1 ? "" : "s"} overdue`;
}

export function currentPeriod() {
  return format(new Date(), "yyyy-MM-01");
}

export function greeting() {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
}

export function errMsg(e: unknown) {
  if (e && typeof e === "object" && "message" in e) return String((e as { message: unknown }).message);
  return "Something went wrong. Please try again.";
}
