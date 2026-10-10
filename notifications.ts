// Reminder delivery layer. The MVP uses a manual WhatsApp channel (opens a
// pre-filled wa.me chat). To plug in WhatsApp Business API or an SMS gateway
// later, implement ReminderChannel in a server function and swap `activeChannel`.
import { pkr, fmtDate } from "./format";

export type ReminderPayload = {
  tenantName: string;
  phone: string;
  amount: number;
  dueDate: string;
  landlordName: string;
};

export type ReminderResult = { status: "sent" | "failed" | "pending"; channel: string };

export interface ReminderChannel {
  id: string;
  send(p: ReminderPayload): Promise<ReminderResult>;
}

export function reminderMessage(p: ReminderPayload) {
  return `Assalam o Alaikum ${p.tenantName}, this is a friendly reminder that your rent of ${pkr(
    p.amount,
  )} is due on ${fmtDate(p.dueDate)}. Thank you! — ${p.landlordName} (RentAasan)`;
}

export function toWhatsAppNumber(phone: string) {
  let d = phone.replace(/\D/g, "");
  if (d.startsWith("0")) d = "92" + d.slice(1);
  return d;
}

export const whatsappManualChannel: ReminderChannel = {
  id: "whatsapp_manual",
  async send(p) {
    const num = toWhatsAppNumber(p.phone);
    const url = `https://wa.me/${num}?text=${encodeURIComponent(reminderMessage(p))}`;
    if (typeof window !== "undefined") window.open(url, "_blank", "noopener");
    return { status: num ? "sent" : "failed", channel: this.id };
  },
};

export const activeChannel: ReminderChannel = whatsappManualChannel;
