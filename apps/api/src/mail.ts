import nodemailer from "nodemailer";
import type { InvitationSettings, RSVP, Wedding } from "@prisma/client";
import { env } from "./env.js";
import { escapeHtml } from "./helpers.js";
import { logger } from "./logger.js";

let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (!env.SMTP_HOST) return null;
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_SECURE,
      auth:
        env.SMTP_USER && env.SMTP_PASS
          ? {
              user: env.SMTP_USER,
              pass: env.SMTP_PASS
            }
          : undefined
    });
  }
  return transporter;
}

export async function sendRsvpNotification(input: {
  wedding: Wedding;
  settings: InvitationSettings | null;
  rsvp: RSVP;
  eventNames: string[];
}) {
  const { wedding, settings, rsvp } = input;
  if (!settings?.notifyOnRsvp || !settings.rsvpNotifyEmail) return false;
  const mailer = getTransporter();
  if (!mailer) {
    logger.info("RSVP notification skipped because SMTP is not configured");
    return false;
  }
  const attending = rsvp.attendance === "ATTENDING";
  const subject = `${attending ? "New RSVP" : "Declined RSVP"} — ${rsvp.guestName}`;
  const rows: Array<[string, string]> = [
    ["Guest", rsvp.guestName],
    ["Phone", rsvp.phone || "Not provided"],
    ["Response", attending ? "Will attend" : "Unable to attend"],
    ["Guests", String(rsvp.guestCount)],
    ["Events", input.eventNames.length ? input.eventNames.join(", ") : "Not specified"],
    ["Message", rsvp.message || "No message"]
  ];
  const html = `
    <div style="font-family:Georgia,serif;background:#f5ebdd;padding:32px;color:#49372f">
      <div style="max-width:560px;margin:0 auto;background:#fff;border:1px solid #b89555;padding:32px">
        <p style="letter-spacing:3px;text-transform:uppercase;color:#b89555;font-size:12px">Royal Blush RSVP</p>
        <h1 style="font-weight:400;color:#762f43;margin:8px 0 24px">${escapeHtml(wedding.title)}</h1>
        <table style="width:100%;border-collapse:collapse">
          ${rows
            .map(
              ([label, value]) =>
                `<tr><td style="padding:10px 0;border-bottom:1px solid #eee3d3;color:#9a7b57;width:120px">${escapeHtml(label)}</td><td style="padding:10px 0;border-bottom:1px solid #eee3d3">${escapeHtml(value)}</td></tr>`
            )
            .join("")}
        </table>
        <p style="margin-top:24px;font-size:12px;color:#9a7b57">Submitted ${rsvp.createdAt.toISOString()}</p>
      </div>
    </div>
  `;
  try {
    await mailer.sendMail({
      from: env.SMTP_FROM,
      to: settings.rsvpNotifyEmail,
      subject,
      html
    });
    return true;
  } catch (error) {
    logger.error({ error }, "RSVP notification email failed");
    return false;
  }
}
