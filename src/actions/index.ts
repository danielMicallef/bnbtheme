import { ActionError, defineAction } from "astro:actions";
import { z } from "astro:schema";
import { Resend } from "resend";

const text = (value: unknown) => String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[char]!));

async function send(subject: string, replyTo: string, rows: Record<string, unknown>) {
  const apiKey = import.meta.env.RESEND_API_KEY;
  if (!apiKey) throw new ActionError({ code: "INTERNAL_SERVER_ERROR", message: "Email service is not configured." });
  const html = `<h2>${text(subject)}</h2>${Object.entries(rows).map(([key, value]) => `<p><strong>${text(key)}:</strong> ${text(value).replace(/\n/g, "<br>")}</p>`).join("")}`;
  const { data, error } = await new Resend(apiKey).emails.send({
    from: "Sunset Seaview <onboarding@resend.dev>",
    to: [import.meta.env.CONTACT_EMAIL_TO || "delivered@resend.dev"],
    replyTo,
    subject,
    html,
  });
  if (error) throw new ActionError({ code: "BAD_REQUEST", message: error.message });
  return { success: true, id: data?.id };
}

export const server = {
  sendContactEmail: defineAction({
    accept: "form",
    input: z.object({ name: z.string().min(1), email: z.string().email(), message: z.string().min(1) }),
    handler: ({ name, email, message }) => send(`New message from ${name}`, email, { Name: name, Email: email, Message: message }),
  }),
  requestBooking: defineAction({
    accept: "form",
    input: z.object({ name: z.string().min(1), email: z.string().email(), phone: z.string().optional(), checkIn: z.string(), checkOut: z.string(), guests: z.coerce.number().min(1).max(6), paymentPlan: z.enum(["deposit", "full"]), total: z.string(), dueNow: z.string() }),
    handler: (input) => send(`Booking request: ${input.checkIn} to ${input.checkOut}`, input.email, { Name: input.name, Email: input.email, Phone: input.phone, "Check-in": input.checkIn, "Check-out": input.checkOut, Guests: input.guests, "Payment preference": input.paymentPlan, "Amount due now": input.dueNow, "Quoted total": input.total }),
  }),
  requestTransfer: defineAction({
    accept: "form",
    input: z.object({ name: z.string().min(1), email: z.string().email(), flight: z.string().min(1), arrivalDate: z.string(), arrivalTime: z.string(), passengers: z.coerce.number().min(1).max(8), bookingRef: z.string().optional() }),
    handler: (input) => send(`Airport transfer request for ${input.arrivalDate}`, input.email, { Name: input.name, Email: input.email, Flight: input.flight, "Arrival date": input.arrivalDate, "Arrival time": input.arrivalTime, Passengers: input.passengers, "Stay booking reference": input.bookingRef }),
  }),
  requestCarHire: defineAction({
    accept: "form",
    input: z.object({ name: z.string().min(1), drivingLicense: z.string().refine((value) => value === "on", "Please confirm that the lead driver holds a valid driving licence."), email: z.string().email(), pickupDate: z.string(), pickupTime: z.string(), returnDate: z.string(), returnTime: z.string(), passengers: z.coerce.number().min(1).max(8), bookingRef: z.string().optional() }),
    handler: (input) => send(`Car hire request: ${input.pickupDate} to ${input.returnDate}`, input.email, { Name: input.name, Email: input.email, "Driving licence confirmed": "Yes", "Pickup date": input.pickupDate, "Pickup time": input.pickupTime, "Return date": input.returnDate, "Return time": input.returnTime, Passengers: input.passengers, "Stay booking reference": input.bookingRef }),
  }),
};
